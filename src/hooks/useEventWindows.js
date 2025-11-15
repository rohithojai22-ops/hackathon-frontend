import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useEventWindows() {
  const [win, setWin] = React.useState(null);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/event-settings")
      .then((res) => {
        const d = res.data || {};

        setWin({
          round1: {
            start_iso: d.round1_start_iso || null,
            end_iso: d.round1_end_iso || null,
          },
          round2: {
            start_iso: d.round2_start_iso || null,
            end_iso: d.round2_end_iso || null,
          },
        });
      })
      .catch(() => setWin(null));
  }, []);

  return win;
}
