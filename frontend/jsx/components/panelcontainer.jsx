import React from "react";


class PanelContainer extends React.Component{

    state = {
    };

    update_panels(){
      /*  fetch('/user/util', {credentials: 'same-origin'})
            .then((response) => {
                    response.json().then((utils) => {
                            this.setState({children:JSON.parse(utils.utils)});
                        }
                    );
                }
            );
           */
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
        console.log(this.props.children);
    }
    constructor(props){
        super(props);
        this.update_panels = this.update_panels.bind(this);
        this.new_util = this.new_util.bind(this);
    }

    render(){
        const defaultStyle = {
            display: 'flex',
            flexWrap: 'wrap',
            flexGap: '10px',
        };
        return(
                <div className="panelbox" >
                    {this.props.children}
                </div>
        )
    }
}

export default PanelContainer;
/*{this.state.children.map(ctag =>
    <Panel win_id={ctag.win_id}>
        React.createElement(eval({ctag.name});
    </Panel>)
}*/
