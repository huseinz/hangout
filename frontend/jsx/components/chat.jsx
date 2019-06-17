import React from "react";

class Chat extends React.Component {
  state = {
    str_message: "pls change",
    content: ""
  };

  handleInputChange(e) {
    this.setState({ str_message: e.target.value });
  }

  sendMessage() {
    if (this.state.str_message.length === 0) return;

    let post = {
      username: "notzubir",
      message: this.state.str_message
    };
    this.chatsocket.emit("userpost", post);
    this.setState({ str_message: "" });
  }

  refreshPosts(posts) {
    console.log("refreshing");
    posts = JSON.parse(posts);
    let buffer = [];
    for (let i = posts.length - 1; i >= 0; i--) {
      buffer.push(<h1> {posts[i].username} </h1>);
      buffer.push(<p>{posts[i].message}</p>);
    }
    this.setState({ content: buffer });
  }

  constructor(props) {
    super(props);
    this.props.set_title("Chat");
    this.chatsocket = io.connect("/chat");
    this.handleInputChange = this.handleInputChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.refreshPosts = this.refreshPosts.bind(this);
    this.chatsocket.on("postfeed", this.refreshPosts);
  }

  render() {
    return (
      <div>
        <div id="postbox">{this.state.content}</div>
        <input
          className="warning"
          type="hidden"
          value={this.state.str_message}
          onChange={this.handleInputChange}
        />
        <form className="form">
          <fieldset className="form-group form-textarea">
            <label>MESSAGE:</label>
            <textarea
              className="form-control"
              value={this.state.str_message}
              onChange={this.handleInputChange}
            ></textarea>
          </fieldset>
        </form>
        <button
          className="btn btn-default btn-ghost"
          id="sendbtn"
          onClick={this.sendMessage}
        >
          SEND
        </button>
      </div>
    );
  }
}

export default Chat;
