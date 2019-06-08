import React, { Component } from "react";
import ReactDOM from "react-dom";

class PxTerm extends React.Component {
  constructor(props) {
    super(props);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(webLinks);
    Terminal.applyAddon(search);
    this.term = new Terminal({
      cursorBlink: true,
      macOptionIsMeta: true,
      scrollback: true,
      fontSize: 12
    });
    this.termsocket = io.connect("/pty");
    this.status = document.getElementById("status");
    this.wait_ms = 50;
    this.fitToscreen = this.fitToscreen.bind(this);
    this.props.set_title("pxterm.js");
  }

  fitToscreen() {
    this.term.fit();
    this.termsocket.emit("resize", {
      cols: this.term.cols,
      rows: this.term.rows
    });
  }

  debounce(func, wait_ms) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);

      timeout = setTimeout(() => func.apply(context, args), wait_ms);
    };
  }

  componentDidMount(e) {
    var term = this.term;
    var termsocket = this.termsocket;
    var tdiv = ReactDOM.findDOMNode(this);
    term.open(tdiv);
    term.fit();
    console.log(`size: ${term.cols} columns, ${term.rows} rows`);
    term.on("key", (key, ev) => {
      console.log("pressed key", key);
      console.log("event", ev);
      termsocket.emit("pty-input", { input: key });
    });
    termsocket.on("pty-output", function(data) {
      console.log("new output", data);
      //  this.fitToscreen();
      term.write(data.output);
    });

    termsocket.on("connect", () => {
      //this.fitToscreen()
      // status.innerHTML = '<span style="background-color: lightgreen;">connected</span>'
    });

    termsocket.on("disconnect", () => {
      //  status.innerHTML = '<span style="background-color: #ff8383;">disconnected</span>'
    });

    window.onresize = this.debounce(this.fitToscreen, this.wait_ms);
  }
  render() {
    return <div className="hack dark term" id="terminal"></div>;
  }
}

export default PxTerm;
