import React from 'react';
import FileBrowser from "./filebrowser";
import Panel from "./panel";
import PanelContainer from './panelcontainer';

const img_utils = require('../../../core/Image');

class PixelSorter extends React.Component{

    state = {
        img_loaded: false,
        img: null,
        imgdata: null,
        img_width: 800,
        img_height: 640,
        img_path:'',
        w: 0,
        h: 0,
        ctx: null,
        r_val: 0,
        g_val: 0,
        b_val: 0,
        r_f_val: 1,
        g_f_val: 1,
        b_f_val: 1,
        isPersistent: false,
        isVertical: false,
        isContiguous: true,
        isReverse: false,
        isFilterEnabled: true,
        isHue: false,
        isAutoUpdate: false,
    };

    constructor(props){
        super(props);
        this.props.set_title('PixelSorter つ ◕_◕ ༽つ');
        this.state.img_path = this.props.defaultimg;
        this.subsort = this.subsort.bind(this);
        this.bg_running = false;
    }

    componentDidMount() {
        const img = this.refs.image;
        img.onload = this.load_image;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.state.isAutoUpdate)
            this.do_sort();
    }

    reset = () => {
        this.setState({
            r_val: 0,
            g_val: 0,
            b_val: 0,
            r_f_val: 0,
            g_f_val: 0,
            b_f_val: 0,
        });
        this.update_img_path(this.state.img_path);
    }
    hue_reset = () => {
        this.setState({
            r_val: 0,
            g_val: 0,
            b_val: 0,
        });
    }
    filter_reset = () => {
        this.setState({
            r_f_val: 0,
            g_f_val: 0,
            b_f_val: 0,
        });
    }

    onChange_slider = (e) => {
        this.setState({[e.target.getAttribute('stateparam')]:e.target.value});
    }
    onChange_checkbox = (e) => {
        this.setState({[e.target.getAttribute('stateparam')]:e.target.checked});
    }

    update_img_path = (path) => {
        this.setState({img_loaded: false, img_path:encodeURI(path)});
        this.load_image();
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
        const imgdata = ctx.getImageData(0,0,canvas.width, canvas.height);
        this.setState({imgdata:imgdata})
        this.setState({img: new img_utils.Image(imgdata)},
            () => {
                ctx.putImageData(this.state.img.getImageData(), 0, 0);
            });
    }

    sort_between = (row, comparison, filter ) => {
        //let row = img.pixels[y];
       // img.pixels[y] = row.sort(comparison);
        const n = row.length;
        const s = this.state;
        const thresh = new Uint32Array(
            [s.r_f_val,
                s.g_f_val,
                s.b_f_val]);
        const hue = new Uint32Array(
            [s.r_val,
                s.g_val,
                s.b_val]);
        for(let i = 0; i < n; i++){
            if(filter(thresh, row[i])) {
                const start = i;
                let end = i;
                for(; i < n; i++){
                    if(filter(thresh, row[i]))
                        end = i;
                    else if(this.state.isContiguous)
                        break;
                }
                const rowbeg = row.slice(0, start);
                let rowsort = row.slice(start, end).sort(comparison);
                if(this.state.isHue)
                    rowsort = this.adj_hue(rowsort, hue);
                const rowend = row.slice(end);
                row.set(rowbeg, 0);
                row.set(rowsort, start);
                row.set(rowend, end);
                i = end;
            }
        }
        return row;
    }

    adj_hue = (row, hue) => {
        const res = new Uint8ClampedArray(row.buffer);
        const n = res.length;
        for(let i = 0; i < n; i += 4) {
            res[i] += hue[0];
            res[i + 1] += hue[1];
            res[i + 2] += hue[2];
        }
        return new Uint32Array(res.buffer);
    }
    compare = (...args) => {
        const pix = new Uint8ClampedArray(new Uint32Array(args).buffer);
       // console.log(pix);
        const a = pix[0] + pix[1] + pix[2];
        const b = pix[4] + pix[5] + pix[6];
        if(this.state.isReverse)
            return a - b;
        return b - a;
    }

    filter = (thresh, ...pix) => {
        if(!this.state.isFilterEnabled)
            return true;
        pix = new Uint8ClampedArray(new Uint32Array(pix).buffer);
      //  console.log(pix, hue);
        return pix[0] >= thresh[0]
        && pix[1] >= thresh[1]
        && pix[2] >= thresh[2];
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
        let img = this.state.img;

        if(!this.state.isPersistent)
            img = new img_utils.Image(this.state.imgdata);

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
        const sliderStyle = {

        }
        return(
        <PanelContainer>
                <Panel style={panelStyle} title="art">
                    <canvas style={canvStyle} ref="canvas" width={this.state.img_width} height={this.state.img_height} />
                </Panel>

            <Panel  title="controls">

                <Panel title="hue adjust">
                    <form onSubmit={this.do_sort} className="form-group">
                <input  type="range"
                        min="-255"
                        max='255'
                        stateparam='r_val'
                        className='form-control'
                        value={this.state.r_val}
                        onChange={this.onChange_slider}
                        style={sliderStyle}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        stateparam='r_val'
                        className='form-control'
                        value={this.state.r_val}
                        onChange={this.onChange_slider}
                        style={redStyle}
                /><br/>

                <input  type="range"
                        min="-255"
                        max='255'
                        stateparam='g_val'
                        className='form-control'
                        value={this.state.g_val}
                        onChange={this.onChange_slider}
                        style={sliderStyle}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        stateparam='g_val'
                        className='form-control'
                        value={this.state.g_val}
                        onChange={this.onChange_slider}
                        style={greenStyle}
                /><br/>

                <input  type="range"
                        min="-255"
                        max='255'
                        stateparam='b_val'
                        className='form-control'
                        value={this.state.b_val}
                        onChange={this.onChange_slider}
                        style={sliderStyle}
                />
                <input  type="number"
                        min="-255"
                        max='255'
                        stateparam='b_val'
                        className='form-control'
                        value={this.state.b_val}
                        onChange={this.onChange_slider}
                        style={blueStyle}
                /><br/>
               <label>enabled
                <input
                    type='checkbox'
                    style={cbAlign}
                    stateparam="isHue"
                    className='form-control'
                    checked={this.state.isHue}
                    onChange={this.onChange_checkbox}
                />
               </label>
                <button
                    ref="hue_reset"
                    className="btn btn-primary btn-ghost"
                    type="button"
                    onClick={this.hue_reset}>reset</button>
                    </form>
                </Panel >
                <Panel title="threshold">
                    <form onSubmit={this.do_sort} className="form-group">
                <input  type="range"
                        min="0"
                        max='256'
                        stateparam='r_f_val'
                        className='form-control'
                        value={this.state.r_f_val}
                        onChange={this.onChange_slider}
                        style={sliderStyle}
                />
                <input  type="number"
                        min="0"
                        max='256'
                        stateparam='r_f_val'
                        className='form-control'
                        value={this.state.r_f_val}
                        onChange={this.onChange_slider}
                        style={redStyle}
                /><br/>

                <input  type="range"
                        min="0"
                        max='256'
                        stateparam='g_f_val'
                        className='form-control'
                        value={this.state.g_f_val}
                        onChange={this.onChange_slider}
                        style={sliderStyle}
                />
                 <input type="number"
                        min="0"
                        max='256'
                        stateparam='g_f_val'
                        className='form-control'
                        value={this.state.g_f_val}
                        onChange={this.onChange_slider}
                        style={greenStyle}
                /><br/>

                <input  type="range"
                        min="0"
                        max='256'
                        stateparam='b_f_val'
                        className='form-control'
                        value={this.state.b_f_val}
                        onChange={this.onChange_slider}
                        style={sliderStyle}
                />
                <input  type="number"
                        min="0"
                        max='256'
                        stateparam='b_f_val'
                        className='form-control'
                        value={this.state.b_f_val}
                        onChange={this.onChange_slider}
                        style={blueStyle}
                /><br/>
                <button
                    ref="filter_reset"
                    className="btn btn-primary btn-ghost"
                    type="button"
                    onClick={this.filter_reset}>reset</button>
                <label>enabled
                    <input
                        type='checkbox'
                        style={cbAlign}
                        className='form-control'
                        stateparam="isFilterEnabled"
                        checked={this.state.isFilterEnabled}
                        onChange={this.onChange_checkbox}
                    />
                </label>
                    </form>
                </Panel>
                    <Panel title='settings' className='settingsPanel'>
                        <form onSubmit={this.do_sort} className="form-group">
                <label>vertical
                    <input
                        type='checkbox'
                        style={cbAlign}
                        stateparam="isVertical"
                        className='form-control'
                        checked={this.state.isVertical}
                        onChange={this.onChange_checkbox}
                    />
                </label>

                <label>persistent
                    <input
                        type='checkbox'
                        style={cbAlign}
                        stateparam="isPersistent"
                        className='form-control'
                        checked={this.state.isPersistent}
                        onChange={this.onChange_checkbox}
                    />
                </label>
                <label>contiguous
                    <input
                        type='checkbox'
                        style={cbAlign}
                        stateparam="isContiguous"
                        className='form-control'
                        checked={this.state.isContiguous}
                        onChange={this.onChange_checkbox}
                    />
                </label>
                <label>reverse sort
                    <input
                        type='checkbox'
                        style={cbAlign}
                        stateparam="isReverse"
                        className='form-control'
                        checked={this.state.isReverse}
                        onChange={this.onChange_checkbox}
                    />
                </label>
                <label>auto update?
                    <input
                        type='checkbox'
                        style={cbAlign}
                        stateparam="isAutoUpdate"
                        className='form-control'
                        checked={this.state.isAutoUpdate}
                        onChange={this.onChange_checkbox}
                    />
                </label></form>

                    </Panel>
                    <form onSubmit={this.do_sort} className="form-group">
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
                <Panel title="About">
                    <p> Hit Enter to generate new image without clicking <b>sort</b></p>
                    <ul className="clt">
                        <li><b>Hue</b>: adjusts hue of pixels chosen for sorting</li>
                        <li><b>Threshold</b>: determines which pixels are sorted</li>
                        <li><b>Persistent</b>: applies sort to previous result</li>
                        <li><b>Contiguous</b>: will only sort contiguous chunks of pixels<br/>
                            that are within the threshold.Default behavior sorts<br/>
                            from the first and last pixel within a row that are<br/>
                            within the threshold</li>
                    </ul>
                </Panel>

            </Panel>
            <Panel><FileBrowser callback={this.update_img_path}/></Panel>

        </PanelContainer>
        )
    }
}

export default PixelSorter;