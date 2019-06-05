import React from 'react';
import FileBrowser from "./filebrowser";
import Panel from "./panel";

const img_utils = require('../../../core/Image');

class PixelSorter extends React.Component{

    state = {
        img_loaded: false,
        img: null,
        imgdata: null,
        img_width: 0,
        img_height: 0,
        w: 0,
        h: 0,
        ctx: null,
        red_slider_val: 10,
        green_slider_val: 10,
        blue_slider_val: 10,
        img_path:'',
    };

    constructor(props){
        super(props);
        this.props.set_title('PixelSorter');
        this.state.img_path = this.props.defaultimg;
        this.subsort = this.subsort.bind(this);
        this.bg_running = false;
    }

    update_img_path = (path) => {
        console.log("this ran", path);
        this.setState({img_path:"/img/" + path});
        const img = this.refs.image;
        img.src = "/img/" + path;
    }

    componentDidMount() {
        const canvas = this.refs.canvas;
        //canvas.style.width ='50%';
        //canvas.style.height='50%';
        const ctx = canvas.getContext("2d");
        const img = this.refs.image;

        img.onload = this.load_image;
    }

    load_image = () => {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        const img = this.refs.image;
        this.setState({img_loaded:true, ctx:ctx,
                          img_width:img.width, img_height:img.height,
                          w:canvas.width, h:canvas.height});
        ctx.drawImage(img, 0, 0, img.width, img.height,
        0, 0, canvas.width, canvas.height);
        let imgdata = ctx.getImageData(0,0,canvas.width, canvas.height);
        this.setState({imgdata:imgdata})
        this.setState({img: new img_utils.Image(imgdata, canvas.width, canvas.height)});
        this.setState({orig_img: new img_utils.Image(imgdata, canvas.width, canvas.height)});
        ctx.putImageData(this.state.img.getImageData(), 0,0);
    }


    onChange_red_slider = (e) => {
        this.setState({red_slider_val: e.target.value});
    }
    onChange_green_slider = (e) => {
        this.setState({green_slider_val:e.target.value});
    }
    onChange_blue_slider = (e) => {
        this.setState({blue_slider_val:e.target.value});
    }
    sort_after = (img, y, comparison, filter ) => {
        let row = img.pixels[y];
        for(let i = 0; i < row.length; i++){
            if(filter(row[i])) {
                img.pixels[y] = row.slice(0,i).concat(row.slice(i).sort(comparison));
                //row.splice(i, newrow.length, newrow);
                break;
            }
        }
    }
    compare = (a, b) => {
            let suma = a[0] - this.state.red_slider_val + a[1] - this.state.green_slider_val + a[2] - this.state.blue_slider_val;
            let sumb = b[0] + b[1] + b[2];
            return sumb - suma;
    }

    filter = (pix) => {
        return pix[0] > this.state.red_slider_val
            && pix[1] > this.state.red_slider_val
            && pix[2] > this.state.red_slider_val
    }

    *subsort(img, h){
        for(let y = 0; y < h; y++){
            this.sort_after(img, y, this.compare,this.filter);
            if(!(y % 50)){
                this.state.ctx.putImageData(img.getImageData(), 0,0);
                yield;
            }
        }
    }

    do_sort = () => {/*
        if(!this.bg_running) {
            let img = new img_utils.Image(this.state.imgdata, this.state.w, this.state.h);
            const gen = this.subsort(img, this.state.h);
            setInterval(() => {
                let next = gen.next();
                this.bg_running = true;
                if (next.done) {
                    this.bg_running = false;
                    return;
                }
            }, 0);
        }*/
        let img = new img_utils.Image(this.state.imgdata, this.state.w, this.state.h);
        for(let y = 0; y < this.state.h; y++){
            this.sort_after(img, y, this.compare,this.filter);
            }
        this.state.ctx.putImageData(img.getImageData(), 0,0);
    }

    render() {
        const buttonStyle = {color: 'black',};
        const redStyle = {color: 'red',};
        const greenStyle = {color: 'green',};
        const blueStyle = {color: 'blue',};
        return(
            <div>
                <Panel title="art">
                    <canvas ref="canvas" width={640} height={425} />
                </Panel>

                <Panel><FileBrowser callback={this.update_img_path}/></Panel>

            <Panel title="controls">

                <p style={redStyle}>{this.state.red_slider_val}</p>
                <input  type="range"
                        min="-255"
                        max='255'
                        value={this.state.red_slider_val}
                        onChange={this.onChange_red_slider}
                        style={redStyle}
                        onMouseUp={this.do_sort}
                />

                <p style={greenStyle}>{this.state.green_slider_val}</p>
                <input  type="range"
                        min="-255"
                        max='255'
                        value={this.state.green_slider_val}
                        onChange={this.onChange_green_slider}
                        style={greenStyle}
                        onMouseUp={this.do_sort}
                />

                <p style={blueStyle}>{this.state.blue_slider_val}</p>
                <input  type="range"
                        min="-255"
                        max='255'
                        value={this.state.blue_slider_val}
                        onChange={this.onChange_blue_slider}
                        style={blueStyle}
                        onMouseUp={this.do_sort}
                />

                <button ref="draw" onClick={this.do_sort} style={buttonStyle}>Draw</button>
                <img    ref="image" src={this.state.img_path} style={{display: "none"}} />
            </Panel>
            </div>
        )
    }
}

export default PixelSorter;