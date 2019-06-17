import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import FileBrowser from "./components/filebrowser";

ReactDOM.render(
    <Panel>
        <FileBrowser endpoint="/pixelsorter/upload" callback={() => {}} />
    </Panel>,
    document.getElementById("reactpanelbox")
);
