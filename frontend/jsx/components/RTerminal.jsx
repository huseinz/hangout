/** This is a dummy terminal component. Simply displays text that is fed into it **/

import React from 'react';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import ReactDOM from "react-dom";

class RTerminal extends React.Component{
    state = {
        text: 'sup'
    };

    constructor(props){
        super(props);
        this.state.text = this.props.text + '\n\r' || '';
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
        this.term.fit();
        console.log(`size: ${this.term.cols} columns, ${this.term.rows} rows`);
        this.term.write(this.state.text);
        this.term.focus();
    }

    writeLine = (text) => {
        this.term.write('> ' + text + "\n\r");
    }

    render() {
        return(
                <div className="hack dark" id="terminal"></div>
        );
    }
}

export default RTerminal;