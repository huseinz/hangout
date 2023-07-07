import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import FileBrowser from "./components/filebrowser";
import MemeViewer from "./components/meme_viewer";
/*
ReactDOM.render(
    <Panel>
        <FileBrowser endpoint="/pixelsorter/upload" basedir="ps" 
	callback={(path) => window.location.href=path}/>
    </Panel>,
    document.getElementById("reactpanelbox")
);*/
ReactDOM.render(
  <Panel>
    <MemeViewer text="sup" defaultimg="ps/brendan.png" />
  </Panel>,
  document.getElementById("reactpanelbox")
);
