import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import useAuth from "./hooks/useAuth";

import Nav from "./components_new/Nav";

import Home from "./pages_new/Home";
import Register from "./pages_new/Register";
import Login from "./pages_new/Login";
import Dashboard from "./pages_new/Dashboard";
import Round1 from "./pages_new/Round1";
import Round2 from "./pages_new/Round2";
import Submit from "./pages_new/Submit";
import Profile from "./pages_new/Profile";
import Leaderboard from "./pages_new/Leaderboard";
import Certificate from "./pages_new/Certificate";
import Round3Offline from "./pages_new/Round3Offline";
import Schedule from "./pages_new/Schedule";
import Contact from "./pages_new/Contact";
import Results from "./pages_new/Results";
import EventInfo from "./pages_new/EventInfo";
import Admin from "./pages_new/Admin";

export default function App() {
  const auth = useAuth();

  return (
    <BrowserRouter>
      <Nav auth={auth} />

      <Routes>
        <Route path="/" element={<Home auth={auth} />} />
        <Route path="/register" element={<Register auth={auth} />} />
        <Route path="/login" element={<Login auth={auth} />} />
        <Route path="/dashboard" element={<Dashboard auth={auth} />} />
        <Route path="/round1" element={<Round1 auth={auth} />} />
        <Route path="/round2" element={<Round2 auth={auth} />} />
        <Route path="/submit" element={<Submit auth={auth} />} />
        <Route path="/profile" element={<Profile auth={auth} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/certificate" element={<Certificate auth={auth} />} />
        <Route path="/round3-offline" element={<Round3Offline />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/results" element={<Results auth={auth} />} />
        <Route path="/event-info" element={<EventInfo />} />
        <Route path="/superadmin" element={<Admin auth={auth} />} />
      </Routes>
    </BrowserRouter>
  );
}
