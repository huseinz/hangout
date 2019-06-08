import React, { Component } from "react";
import ReactDOM from "react-dom";

class Roll extends React.Component {
  state = {
    lb: 1,
    ub: 6,
    roll: ""
  };

  constructor(props) {
    super(props);
    this.props.set_title("Random Number");
  }

  rollButton = () => {
    var n = randnum(this.state.ub, this.state.lb);
    this.setState({ roll: n });
  };

  upd_lb = e => {
    this.setState({ lb: parseInt(e.target.value) });
  };
  upd_ub = e => {
    this.setState({ ub: parseInt(e.target.value) });
  };

  render() {
    return (
      <div className="cntr randominteger">
        <input
          value={this.state.lb}
          onChange={this.upd_lb}
          type="number"
          size="7"
          className="form-control rn_lb"
        />{" "}
        to
        <input
          value={this.state.ub}
          onChange={this.upd_ub}
          type="number"
          size="7"
          className="form-control rn_ub"
        />
        <div>
          <input
            value={this.state.roll}
            type="number"
            size="7"
            className="form-control rn_res"
          />
        </div>
        <img
          className="icon rn_sub"
          onClick={this.rollButton}
          src="/img/chansey.gif"
        />
      </div>
    );
  }
}

function randnum(ub, lb) {
  if (lb > ub) {
    var tmp = lb;
    lb = ub;
    ub = tmp;
  }
  return Math.floor(lb + Math.random() * (ub + 1 - lb));
}

export default Roll;
