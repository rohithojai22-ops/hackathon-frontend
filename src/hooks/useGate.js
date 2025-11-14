export default function useGate(now, isoStart, isoEnd, mode = "R1") {
  const start = isoStart ? new Date(isoStart) : null;
  const end = isoEnd ? new Date(isoEnd) : null;

  if (!now) return { status: "loading" };

  if (mode === "R1") {
    if (!start || !end) return { status: "unset" };
    if (now < start) return { status: "locked", opensAt: start };
    if (end && now >= end) return { status: "ended", endedAt: end };
    return { status: "open", endsAt: end };
  } else {
    if (!start) return { status: "unset" };
    if (now < start) return { status: "locked", opensAt: start };
    return { status: "open", endsAt: end || null };
  }
}
