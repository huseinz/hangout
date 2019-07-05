import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import PanelContainer from "./components/panelcontainer.jsx";
import PixelSorter from "./components/pixelsorter";
import Chat from "./components/chat";
import RTerminal from "./components/rterminal";
import Shell from "./components/shell";

ReactDOM.render(
  <PanelContainer>
      <Panel>
          <Shell title="hax"/>
      </Panel>
    <Panel>
        <Chat/>
    </Panel>
  </PanelContainer>,
  document.getElementById("reactpanelbox")
);
