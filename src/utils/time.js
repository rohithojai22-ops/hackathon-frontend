export const IST = "Asia/Kolkata";

export function fmtIST(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  return d.toLocaleString("en-IN", { timeZone: IST });
}
