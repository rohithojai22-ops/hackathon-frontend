import axios from "axios";
import { API_BASE } from "../config";

export async function fetchStatusAndSetFlags(token) {
  if (!token) return null;

  try {
    const hdr = { headers: { Authorization: "Bearer " + token } };
    const r = await axios.get(API_BASE + "/api/status", hdr);
    const data = r.data;

    if (data?.round1_attempted)
      localStorage.setItem("round1_done", "1");

    if (data?.shortlist?.round1_qualified)
      localStorage.setItem("round1_qualified", "1");

    if (data?.shortlist?.round2_shortlisted)
      localStorage.setItem("round2_qualified", "1");

    return data;
  } catch {
    return null;
  }
}

export const isRound1Done = () =>
  !!localStorage.getItem("round1_done");

export const isRound1Qualified = () =>
  !!localStorage.getItem("round1_qualified");

export const isRound2Done = () =>
  !!localStorage.getItem("round2_done");

export const isRound2Qualified = () =>
  !!localStorage.getItem("round2_qualified");
