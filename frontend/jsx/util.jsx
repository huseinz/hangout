import React from 'react'
import ReactDOM from 'react-dom'

import Panel from './components/panel'
import PanelContainer from './components/panelcontainer.jsx'
import PixelSorter from './components/pixelsorter';


ReactDOM.render(
	<PanelContainer>
		<Panel><PixelSorter text="sup" defaultimg="/img/viper.jpg"/></Panel>
	</PanelContainer>,
	document.getElementById('reactpanelbox')
);
