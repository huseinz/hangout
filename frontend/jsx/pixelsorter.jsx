import React from "react";
import ReactDOM from "react-dom";

import Panel from "./components/panel";
import PixelSorter from "./components/pixelsorter";

ReactDOM.render(
  <Panel>
    <PixelSorter text="sup" defaultimg="/img/blossom.jpg" />
  </Panel>,
  document.getElementById("reactpanelbox")
);
