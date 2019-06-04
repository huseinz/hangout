import React from "react";

import Panel from './panel';
import Roll from "./roll";

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
      /*  var select = document.getElementById("new_util_select").value
        var utils = this.state.children;
        utils.push(select);
        this.setState({children:utils});
        fetch('/user/util/add')*/
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
                <button className="btn btn-primary" onClick={this.new_util}>this does nothing</button>
                <div id="panelbox">
                    {this.state.children.map(ctag =>
                        <Panel win_id={ctag.win_id}>
                            React.createElement(eval({ctag.name});
                        </Panel>)
                    }
                    <Panel><Roll/></Panel>
                </div>
            </div>
        )
    }
}

export default PanelContainer;