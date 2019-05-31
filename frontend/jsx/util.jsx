import React from 'react'
import ReactDOM from 'react-dom'

import PanelContainer from './components/panel.jsx'


class TestT extends React.Component{
	render(){
		return(<p>"Hello!"</p>);	
	}
};
var root = ReactDOM.render(
	<PanelContainer />,
	document.getElementById('reactpanelbox')
);

$("#new_util_submit").click(function(){
	var v = $("#new_util_select").val();
	console.log(v);
	if(!(v === "")){
		$.ajax({
		type : 'POST',
		contentType: 'application/json;charset=UTF-8',
		dataType: "json",
		data : JSON.stringify({'new_util':v}),
		success: updateUtils()
		});
	}
});
