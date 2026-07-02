import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AgentChat from "./pages/AgentChat";
import Notifications from "./pages/Notifications";
import Schemes from "./pages/Schemes";
import TrackApplication from "./pages/TrackApplication";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/agent" element={<AgentChat />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/track" element={<TrackApplication />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
