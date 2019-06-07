import React from 'react';

/*import PxTerm from './term.jsx'
import Chat from './chat.jsx'
import Roll from './roll.jsx'
import MyYT from './youtube.jsx'*/


class Panel extends React.Component{

    state = {
        title: 'default',
    };


    constructor(props){
        super(props);
        this.set_title = this.set_title.bind(this);
        this.state.title = this.props.title;
        this.state.className = this.props.className;
    }

    set_title(newtitle){
        this.setState({title:newtitle});
    }

    render(){
        const children = React.Children.map(this.props.children, child => {
            if(child.type instanceof Function) {
                return React.cloneElement(child, {
                    set_title: this.set_title
                });
            }
            return React.cloneElement(child, {});
        });
        return(
            <div className={"card panel flex-item" + " " + this.state.className} style={this.props.style || {}}>
                <header className="card-header">{this.state.title}</header>
                <div className="card-content">
                    <div className="inner">
                        { children }
                    </div>
                </div>
            </div>
        )
    }

}
export default Panel;
