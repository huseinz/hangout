import React from 'react'

class FileBrowser extends React.Component{

    state = {
        ftree: null
    };

    constructor(props){
        super(props)
        this.generateTree = this.generateTree.bind(this);
        this.onFileClick = this.onFileClick.bind(this);
        this.props.set_title('FileBrowser');
        fetch('/ls', {credentials: 'same-origin'})
            .then((response) => {
                    response.json().then((files) => {
                            this.setState({ftree:files.map((f)=>this.generateTree(f))});
                        }
                    );
                }
            );
        this.counter = 0;
    }

    componentDidMount() {
    }

    onFileClick(e){
        console.log(e.target.id);
        this.props.callback(e.target.id);
    }

    generateTree(f){
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
                   //<a href={ f.filename } key={f.fullpath} onClick={this.onFileClick}>
              //</a>;
          }
          return tree;
    }

    render(){
      return(
          <div className="inner tree">
              <ul className="clt">
              {this.state.ftree}
          </ul>
          </div>
      )
    }
}

//{this.state.ftree.map((f) => this.generateTree(f))}
export default FileBrowser;