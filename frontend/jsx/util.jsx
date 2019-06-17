import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import PanelContainer from "./components/panelcontainer.jsx";
import PixelSorter from "./components/pixelsorter";
import Chat from "./components/chat";
import RTerminal from "./components/RTerminal";

ReactDOM.render(
  <PanelContainer>
      <Panel>
          <RTerminal text="yoyoyoyoy"/>
      </Panel>
    <Panel>
        <Chat/>
    </Panel>
  </PanelContainer>,
  document.getElementById("reactpanelbox")
);
