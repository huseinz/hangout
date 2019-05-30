from .config import *
from .user import User
import flask_login
import termios
import psutil
import time
from flask_socketio import emit

### PTY ###

def set_winsize(fd, row, col, xpix=0, ypix=0):
    winsize = struct.pack("HHHH", row, col, xpix, ypix)
    try:
        fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
    except OSError:
        print("panic.")

def shell_setup(user):
    print("new client connected")

    if user.shell_pid or user.shell_fd:
        print("existing shell", user.shell_fd)
        return

    # create child process attached to a pty we can read from and write to
    (pid, fd) = pty.fork()
    if pid == 0:
        # this is the child process fork.
        # anything printed here will show up in the pty, including the output
        # of this subprocess
        subprocess.run(app.config["cmd"])
    else:
        # this is the parent process fork.
        # store child fd and pid
        user.shell_pid = pid
        user.shell_fd = fd
        user.sync_user_data()
        set_winsize(fd, 80, 100)
        cmd = " ".join(shlex.quote(c) for c in app.config["cmd"])
        print("child pid and fd is", flask_login.current_user.shell_pid, 
                                     flask_login.current_user.shell_fd)
        
        @copy_current_request_context 
        def read_and_forward_pty_output(app, pid, fd):
            max_read_bytes = 1024 * 20
            with app.app_context():
                print("subtask", pid, fd)
                while fd and psutil.pid_exists(pid):
                    socketio.sleep(0.01)
                    timeout_sec = 0
                    try:
                        (data_ready, _, _) = select.select([int(fd)], [], [], timeout_sec)
                        if data_ready:
                            output = os.read(fd, max_read_bytes).decode('utf8','ignore')
                            user.shell_hist += output
                            user.shell_hist = user.shell_hist[-10000:]
                            socketio.emit("pty-output", {"output": output}, namespace="/pty")
                    except OSError:
                        print("panic.")
                        return
                print("subtask ended for:", pid, fd)
                user.sync_user_data()

        print("background task started for", user)
        socketio.start_background_task(read_and_forward_pty_output, app, pid, fd)


@socketio.on("pty-input", namespace="/pty")
@flask_login.login_required
def pty_input(data):
    user = flask_login.current_user
    fd = user.shell_fd
    try:
        if fd:
            data = data['input'].encode()
            os.write(fd, data)
    except OSError:
        print("panic.")


@socketio.on("resize", namespace="/pty")
@flask_login.login_required
def resize(data):
    pass
#    print("resize triggered")
#    user = flask_login.current_user
#    if user.shell_fd is None:
#        return
#    set_winsize(user.shell_fd, data["rows"], data["cols"])


@socketio.on("disconnect", namespace="/pty")
@flask_login.login_required
def termdisconnect():
    print("client disconnected")

@socketio.on("connect", namespace="/pty")
@flask_login.login_required
def termconnect():
    user = flask_login.current_user
    if user.shell_pid is None:
        shell_setup(user)
    print("socket connect", user)
    output = user.shell_hist
    output = output.splitlines(True)[-10:]
    output = ''.join(output)

    socketio.emit("pty-output", {"output": output}, namespace="/pty")


### PTY ###

## COMMS ###
@socketio.on("userpost", namespace="/comm")
@flask_login.login_required
def newpost(data):
    print("%s says %s" % (data['username'], data['message']))
    mongo.db.posts.insert_one(data)
    socketio.emit("postfeed", dumps(list(mongo.db.posts.find())), namespace="/comm")


def forwardPosts(sockname="postfeed"):
    while True:
        socketio.sleep(1)
        socketio.emit(sockname, dumps(list(mongo.db.posts.find())), namespace="/comm")


@socketio.on("connect", namespace="/comm")
def chatconnect():
    print("chat client connected")
    socketio.emit("postfeed", dumps(list(mongo.db.posts.find())), namespace="/comm")
#    socketio.start_background_task(target=forwardPosts)
### COMMS ###

### YOUTUBE ###

@socketio.on("connect", namespace="/yt")
def ytconnect():
    print("yt client connected")
   #  send client current player state

@socketio.on("send_update", namespace="/yt")
def ytvidchange(data):
    print("Updating player state to ", data)
    emit("recv_update", data, broadcast=True)
    mongo.db.ytstate.update_one({}, {'$set':{'playlist_index':data['playlistIndex'], 'time':data['time'], 'state':data['state']}})

### YOUTUBE ###
