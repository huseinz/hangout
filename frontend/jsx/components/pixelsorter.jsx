import React from "react";
import FileBrowser from "./filebrowser";
import Panel from "./panel";
import PanelContainer from "./panelcontainer";
import RTerminal from "./RTerminal";
const validFilename = require('valid-filename');

let worker = new Worker("/js/sort_worker.js");


const img_utils = require("../../../core/Image");

class PixelSorter extends React.Component {
  state = {
    img_loaded: false,
    orig_imgdata: null,
    imgdata: null,
    img_width: 800, //placeholder
    img_height: 640, //placeholder
    img_path: "",
    img_element: null,
    max_width: window.innerWidth,
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
    isHue: true,
    isAutoUpdate: false,
    isWorkerRunning: false,
    mouseDown: false,

    uploadError: false
  };

  constructor(props) {
    super(props);
    this.props.set_title("PixelSorter つ ◕_◕ ༽つ");
    this.state.img_path = this.props.defaultimg;
    this.termRef = React.createRef();

    this.state.img_element = new Image();
    this.state.img_element.src = this.state.img_path;

    worker.onmessage = (e) => {
      this.setState({imgdata: new ImageData(e.data.rawimgdata, this.state.w, this.state.h), isWorkerRunning: false});
      this.state.ctx.putImageData(this.state.imgdata, 0, 0);
      this.writeLog("finished: " + e.data.totalCompares + ' total comparisons in ' + e.data.totalTime/1000 + "s");
    };
  }

  componentDidMount() {
    this.state.img_element.onload = this.load_image;
  }

  writeLog = (text) => {
    this.termRef.current.writeLine(text);
  }

  reset = () => {
    this.setState({
      r_val: 0,
      g_val: 0,
      b_val: 0,
      r_f_val: 0,
      g_f_val: 0,
      b_f_val: 0
    });
    this.update_img_path(this.state.img_path);
  };
  hue_reset = () => {
    this.setState({
      r_val: 0,
      g_val: 0,
      b_val: 0
    });
  };
  filter_reset = () => {
    this.setState({
      r_f_val: 0,
      g_f_val: 0,
      b_f_val: 0
    });
  };

  onChange_slider = e => {
    this.setState({ [e.target.getAttribute("stateparam")]: e.target.value });
    if (this.state.isAutoUpdate && !this.state.mouseDown) {
      this.do_sort();
    }
  };
  onChange_checkbox = e => {
    this.setState({ [e.target.getAttribute("stateparam")]: e.target.checked });
    if (this.state.isAutoUpdate) {
      this.do_sort();
    }
  };

  update_img_path = path => {
    this.state.img_element.src = path;
    this.setState({ img_loaded: false, img_path: encodeURI(path) });
  };

  load_image = () => {
    const img = this.state.img_element;

    const canvas = this.refs.canvas;
  //  canvas.setAttribute('width', window.innerWidth);
  //  canvas.setAttribute('height', window.innerHeight);

    const ctx = canvas.getContext("2d");
    this.setState({
      img_loaded: true,
      ctx: ctx,
      img_width: img.width,
      img_height: img.height,
      w: canvas.width,
      h: canvas.height
    });

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.setState({ orig_imgdata: imgdata });
    this.setState({ imgdata: imgdata }, () => {
      ctx.putImageData(imgdata, 0, 0);
    });
    this.writeLog("loaded " + '\'' + this.state.img_path + '\' ' + img.width + 'x' + img.height);
  };

  save_image = (e) => {
    e.preventDefault();
    console.log(this.refs.save.value);

    let dir = 'img/saved';

    if(!validFilename(this.refs.save.value.trim())){
        console.log('fix ur filename');
        this.setState({uploadError: true});
        setTimeout(() => {this.setState({uploadError: false})}, 5000);
        return;
    }

    let fn = this.refs.save.value.trim() + ".png";
    let b64 = this.refs.canvas.toDataURL();

    fetch('/pixelsorter/upload', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        b64: b64,
        filename: fn,
        dir: "img/saved"
      })
    })
        .then(() => {
          console.log('save fetch complete');
        })
        .catch(err => {
          console.log(err.text());
        });

    this.writeLog("wrote your image to " + '\'/' + dir + '/' + fn + '\'');
  };

  do_sort = e => {
    if (e) e.preventDefault();
    if (!this.state.img_loaded) return;
    let img = this.state.isPersistent ? this.state.imgdata : new ImageData(this.state.orig_imgdata.data.slice(), this.state.w, this.state.h);

    this.termRef.current.writeLine("sorting...");

    if(!this.state.isWorkerRunning) {
      this.setState({isWorkerRunning: true});
      worker.postMessage({
        w: this.state.w,
        h: this.state.h,
        r_val: this.state.r_val,
        g_val: this.state.g_val,
        b_val: this.state.b_val,
        r_f_val: this.state.r_f_val,
        g_f_val: this.state.g_f_val,
        b_f_val: this.state.b_f_val,
        isVertical: this.state.isVertical,
        isContiguous: this.state.isContiguous,
        isReverse: this.state.isReverse,
        isFilterEnabled: this.state.isFilterEnabled,
        isHue: this.state.isHue,
        rawimgdata: img.data,
      }, [img.data.buffer]);
    }

  };

  render() {

    const redStyle = { color: "red" };
    const greenStyle = { color: "green" };
    const blueStyle = { color: "blue" };
    const imgStyle = {
      visibility: 'hidden',
    /*  height: "100%",
      width: "100%",
      maxWidth: "100%",

      flexShrink: 0,
      alignSelf: "center"*/
    };
    const canvStyle = {
      objectFit: "contain",
      /*
      height: this.state.h,
      width: this.state.w,
      maxWidth: this.state.w,
      flexShrink: 0,
      objectFit: "contain"*/
    };
    const panelStyle = {
      maxWidth: "100vw",
      padding: "1px"
    };
    const cbAlign = {
      float: "right",
      marginTop: "5px"
    };
    const sliderStyle = {};
    return (
      <PanelContainer>

        {/** CONTROL PANEL **/}
        <Panel title="actions" className="controlPanel">
          <Panel title="hue adjust">
            <form onSubmit={this.do_sort} className="form-group">
              <input
                type="range"
                min="-255"
                max="255"
                stateparam="r_val"
                className="form-control"
                value={this.state.r_val}
                onChange={this.onChange_slider}
                style={sliderStyle}
              />
              <input
                type="number"
                min="-255"
                max="255"
                stateparam="r_val"
                className="form-control"
                value={this.state.r_val}
                onChange={this.onChange_slider}
                style={redStyle}
              />
              <br />

              <input
                type="range"
                min="-255"
                max="255"
                stateparam="g_val"
                className="form-control"
                value={this.state.g_val}
                onChange={this.onChange_slider}
                style={sliderStyle}
              />
              <input
                type="number"
                min="-255"
                max="255"
                stateparam="g_val"
                className="form-control"
                value={this.state.g_val}
                onChange={this.onChange_slider}
                style={greenStyle}
              />
              <br />

              <input
                type="range"
                min="-255"
                max="255"
                stateparam="b_val"
                className="form-control"
                value={this.state.b_val}
                onChange={this.onChange_slider}
                style={sliderStyle}
              />
              <input
                type="number"
                min="-255"
                max="255"
                stateparam="b_val"
                className="form-control"
                value={this.state.b_val}
                onChange={this.onChange_slider}
                style={blueStyle}
              />
              <br />
              <label>
                enabled
                <input
                  type="checkbox"
                  style={cbAlign}
                  stateparam="isHue"
                  className="form-control"
                  checked={this.state.isHue}
                  onChange={this.onChange_checkbox}
                />
              </label>
              <button
                ref="hue_reset"
                className="btn btn-primary btn-ghost"
                type="button"
                onClick={this.hue_reset}
              >
                reset
              </button>
                <button
                    style={{display: 'none', maxWidth:0, maxHeight: 0}}
                    type="submit"
                />
            </form>
          </Panel>
          <Panel title="threshold">
            <form onSubmit={this.do_sort} className="form-group">
              <input
                type="range"
                min="0"
                max="256"
                stateparam="r_f_val"
                className="form-control"
                value={this.state.r_f_val}
                onChange={this.onChange_slider}
                style={sliderStyle}
              />
              <input
                type="number"
                min="0"
                max="256"
                stateparam="r_f_val"
                className="form-control"
                value={this.state.r_f_val}
                onChange={this.onChange_slider}
                style={redStyle}
              />
              <br />

              <input
                type="range"
                min="0"
                max="256"
                stateparam="g_f_val"
                className="form-control"
                value={this.state.g_f_val}
                onChange={this.onChange_slider}
                style={sliderStyle}
              />
              <input
                type="number"
                min="0"
                max="256"
                stateparam="g_f_val"
                className="form-control"
                value={this.state.g_f_val}
                onChange={this.onChange_slider}
                style={greenStyle}
              />
              <br />

              <input
                type="range"
                min="0"
                max="256"
                stateparam="b_f_val"
                className="form-control"
                value={this.state.b_f_val}
                onChange={this.onChange_slider}
                style={sliderStyle}
              />
              <input
                type="number"
                min="0"
                max="256"
                stateparam="b_f_val"
                className="form-control"
                value={this.state.b_f_val}
                onChange={this.onChange_slider}
                style={blueStyle}
              />
              <br />

              <label>
                enabled
                <input
                  type="checkbox"
                  style={cbAlign}
                  className="form-control"
                  stateparam="isFilterEnabled"
                  checked={this.state.isFilterEnabled}
                  onChange={this.onChange_checkbox}
                />
              </label>
                <button
                    ref="filter_reset"
                    className="btn btn-primary btn-ghost"
                    type="button"
                    onClick={this.filter_reset}
                >
                    reset
                </button>
                <button
                    style={{display: 'none', maxWidth:0, maxHeight: 0}}
                    type="submit"
                    />
            </form>
          </Panel>
          <form onSubmit={this.do_sort} className="form-group">
            <button
              ref="draw"
              className="btn btn-primary btn-ghost"
              type="submit"
            >
              sort
              {this.state.isWorkerRunning && <span className='loading' style={{maxHeight:'60%'}}></span>}
            </button>
            <button
              ref="reset"
              className="btn btn-primary btn-ghost"
              type="button"
              onClick={this.reset}
            >
              reset
            </button>
            <img ref="image" src='' style={imgStyle} />
          </form>

          {/** SAVE IMAGE **/}
          <form onSubmit={this.save_image}>
            <input
                type='text'
                className='form-control'
                ref='save'
            />.png
            <button
                className="btn btn-primary btn-ghost"
                type='submit'>
              save
            </button>
          </form>
          {this.state.uploadError ? <div className="alert alert-error">fix ur filename</div> : <span></span>}
          {/** SAVE IMAGE **/}
        </Panel>
        {/** CONTROL PANEL **/}

        {/** SETTINGS PANEL **/}
        <Panel title="settings" className="settingsPanel">
          <form onSubmit={this.do_sort} className="form-group">
            <label>
              vertical
              <input
                type="checkbox"
                style={cbAlign}
                stateparam="isVertical"
                className="form-control"
                checked={this.state.isVertical}
                onChange={this.onChange_checkbox}
              />
            </label>

            <label>
              persistent
              <input
                type="checkbox"
                style={cbAlign}
                stateparam="isPersistent"
                className="form-control"
                checked={this.state.isPersistent}
                onChange={this.onChange_checkbox}
              />
            </label>
            <label>
              contiguous
              <input
                type="checkbox"
                style={cbAlign}
                stateparam="isContiguous"
                className="form-control"
                checked={this.state.isContiguous}
                onChange={this.onChange_checkbox}
              />
            </label>
            <label>
              reverse sort
              <input
                type="checkbox"
                style={cbAlign}
                stateparam="isReverse"
                className="form-control"
                checked={this.state.isReverse}
                onChange={this.onChange_checkbox}
              />
            </label>
            <label>
              auto update
              <input
                type="checkbox"
                style={cbAlign}
                stateparam="isAutoUpdate"
                className="form-control"
                checked={this.state.isAutoUpdate}
                onChange={this.onChange_checkbox}
              />
            </label>
              <button
                  style={{display: 'none', maxWidth:0, maxHeight: 0}}
                  type="submit"
              />
          </form>
        </Panel>
        {/** SETTINGS PANEL **/}

        {/** FILEBROWSER PANEL **/}
        <Panel>
          <FileBrowser endpoint="/pixelsorter/upload" callback={this.update_img_path} />
        </Panel>
        {/** FILEBROWSER PANEL **/}

        {/** TERMINAL PANEL **/}
        <Panel>
          <RTerminal ref={this.termRef} text="welcome :)"/>
        </Panel>
        {/** TERMINAL PANEL **/}

        {/** ABOUT PANEL **/}
        <Panel title="About" className='aboutPanel'>
          <p>
            {" "}
            Hit Enter to generate new image without clicking <b>sort</b>
          </p>
          <ul className="clt">
            <li>
              <b>Hue</b>: adjusts hue of pixels after sorting
            </li>
            <li>
              <b>Threshold</b>: determines which pixels are sorted
            </li>
            <li>
              <b>Persistent</b>: applies sort to previous result
            </li>
            <li>
              <b>Contiguous</b>: will only sort contiguous chunks of pixels that
              are within the threshold. Default behavior sorts from the first
              and last pixel within a row that are within the threshold
            </li>
          </ul>
        </Panel>
        {/** ABOUT PANEL **/}

        {/** ART PANEL **/}
        <Panel style={panelStyle} title="art" className="artPanel">
          <canvas
              style={canvStyle}
              ref="canvas"
              width={this.state.img_width}
              height={this.state.img_height}
          />
        </Panel>
        {/** ART PANEL **/}

      </PanelContainer>
    );
  }
}

export default PixelSorter;
