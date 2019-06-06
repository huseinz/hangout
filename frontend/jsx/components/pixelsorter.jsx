import React from 'react';
import FileBrowser from "./filebrowser";
import Panel from "./panel";
import PanelContainer from './panelcontainer';

import uint32 from 'uint32';

const img_utils = require('../../../core/Image');

class PixelSorter extends React.Component{

    state = {
        img_loaded: false,
        img: null,
        imgdata: null,
        img_width: 800,
        img_height: 640,
        w: 0,
        h: 0,
        ctx: null,
        red_slider_val: 0,
        green_slider_val: 0,
        blue_slider_val: 0,
        red_f_slider_val: 0,
        green_f_slider_val: 0,
        blue_f_slider_val: 0,
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
        console.log("this ran", encodeURI(path));
        this.setState({img_path:encodeURI(path)});
        //const img = this.refs.image;
        //img.src = this.state.img_path;
    }

    componentDidMount() {
        const img = this.refs.image;
        img.onload = this.load_image;
    }

    load_image = () => {

        const img = this.refs.image;

        const canvas = this.refs.canvas;
        canvas.setAttribute("width", img.width);
        canvas.setAttribute("height", img.height);
        const ctx = canvas.getContext("2d");
        this.setState({img_loaded:true, ctx:ctx,
                          img_width:img.width, img_height:img.height,
                          w:canvas.width, h:canvas.height});
        ctx.drawImage(img, 0, 0, img.width, img.height,
        0, 0, canvas.width, canvas.height);
        let imgdata = ctx.getImageData(0,0,canvas.width, canvas.height);
        this.setState({imgdata:imgdata})
        this.setState({img: new img_utils.Image(imgdata)});
        ctx.putImageData(this.state.img.getImageData(), 0,0);
    }

    reset = () => {
        this.setState({
            red_slider_val: 0,
            green_slider_val: 0,
            blue_slider_val: 0,
            red_f_slider_val: 0,
            green_f_slider_val: 0,
            blue_f_slider_val: 0,
        });
        this.load_image();
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
    onChange_red_f_slider = (e) => {
        this.setState({red_f_slider_val: e.target.value});
    }
    onChange_green_f_slider = (e) => {
        this.setState({green_f_slider_val:e.target.value});
    }
    onChange_blue_f_slider = (e) => {
        this.setState({blue_f_slider_val:e.target.value});
        this.do_sort();
    }
    sort_after = (img, y, comparison, filter ) => {
        let row = img.pixels[y];
        for (let i = 0; i < row.length; i++) {
            if (filter(row[i])) {
                img.pixels[y] = row.slice(0, i).concat(row.slice(i).sort(comparison));
                //row.splice(i, newrow.length, newrow);
                break;
            }
        }
    }
    sort_between = (img, y, comparison, filter ) => {
        let row = img.pixels[y];
       // img.pixels[y] = row.sort(comparison);
        for(let i = 0; i < row.length; i++){
            if(filter(row[i])) {
                let start = i;
                let end = i;
                for(; i < row.length; i++){
                    //if(i % 1000 === 0)
                      //`  console.log( this.state.red_f_slider_val);
                    if(filter(row[i]))
                        end = i;
                    else
                        break;
                }
                let rowbeg = row.slice(0, start);
                let rowsort = row.slice(start, end).sort(comparison);
                let rowend = row.slice(end);
                img.pixels[y].set(rowbeg, 0);
                img.pixels[y].set(rowsort, start);
                img.pixels[y].set(rowend, end);
                i = end;
                //break;
            }
        }
    }
    compare = (a, b) => {
            let s = this.state;
            let sliderval = 0;
                sliderval += s.red_slider_val << 16;
                sliderval += s.green_slider_val << 8;
                sliderval += s.blue_slider_val;
            return b - a ;
    }

    filter = (pix) => {
        let s = this.state;
        pix = new Uint8ClampedArray(new Uint32Array([pix]).buffer);
       // console.log(pix);
        return pix[0] > s.red_f_slider_val
        && pix[1] > s.green_f_slider_val
        && pix[2] > s.blue_f_slider_val;
        //console.log(pix, sliderval);
        //return pix > sliderval;
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

    handleDraw = (e) => {
        setTimeout(this.do_sort(e), 1000);
        this.setState({});
    }
    do_sort = (e) => {
        if(e)
            e.preventDefault();

        /*
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
        let img = new img_utils.Image(this.state.imgdata);
        /*for(let x = 0; x < this.state.w; x++){
            img.setColumn(img.getColumn(x).sort(this.compare), x);
        }
        */
        for(let y = 0; y < this.state.h; y++){
            this.sort_between(img, y, this.compare,this.filter);
        }
        //this.sort_between(img, 20, this.compare,this.filter);


        console.log("this ran");
        this.state.ctx.putImageData(img.getImageData(), 0,0);
    }

    render() {
        const redStyle = {color: 'red',};
        const greenStyle = {color: 'green',};
        const blueStyle = {color: 'blue',};
        const imgStyle = {
            display: 'none',
            height: 'auto',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
        };
        const canvStyle = {
            height: 'auto',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
        };
        const panelStyle = {
            maxWidth: '100vw',
            padding: '1px',
        };
        return(
            <PanelContainer>
                <Panel style={panelStyle} title="art">
                    <canvas style={canvStyle} ref="canvas" width={this.state.img_width} height={this.state.img_height} />
                </Panel>

                <Panel><FileBrowser callback={this.update_img_path}/></Panel>

            <Panel style={panelStyle} title="controls">
                <form onSubmit={this.do_sort} className="form-group">
                <Panel title="weight">
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
                </Panel>
                <Panel title="filter">
                <p style={redStyle}>{this.state.red_f_slider_val}</p>
                <input  type="range"
                        min="-255"
                        max='255'
                        value={this.state.red__f_slider_val}
                        onChange={this.onChange_red_f_slider}
                        style={redStyle}
                        onMouseUp={this.do_sort}
                />

                <p style={greenStyle}>{this.state.green_f_slider_val}</p>
                <input  type="range"
                        min="-255"
                        max='255'
                        value={this.state.green_f_slider_val}
                        onChange={this.onChange_green_f_slider}
                        style={greenStyle}
                        onMouseUp={this.do_sort}
                />

                <p style={blueStyle}>{this.state.blue_f_slider_val}</p>
                <input  type="range"
                        min="-255"
                        max='255'
                        value={this.state.blue_f_slider_val}
                        onChange={this.onChange_blue_f_slider}
                        style={blueStyle}
                        onMouseUp={this.handleDraw}
                />
                </Panel>
                <button ref="draw" className="btn btn-primary btn-ghost" type="submit">sort</button>
                <button ref="reset" className="btn btn-primary btn-ghost" onClick={this.reset}>reset</button>
                <img    ref="image" src={this.state.img_path} style={imgStyle}/>
                </form>
            </Panel>
            </PanelContainer>
        )
    }
}

export default PixelSorter;