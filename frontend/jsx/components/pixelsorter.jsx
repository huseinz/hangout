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
        isPersistent: false,
        isVertical: false,
        isContiguous: true,
        isReverse: false,
    };

    constructor(props){
        super(props);
        this.props.set_title('PixelSorter');
        this.state.img_path = this.props.defaultimg;
        this.subsort = this.subsort.bind(this);
        this.bg_running = false;
    }

    update_img_path = (path) => {
        this.setState({img_loaded: false, img_path:encodeURI(path)});
        this.load_image();
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
        this.setState({img: new img_utils.Image(imgdata)},
            () => {
                ctx.putImageData(this.state.img.getImageData(), 0, 0);
            });
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
        this.update_img_path(this.state.img_path);
    }
    hue_reset = () => {
        this.setState({
            red_slider_val: 0,
            green_slider_val: 0,
            blue_slider_val: 0,
        });
    }
    filter_reset = () => {
        this.setState({
            red_f_slider_val: 0,
            green_f_slider_val: 0,
            blue_f_slider_val: 0,
        });
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
    }
    handleDraw = (e) => {
        setTimeout(this.do_sort(e), 1000);
        this.setState({});
    }
    handlePersistent = (e) =>{
        this.setState({isPersistent: e.target.checked});
    }
    handleVertical = (e) =>{
        this.setState({isVertical: e.target.checked});
    }
    handleContiguous = (e) =>{
        this.setState({isContiguous: e.target.checked},
            () => {this.do_sort()});
    }
    handleReverse = (e) =>{
        this.setState({isReverse: e.target.checked},
            () => {this.do_sort()});
    }


    sort_after = (img, y, comparison, filter ) => {
        let row = img.pixels[y];
        for (let i = 0; i < row.length; i++) {
            if (filter(row[i])) {
                img.pixels[y].set(row.slice(i).sort(comparison), i);
                break;
            }
        }
    }
    sort_between = (row, comparison, filter ) => {
        //let row = img.pixels[y];
       // img.pixels[y] = row.sort(comparison);
        for(let i = 0; i < row.length; i++){
            if(filter(row[i])) {
                let start = i;
                let end = i;
                for(; i < row.length; i++){
                    if(filter(row[i]))
                        end = i;
                    else if(this.state.isContiguous)
                        break;
                }
                let rowbeg = row.slice(0, start);
                let rowsort = row.slice(start, end).sort(comparison);
                rowsort = this.adj_hue(rowsort);
                let rowend = row.slice(end);
                row.set(rowbeg, 0);
                row.set(rowsort, start);
                row.set(rowend, end);

                i = end;
            }
        }
        return row;
    }

    adj_hue = (row) => {
        let s = this.state;
        let res = new Uint8ClampedArray(row.buffer);
        let hue = new Uint32Array(
            [s.red_slider_val,
                s.green_slider_val,
                s.blue_slider_val]);
        for(let i = 0; i < res.length; i += 4) {
            res[i] += hue[0];
            res[i + 1] += hue[1];
            res[i + 2] += hue[2];
        }
        return new Uint32Array(res.buffer);
    }
    compare = (a, b) => {
            if(this.state.isReverse)
                return a - b;
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

    do_sort = (e) => {
        if(e)
            e.preventDefault();
        if(!this.state.img_loaded)
            return;
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
        let img = this.state.img;

        if(!this.state.isPersistent)
            img = new img_utils.Image(this.state.imgdata);
        /*for(let x = 0; x < this.state.w; x++){
            img.setColumn(img.getColumn(x).sort(this.compare), x);
        }
        */
        if(this.state.isVertical){
            for(let x = 0; x < this.state.w; x++){
                let newcol = this.sort_between(img.getColumn(x), this.compare, this.filter);
                img.setColumn(newcol, x);
            }
        }
        else {
            for (let y = 0; y < this.state.h; y++) {
                this.sort_between(img.pixels[y], this.compare, this.filter);
            }
        }
        this.setState({img:img});
        //this.sort_between(img, 20, this.compare,this.filter);

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
        const cbAlign = {
            float: 'right',
            marginTop: '5px',
        };
        return(
            <PanelContainer>
                <Panel style={panelStyle} title="art">
                    <canvas style={canvStyle} ref="canvas" width={this.state.img_width} height={this.state.img_height} />
                </Panel>
            <Panel style={panelStyle} title="controls">
                <form onSubmit={this.do_sort} className="form-group">
                <Panel title="hue adjust">
                <input  type="range"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.red_slider_val}
                        onChange={this.onChange_red_slider}
                        style={redStyle}
                        onMouseUp={this.do_sort}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.red_slider_val}
                        onChange={this.onChange_red_slider}
                        style={redStyle}
                /><br/>

                <input  type="range"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.green_slider_val}
                        onChange={this.onChange_green_slider}
                        style={greenStyle}
                        onMouseUp={this.do_sort}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.green_slider_val}
                        onChange={this.onChange_green_slider}
                        style={greenStyle}
                /><br/>

                <input  type="range"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.blue_slider_val}
                        onChange={this.onChange_blue_slider}
                        style={blueStyle}
                        onMouseUp={this.do_sort}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.blue_slider_val}
                        onChange={this.onChange_blue_slider}
                        style={blueStyle}
                /><br/>
                <button
                    ref="hue_reset"
                    className="btn btn-primary btn-ghost"
                    type="button"
                    onClick={this.hue_reset}>reset</button>
                </Panel >
                <Panel title="filter">
                <input  type="range"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.red_f_slider_val}
                        onChange={this.onChange_red_f_slider}
                        style={redStyle}
                        onMouseUp={this.do_sort}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.red_f_slider_val}
                        onChange={this.onChange_red_f_slider}
                        style={redStyle}
                /><br/>

                <input  type="range"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.green_f_slider_val}
                        onChange={this.onChange_green_f_slider}
                        style={greenStyle}
                        onMouseUp={this.do_sort}
                />
                 <input  type="number"
                        min="-255"
                        max='255'
                         className='form-control'
                        value={this.state.green_f_slider_val}
                        onChange={this.onChange_green_f_slider}
                        style={greenStyle}
                /><br/>

                <input  type="range"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.blue_f_slider_val}
                        onChange={this.onChange_blue_f_slider}
                        style={blueStyle}
                        onMouseUp={this.do_sort}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        className='form-control'
                        value={this.state.blue_f_slider_val}
                        onChange={this.onChange_blue_f_slider}
                        style={blueStyle}
                        onMouseUp={this.do_sort}
                /><br/>
                <button
                    ref="filter_reset"
                    className="btn btn-primary btn-ghost"
                    type="button"
                    onClick={this.filter_reset}>reset</button>

                </Panel>
                    <Panel title='settings'>
                <label>vertical
                    <input
                        type='checkbox'
                        style={cbAlign}
                        className='form-control'
                        checked={this.state.isVertical}
                        onChange={this.handleVertical}
                    />
                </label>
                    <br/>
                <label>persistent
                    <input
                        type='checkbox'
                        style={cbAlign}
                        className='form-control'
                        checked={this.state.isPersistent}
                        onChange={this.handlePersistent}
                    />
                </label><br/>
                <label>contiguous
                    <input
                        type='checkbox'
                        style={cbAlign}
                        className='form-control'
                        checked={this.state.isContiguous}
                        onChange={this.handleContiguous}
                    />
                </label><br/>
                    <label>reverse sort
                        <input
                            type='checkbox'
                            style={cbAlign}
                            className='form-control'
                            checked={this.state.isReverse}
                            onChange={this.handleReverse}
                        />
                    </label>
                    </Panel>
                <button
                    ref="draw"
                    className="btn btn-primary btn-ghost"
                    type="submit">sort</button>
                <button
                    ref="reset"
                    className="btn btn-primary btn-ghost"
                    type="button"
                    onClick={this.reset}>reset</button>

                <img
                    ref="image"
                    src={this.state.img_path}
                    style={imgStyle}/>
                </form>
            </Panel>

            <Panel><FileBrowser callback={this.update_img_path}/></Panel>
            </PanelContainer>
        )
    }
}

export default PixelSorter;