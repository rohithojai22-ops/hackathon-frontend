import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useEventWindows() {
  const [win, setWin] = React.useState(null);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/admin/event-settings")   // ✅ correct route
      .then((r) =>
        setWin({
          round1: {
            start_iso: r.data.round1_start_iso || "",
            end_iso: r.data.round1_end_iso || "",
          },
          round2: {
            start_iso: r.data.round2_start_iso || "",
            end_iso: r.data.round2_end_iso || "",
          },
        })
      )
      .catch(() => setWin(null));
  }, []);

  return win;
}
