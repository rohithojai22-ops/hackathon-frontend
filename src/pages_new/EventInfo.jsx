import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function EventInfo() {
  const [info, setInfo] = React.useState(null);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/event-info")
      .then((r) => setInfo(r.data))
      .catch(() => setInfo(null));
  }, []);

  if (!info)
    return <div className="container">Loading event details...</div>;

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Hackathon 2026 – Event Information</h2>

        <h3>🏆 Prizes & Recognition</h3>
        <ul className="list">
          <li>1st Prize: ₹{info.prizes.first.amount} + {info.prizes.first.desc}</li>
          <li>2nd Prize: ₹{info.prizes.second.amount} + {info.prizes.second.desc}</li>
          <li>3rd Prize: ₹{info.prizes.third.amount} + {info.prizes.third.desc}</li>
        </ul>

        <h3>📜 Certificates for Participants</h3>
        <ul className="list">
          {info.certificates.map((c, i) => (
            <li key={i}><b>{c.type}:</b> {c.desc}</li>
          ))}
        </ul>

        <h3>📝 Registration Details</h3>
        <ul className="list">
          <li><b>Deadline:</b> {info.registration.deadline}</li>
          <li><b>Fee:</b> ₹{info.registration.fee} per team</li>
          <li><b>Account Number:</b> {info.registration.account.number}</li>
          <li><b>Account Holder:</b> {info.registration.account.holder}</li>
          <li><b>Bank:</b> {info.registration.account.bank}</li>
          <li><b>IFSC:</b> {info.registration.account.ifsc}</li>
          <li><b>MICR:</b> {info.registration.account.micr}</li>
        </ul>

        <h3>🏠 Accommodation & Activities</h3>
        <ul className="list">
          <li>{info.accommodation}</li>
          <li>{info.local_visit}</li>
          <li>{info.gala_dinner}</li>
          <li>Registration Form: {info.registration_link}</li>
        </ul>

        <h3>👨‍🏫 Organizing Team</h3>
        <p>{info.organizing_team}</p>

        <h3>📞 Contact</h3>
        <ul className="list">
          <li>{info.contact.name}</li>
          <li>Email: <a className="link" href={`mailto:${info.contact.email}`}>{info.contact.email}</a></li>
        </ul>

        <h3>📚 Conclusion</h3>
        <p>{info.conclusion}</p>
      </div>
    </div>
  );
}
