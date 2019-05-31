from flask import render_template
from flask import send_from_directory
from flask import request, after_this_request
from flask import Markup, jsonify
import flask_login
import glob
import random
import json
import datetime

from .config import *
from .sockethandler import *

from .user import User


@app.route('/')
@flask_login.login_required
def index():
    fantanos = glob.glob("./static/img/fantano/*")
    fantanofn = random.choice(fantanos)

    return render_template('hello.html', fantanofn=fantanofn)
    return redirect(url_for('util'))


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


@app.route('/login', methods = ['POST','GET'])
def userlogin():
    if request.method == 'POST':
        username = request.form['username']
        user = User.get(username)
        if user is not None:
            session['username'] = username
            user.is_authenticated = True
            flask_login.login_user(user, remember=False)
            User.login(user)
            print("POST", flask_login.current_user)
            return redirect(url_for('index'))

    return render_template('login.html')


@app.route('/logout')
def userlogout():
    user = flask_login.current_user
    User.logout(user)
    @after_this_request
    def update(response):
        user.sync_user_data()
        return response
    return render_template('login.html')


@app.route('/<path:filename>')
@flask_login.login_required
def serve_file(filename):
    return send_from_directory("/", filename)


@app.route('/youtube-chat')
@flask_login.login_required
def youtube_chat():
    user = flask_login.current_user
    posts = mongo.db.posts.find()
    @after_this_request
    def update(response):
        user.sync_user_data()
        return response
    return render_template('youtube-chat.html', posts=list(posts))


@app.route('/yt/queue/add', methods = ["POST"])
@flask_login.login_required
def add_to_yt_queue():

    data = request.get_json()
    user = flask_login.current_user
    url = data.get('url')

    db_id = mongo.db.yt_queue.insert_one({'username': user.username, 'url': url}).inserted_id
    mongo.db.yt_queue.update({'_id': db_id}, {'$set': {'timestamp': datetime.datetime.utcnow()}})

    return jsonify(success=True)


@app.route('/yt/sync', methods=["GET"])
def get_current_yt_video():

    yt = list(mongo.db.ytstate.find({}, {'_id': False}))[0]
    print(yt)

    return jsonify(playlist_index=yt['playlist_index'], start_time=yt['time'], success=True)


@app.route('/yt/sync', methods=["POST"])
def set_current_yt_video():

    data = request.get_json()

    yt = list(mongo.db.ytstate.update_one({}, {'_id': False}))[0]
    print(yt)

    return jsonify(playlist_index=yt['playlist_index'], start_time=yt['time'], success=True)


@app.route('/hack-me')
@flask_login.login_required
def shell():
    user = flask_login.current_user
    if user.shell_pid is None:
        sockethandler.shell_setup(user)
    @after_this_request
    def update(response):
        user.sync_user_data()
        return response
    return render_template('pyshell.html')


@app.route('/util', methods=['GET'])
@flask_login.login_required
def util():
    user = flask_login.current_user
    @after_this_request
    def update(response):
        user.sync_user_data()
        return response

    return render_template('util.html', sysutils=user.utils_available)


@app.route('/user/util/', methods=['GET'])
@flask_login.login_required
def get_utils():

    user = flask_login.current_user
    if user is not None:
        return jsonify(utils=json.dumps(user.utils))
    abort(500)


@app.route('/user/util/add', methods=['POST'])
@flask_login.login_required
def add_util():

    @after_this_request
    def update(response):
        user.sync_user_data()
        return response

    req = request.get_json()
    util = req.get('util')
    if util:
        user = flask_login.current_user
        user.add_util(util)
        return '', 200

    return jsonify(message="Bad request"), 400


@app.route('/ls')
@flask_login.login_required
def myls():
    def generate_tree(path, html="", hidden=False):

        html += "<ul class=\"clt\" style=\"display: %s;\">\n" % ("none" if hidden else "block")

        for file in sorted([f for f in os.listdir(path) if not (f.startswith('.') or f.startswith('_'))],
                            key=lambda f: f.lower()):
            rel = path + "/" + file
            if os.path.isdir(rel):
                html += "<li class=\"clt dir\" onclick=\"dirClicked(this)\">%s\n" % (file)
                html += generate_tree(rel, hidden=True)
                html += "</li>\n"
            else:
                html += "<a href=\"%s\">\n" % (rel)
                html += "<li class=\"clt file\" onclick=\"fileClicked(this)\">%s</li>\n" % (file)
                html += "</a>\n"

        html += "</ul>\n"
        return html
    html = Markup(generate_tree("."))

    return render_template('ls.html', files=html)

