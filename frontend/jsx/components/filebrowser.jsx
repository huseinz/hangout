import React from 'react'

class FileBrowser extends React.Component{

    state = {
        ftree: null
    };

    constructor(props){
        super(props)
        this.props.set_title('FileBrowser');
        this.fileInput = React.createRef();
    }

    load = () => {
        fetch('/ls', {credentials: 'same-origin'})
            .then((response) =>
                {response.json().then((files) =>
                    {
                        this.setState({ftree:files.map((f)=>this.generateTree(f))});
                    }
                );
                }
            );
    }
    componentWillMount() {
        this.load();
    }

    onFileClick = (e) => {
        console.log(e.target.id);
        this.props.callback(e.target.id);
    }

    generateTree = (f) =>{
          let tree = <div></div>;
            console.log(f.fullpath);
          if(f.isDir){
              tree = <li className="clt dir" key={f.fullpath} id={f.filename} onClick={this.onFileClick}>
                  {f.filename}
                  <ul className="clt" style={{display:"none"}}>
                      {f.files.map((file) => this.generateTree(file))}
                  </ul>
              </li>;
          }
          else{
              tree =
                  <li className="clt file" key={f.fullpath} id={f.filename} onClick={this.onFileClick}>{f.filename}</li>;
          }
          return tree;
    }

    getBase64 = (file, callback) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            callback(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }
    onUpload = (e) =>{
        e.preventDefault();

        this.getBase64(this.fileInput.current.files[0],(b64) =>
            {
                this.props.callback(b64);

                //b64 should be readable by <img>
                fetch('/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({b64: b64})
                }).then(() => this.load())
                    .catch((err) => {console.log(err.text())});
            } );
    }
    render(){
      return(
          <div className="inner tree">
              <ul className="clt">
              {this.state.ftree}
          </ul>
              <form onSubmit={this.onUpload} encType="multipart/form-data">
              <input type='file' name='userimg' ref={this.fileInput}/>
                  <button type="submit">upload</button>
              </form>
          </div>
      )
    }
}

//{this.state.ftree.map((f) => this.generateTree(f))}
export default FileBrowser;