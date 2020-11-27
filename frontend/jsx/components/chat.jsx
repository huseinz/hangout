import React from "react";
import { CSSTransition } from 'react-transition-group'

class Chat extends React.Component {
  state = {
    str_message: "",
    content: "",
    inProp: true
  };

  handleInputChange(e) {
    this.setState({ str_message: e.target.value });
  }

  sendMessage(e) {
    e.preventDefault();
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
    const transition = {
    //  animation: 'slide-right 0.4s ease'
    };

    for (let i = 0; i < posts.length; i++) {
      buffer.push(

          <CSSTransition
              in={this.state.inProp}
              timeout={500}
              classNames='my-node'
              key={posts[i].uuid}
              appear
          >
            <div className="chatelem">
                    <b> {posts[i].username}: </b>
                    {posts[i].message}
            </div>
          </CSSTransition>);
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
      <div className="chat">
        <div id="postbox">
          {this.state.content}
        </div>
        <input
          className="warning"
          type="hidden"
          value={this.state.str_message}
          onChange={this.handleInputChange}
        />
        <form className="inputbox">
            <label>MESSAGE:</label>
            <textarea
              className="form-control form-textarea"
              value={this.state.str_message}
              onChange={this.handleInputChange}
            ></textarea>
          <button
              className="btn btn-default btn-ghost"
              id="sendbtn"
              type="button"
              onClick={this.sendMessage}
          >
            SEND
          </button>
        </form>
      </div>
    );
  }
}

export default Chat;
