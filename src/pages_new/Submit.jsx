import React from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

import useServerClock from "../hooks/useServerClock";
import useEventWindows from "../hooks/useEventWindows";
import useGate from "../hooks/useGate";

import Countdown from "../components_new/Countdown";
import { fmtIST } from "../utils/time";
import {
  isRound1Done,
  isRound1Qualified,
  fetchStatusAndSetFlags,
} from "../utils/flags";

export default function Submit({ auth }) {
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role === "admin") return <Navigate to="/superadmin" />;

  if (!(isRound1Done() || isRound1Qualified()))
    return <div className="container">You need to complete Round 1 to submit Round 2 solutions.</div>;

  const wins = useEventWindows();
  const now = useServerClock();
const start = wins?.round2_start_iso;
const end   = wins?.round2_end_iso;

const gate = useGate(now, start, end, "R2");


  const [file, setFile] = React.useState(null);
  const [already, setAlready] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const hdr = { headers: { Authorization: "Bearer " + auth.token } };

    axios
      .get(API_BASE + "/api/round2/my-submission", hdr)
      .then((r) => setAlready(!!r.data))
      .catch(() => setAlready(false));
  }, [auth.token]);

  const doUpload = async (e) => {
    e.preventDefault();

    if (already) {
      alert("You have already uploaded.");
      navigate("/round2");
      return;
    }

    if (gate.status !== "open") {
      alert("Submissions open after Round-2 start.");
      return;
    }

    if (!file) {
      alert("Pick a file");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    const hdr = { headers: { Authorization: "Bearer " + auth.token } };

    try {
      await axios.post(API_BASE + "/api/round2/submit", fd, hdr);

      localStorage.setItem("round2_done", "1");
      await fetchStatusAndSetFlags(auth.token);

      navigate("/round2");
    } catch (e) {
      if (e?.response?.status === 409) {
        alert("Only one upload allowed for Round-2.");
        navigate("/round2");
      } else {
        alert("Upload failed");
      }
    }
  };

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Upload Solution (ZIP/PDF)</h2>

        {already && <p className="error">You already uploaded. You cannot upload again.</p>}

{gate.status === "locked" && (
  <>
    <p className="muted">
      Submissions will open at <b>{fmtIST(start)}</b>.
    </p>
    <Countdown now={now} target={new Date(start)} />
  </>
)}

{gate.status === "open" && end && (
  <>
    <p className="muted">
      Submissions close at <b>{fmtIST(end)}</b>.
    </p>
    <Countdown now={now} target={new Date(end)} prefix="Closes in" />
  </>
)}


        <form onSubmit={doUpload} className="grid gap">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn primary" disabled={already || gate.status !== "open"}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
