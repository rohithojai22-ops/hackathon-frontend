import React from "react";

export default function Countdown({ now, target, prefix = "Opens in" }) {
  if (!now || !target) return null;

  const diff = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(diff / 1000);

  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <div className="countdown">
      {prefix} <b>{d}d {h}h {m}m {sec}s</b>
    </div>
  );
}
