import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import VidBrowser from "./components/vidbrowser";

ReactDOM.render(
    <Panel>
        <VidBrowser endpoint="/pixelsorter/upload" basedir="mr.robot" 
	callback={(path) => window.location.href=path}/>
    </Panel>,
    document.getElementById("reactpanelbox")
);
