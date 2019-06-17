import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import PanelContainer from "./components/panelcontainer.jsx";
import PixelSorter from "./components/pixelsorter";
import Chat from "./components/chat";

ReactDOM.render(
  <PanelContainer>
    <Panel>
        <Chat/>
    </Panel>
  </PanelContainer>,
  document.getElementById("reactpanelbox")
);
