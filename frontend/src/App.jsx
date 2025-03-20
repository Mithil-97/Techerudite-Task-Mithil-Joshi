import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerRegister from "./components/CustomerRegister";
import AdminRegister from "./components/AdminRegister";
import AdminLogin from "./components/AdminLogin";
import VerifyEmail from "./components/VerifyEmail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;
