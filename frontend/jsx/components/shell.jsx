import React from 'react';
import io from 'socket.io-client';
import RTerminal from './rterminal';

class Shell extends React.Component{
    constructor(props) {
        super(props);
        this.termRef = React.createRef();
        this.socket = io.connect("http://localhost:7000/shell");
    }

    componentDidMount() {
        this.socket.on('connect', () => {
            // For all shell data, write it to the terminal
            this.socket.on("data", (data) => {
                this.termRef.current.write(data);
            });
        });
    }

    handleUserInput = (data) => {
        // For all terminal data, write it to the socket
        this.socket.emit('data', data);
    };

    render() {
        return (<RTerminal {...this.props} ref={this.termRef} sendData_cb={this.handleUserInput}/>);
    }
}

export default Shell;