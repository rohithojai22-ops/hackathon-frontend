import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useServerClock() {
  const [now, setNow] = React.useState(null);

  React.useEffect(() => {
    let timer;

    (async () => {
      try {
        const r = await axios.get(API_BASE + "/api/server-time");
        const serverNow = new Date(r.data.now_iso).getTime();
        const clientNow = Date.now();
        const offset = serverNow - clientNow;

        setNow(new Date(serverNow));

        timer = setInterval(
          () => setNow(new Date(Date.now() + offset)),
          1000
        );
      } catch {
        setNow(new Date());
        timer = setInterval(() => setNow(new Date()), 1000);
      }
    })();

    return () => timer && clearInterval(timer);
  }, []);

  return now;
}
