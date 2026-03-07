import { useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import api from "./api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("profilePhoto") || "");

  const handleLogin = async (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
    // fetch user info after login
    try {
      const res = await api.get("/api/auth/me");
      setUsername(res.data.user.username);
      setProfilePhoto(res.data.user.profilePhoto || "");
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("profilePhoto", res.data.user.profilePhoto || "");
    } catch {}
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken("");
    setUsername("");
    setProfilePhoto("");
  };

  if (!token) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard username={username} profilePhoto={profilePhoto} onLogout={handleLogout} />;
}
