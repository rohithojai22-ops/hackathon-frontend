import React from "react";
import Countdown from "./Countdown";
import { fmtIST } from "../utils/time";

export default function Locked({ title, when, now }) {
  return (
    <div className="container narrow">
      <div className="card glass-card center">
        <h2>{title}</h2>
        <p className="muted">Unlocks at:</p>
        <p><b>{fmtIST(when)}</b></p>

        <Countdown now={now} target={when} />
      </div>
    </div>
  );
}
