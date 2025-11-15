
import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useEventWindows() {
  const [win, setWin] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token"); // team or admin
    const hdr = token ? { headers: { Authorization: "Bearer " + token } } : {};

    axios
      .get(API_BASE + "/api/admin/event-settings", hdr)
      .then((r) => {
        setWin({
          round1: {
            start_iso: r.data.round1_start_iso || "",
            end_iso: r.data.round1_end_iso || "",
          },
          round2: {
            start_iso: r.data.round2_start_iso || "",
            end_iso: r.data.round2_end_iso || "",
          },
        });
      })
      .catch((e) => {
        console.error("event-windows error", e);
        setWin(null);
      });
  }, []);

  return win;
}

