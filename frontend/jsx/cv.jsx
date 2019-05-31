import React from 'react'
import ReactDOM from 'react-dom'


class Panel extends React.Component{

    state = {
        title: 'default',
    };


    constructor(props){
        super(props);
        this.set_title = this.set_title.bind(this);

        this.components = {
            Roll: Roll,
            PxTerm: PxTerm,
            Chat: Chat,
            MyYT: MyYT,
        }
    }

    set_title(newtitle){
        this.setState({title:newtitle});
    }

    render(){
        return(
            <div className="card panel">
                <header className="card-header">{this.state.title}</header>
                <div className="card-content">
                    <div className="inner">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }

}

class PixelSorter extends React.Component{

    render(){
        return(

        )
    }
}

var root = ReactDOM.render(
    <Panel><PixelSorter/></Panel>,
    document.getElementById('reactpanelbox')
);

export default Panel;