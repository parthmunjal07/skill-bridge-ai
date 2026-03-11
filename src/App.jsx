import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/Login";
import DashboardPage from "./Pages/MainPage";

function LandingWithNav() {
  const navigate = useNavigate();
  return <LandingPage onLoginClick={() => navigate("/login")} />;
}

function LoginWithNav() {
  const navigate = useNavigate();
  return <LoginPage onLoginSuccess={() => navigate("/dashboard")} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingWithNav />} />
        <Route path="/login"     element={<LoginWithNav />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}