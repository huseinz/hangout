import React from "react";
import FileBrowser from "./filebrowser";
import Panel from "./panel";
import PanelContainer from "./panelcontainer";
import RTerminal from "./rterminal";
const validFilename = require('valid-filename');

const img_utils = require("../../../core/Image");

class MemeViewer extends React.Component {
  state = {
    img_loaded: false,
    orig_imgdata: null,
    imgdata: null,
    img_width: 800, //placeholder
    img_height: 640, //placeholder
    img_path: "",
    w: 0,
    h: 0,
    ctx: null,
    r_val: 0,
    g_val: 0,
    b_val: 0,
    r_f_val: 1,
    g_f_val: 1,
    b_f_val: 1,
    mouseDown: false,

    uploadError: false
  };

  constructor(props) {
    super(props);
    this.props.set_title("MemeViwer つ ◕_◕ ༽つ");
    this.state.img_path = this.props.defaultimg;
  }

  componentDidMount() {
    const img = this.refs.image;
    img.onload = this.load_image;
  }

  update_img_path = path => {
    this.setState({ img_loaded: false, img_path: encodeURI(path) });
  };

  load_image = () => {
    const img = this.refs.image;

    const canvas = this.refs.canvas;
    canvas.setAttribute("width", img.width);
    canvas.setAttribute("height", img.height);
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
  };

  render() {

    const imgStyle = {
      display: "none",
      height: "100%",
      width: "100%",
      maxWidth: "100%",
      objectFit: "contain",
      flexShrink: 0,
      alignSelf: "center"
    };
    const canvStyle = {
      height: this.state.h,
      width: this.state.w,
      maxWidth: this.state.w,
      flexShrink: 0,
      objectFit: "contain"
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
        <Panel>
          <FileBrowser endpoint="/pixelsorter/upload" callback={this.update_img_path} basedir='ps' />
        </Panel>
        <Panel style={panelStyle} title="view" className="artPanel">
          <canvas
            style={canvStyle}
            ref="canvas"
            width={this.state.img_width}
            height={this.state.img_height}
          />
          <img ref="image" src={this.state.img_path} style={imgStyle} />
        </Panel>
      </PanelContainer>
    );
  }
}

export default MemeViewer;
