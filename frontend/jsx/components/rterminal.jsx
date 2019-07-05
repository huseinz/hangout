/** This is a dummy terminal component. Simply displays text that is fed into it **/

import React from 'react';
import ReactDOM from "react-dom";

import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

class RTerminal extends React.Component{
    constructor(props){
        super(props);
        this.text = this.props.text + '\n\r';
        this.props.set_title(this.props.title || "Log");
        Terminal.applyAddon(fit);
        this.term = new Terminal({
            cursorBlink: true,
            macOptionIsMeta: true,
            scrollback: true,
            fontSize: 12,
            theme: {
                foreground: '#00ffff'
            },
            cols: 50,
        });
    }

    componentDidMount() {
        let tdiv = ReactDOM.findDOMNode(this);
        this.term.open(tdiv);
        this.term.write(this.text);
        this.term.fit();
        this.term.on("data", (data) => {
            this.props.sendData_cb(data);
        });
        console.log(`size: ${this.term.cols} columns, ${this.term.rows} rows`);
    }

    writeLine = (text) => {
        this.term.write('> ' + text + "\n\r");
    };
    write = (text) => {
        this.term.write(text);
    };

    render() {
        return(<div className="hack dark" id="terminal"></div>);
    }
}

RTerminal.defaultProps = {
    sendData_cb: (n) => {},
    text: "sup"
};

export default RTerminal;