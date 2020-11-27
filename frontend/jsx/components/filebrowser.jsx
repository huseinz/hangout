import React from "react";

class FileItem extends React.Component{

  state = {
    hideChildren: true
  };

  constructor(props){
    super(props);
  }

  handleClick = (e) => {
    e.stopPropagation();
    this.props.handleClick(this);
  };

  render() {
    return(
        <li
          className={this.props.className}
          onClick={this.handleClick}
        >
          {this.props.filename}
          {!this.state.hideChildren && this.props.children}
        </li>
    );
  }

}

class FileBrowser extends React.Component {
  state = {
    ftree: null
  };

  constructor(props) {
    super(props);
    this.props.set_title("FileBrowser");
    this.fileInput = React.createRef();
  }

  load = () => {
    fetch("/ls/".concat(this.props.basedir), { credentials: "same-origin" }).then(response => {
      response.json().then(files => {
        this.setState({ ftree: files.map(f => this.generateTree(f)) });
      });
    });
  };
  componentWillMount() {
    this.load();
    setInterval(this.load, 5000);
  }

  onFileClick = e => {
    console.log(e.props.path);
    this.props.callback("/img" + e.props.path);
    this.props.callback(this.props.basedir.concat(e.props.path));
  };

  onDirClick = e => {
    console.log(e.props.path);
    e.setState({hideChildren: !e.state.hideChildren});
  };

  getBase64 = (file, callback) => {
    if (file) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function() {
        callback(reader.result);
      };
      reader.onerror = function(error) {
        console.log("Error: ", error);
      };
    }
  };
  onUpload = e => {
    e.preventDefault();

    this.getBase64(this.fileInput.current.files[0], b64 => {
      if (b64) {
        //b64 should be readable by <img>
        fetch(this.props.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            b64: b64,
            filename: this.fileInput.current.files[0].name,
            dir: 'img'
          })
        })
          .then(() => {
            this.load();
          })
          .catch(err => {
            console.log(err.text());
          });
      }
    });
  };

  generateTree = f => {
    let tree = <div></div>;
    if (f.isDir) {
      tree = (
          <FileItem
              className="clt dir"
              key={f.filename}
              filename={f.filename}
              path={f.relpath}
              handleClick={this.onDirClick}
          >
            <ul className="clt">
              {f.files.map(file => this.generateTree(file))}
            </ul>
          </FileItem>
      );
    } else {
      tree = (
          <FileItem
              className="clt file"
              key={f.filename}
              filename={f.filename}
              path={f.relpath}
              handleClick={this.onFileClick}
          >
          </FileItem>
      );
    }
    return tree;
  };

  render() {
    //method="POST" action='/upload'
    return (
      <div>
        <ul className="tree clt">{this.state.ftree}</ul>
        <form
          onSubmit={this.onUpload}
          className="form-group"
          encType="multipart/form-data"
        >
          <input
            type="file"
            name="userimg"
            className="form-control"
            ref={this.fileInput}
          />
          <button className="btn btn-primary btn-ghost" type="submit">
            upload
          </button>
        </form>
      </div>
    );
  }
}

//{this.state.ftree.map((f) => this.generateTree(f))}
export default FileBrowser;
