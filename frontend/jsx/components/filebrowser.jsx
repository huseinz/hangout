import React from "react";

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
    fetch("/ls", { credentials: "same-origin" }).then(response => {
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
    console.log(e.target.id);
    this.props.callback("/img/" + e.target.id);
  };

  generateTree = f => {
    let tree = <div></div>;
    if (f.isDir) {
      tree = (
        <li
          className="clt dir"
          key={f.fullpath}
          id={f.filename}
          onClick={this.onFileClick}
        >
          {f.filename}
          <ul className="clt" style={{ display: "none" }}>
            {f.files.map(file => this.generateTree(file))}
          </ul>
        </li>
      );
    } else {
      tree = (
        <li
          className="clt file"
          key={f.fullpath}
          id={f.filename}
          onClick={this.onFileClick}
        >
          {f.filename}
        </li>
      );
    }
    return tree;
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
        fetch("/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            b64: b64,
            name: this.fileInput.current.files[0].name
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
  render() {
    //method="POST" action='/upload'
    return (
      <div className="inner tree">
        <ul className="clt">{this.state.ftree}</ul>
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
