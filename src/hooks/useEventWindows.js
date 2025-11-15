import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useEventWindows() {
  const [win, setWin] = React.useState(null);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/event-settings") // ✅ PUBLIC ROUTE — NO AUTH REQUIRED
      .then((r) => {
        setWin({
          round1_start_iso: r.data.round1_start_iso || "",
          round1_end_iso: r.data.round1_end_iso || "",
          round2_start_iso: r.data.round2_start_iso || "",
          round2_end_iso: r.data.round2_end_iso || "",
        });
      })
      .catch((e) => {
        console.error("event-windows error", e);
        setWin(null);
      });
  }, []);

  return win;
}
