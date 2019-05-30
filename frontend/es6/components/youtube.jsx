import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client/dist/socket.io'

import YouTube from 'react-youtube'

class MyYT extends React.Component{

    state = {
        playlistIndex: 0,
        startTime: 0,
        yt: '',
    };

    constructor(props){
        super(props);
        this.socket_in = io.connect('/yt', {forceNew: true});
        this.socket_out = io.connect('/yt', {forceNew: true});


        this.YTReady = this.YTReady.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePlayerChange = this.handlePlayerChange.bind(this);
        this.clicked = this.clicked.bind(this);
        this.props.set_title("yalla!!");
    }

    handleInputChange(e){
        this.setState({vidurl: e.target.value});
    }

    clicked(){
        const i = this.yt.getPlaylistIndex();
        const s = this.yt.getCurrentTime();
        this.socket_out.emit("send_update", {'playlistIndex': i, 'time': s, 'state': this.yt_data});
        //this.setState({playlistIndex: i, startTime: s});
    }

    handlePlayerChange(e){
        this.yt = e.target;
        this.yt_data = e.data;
        const yt = this.yt;
        console.log(e);
        console.log("pc i:", yt.getPlaylistIndex(), "pc s:", yt.getCurrentTime(), "state:", e.data);
    }

    YTReady(e){
        this.yt = e.target;
        this.yt_data = e.data;
        const data = this.yt.getVideoData();

        console.log("ytready:", data);

        this.yt.playVideoAt(this.state.playlistIndex);
        this.yt.seekTo(this.state.startTime, true);
        this.props.set_title(data['title']);
    }

    handleSubmit(e){
        this.setState({videoId:this.state.vidurl});
    }
    componentDidMount(e) {
        console.log("did mount:", this.state.startTime);

        fetch('/yt/sync', {credentials: 'same-origin'})
            .then((response) => {
                    response.json().then((data) => {
                            this.setState({playlistIndex: data.playlist_index, startTime: data.start_time});
                        }
                    );
                }
            );
        this.socket_in.on("recv_update", data => {
            console.log("video index:", data.playlistIndex, "seconds:", data.time, 'state:', data.state);
            this.yt.playVideoAt(data.playlistIndex);
            this.yt.seekTo(data.time);
            if(this.yt_data !== data.state){
                if(data.state === 1){
                    this.yt.playVideo();
                }
                if(data.state === 2){
                    this.yt.stopVideo();
                }
                if(data.state === 5){
                    this.yt.playVideo();
                }
            }

//            this.setState({playlistIndex: data.playlistIndex, startTime: data.time});
        });
    }


    render() {

        const opts = {
            height: '390',
            width: '640',
            playerVars: {
                start: this.state.startTime,
                autoplay: 0,
                list: "PLXwuPYCYtM9mLmPIayFHJu13IIzzh1Lv2",
                listType: "playlist",
                host: 'http://www.youtube.com',
            }
        };

        return (<div>
                    <button onClick={this.clicked}>reset</button>
                    <YouTube opts={opts} onReady={this.YTReady} onStateChange={this.handlePlayerChange}/>
                    <form>
                        <input type="text" value={this.state.vidurl} onChange={this.handleInputChange}/>
                    </form>
                </div>)
    }
}

export default MyYT;