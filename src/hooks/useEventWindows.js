import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useEventWindows() {
  const [win, setWin] = React.useState(null);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/event-settings")
      .then((r) =>
        setWin({
          round1: r.data.round1,
          round2: r.data.round2,
        })
      )
      .catch(() => setWin(null));
  }, []);

  return win;
}
