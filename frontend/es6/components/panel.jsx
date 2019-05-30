import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import PxTerm from './term.jsx'
import Chat from './chat.jsx'
import Roll from './roll.jsx'
import MyYT from './youtube.jsx'

class PanelContainer extends React.Component{

    state = {
        children: []
    };

    update_panels(){
        fetch('/user/util', {credentials: 'same-origin'})
            .then((response) => {
                    response.json().then((utils) => {
                            this.setState({children:JSON.parse(utils.utils)});
                        }
                    );
                }
            );
    }

    new_util(){
        var select = document.getElementById("new_util_select").value
        var utils = this.state.children;
        utils.push(select);
        this.setState({children:utils});
        fetch('/user/util/add')
    }

    componentWillMount(){
        this.update_panels();
        console.log(this.state.children);
    }
    constructor(props){
        super(props);
        this.update_panels = this.update_panels.bind(this);
        this.new_util = this.new_util.bind(this);
    }

    render(){
        return(
            <div>
                <button className="btn btn-primary" onClick={this.new_util}>Add</button>
                <div id="panelbox">
                    <Panel tag="MyYT"/>
                    {this.state.children.map(ctag => <Panel tag={ctag.name} key={ctag.win_id} />)}
                </div>
            </div>
        )
    }
}

class Panel extends React.Component{

    state = {
        title: '',
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
        var Tag = this.components[this.props.tag];
        if(typeof Tag == 'undefined'){
            return(<div></div>);
        }
        return(
            <div className="card panel">
                <header className="card-header">{this.state.title}</header>
                <div className="card-content">
                    <div className="inner">
                        <Tag set_title={this.set_title} />
                    </div>
                </div>
            </div>
        )
    }

}
export default PanelContainer;
