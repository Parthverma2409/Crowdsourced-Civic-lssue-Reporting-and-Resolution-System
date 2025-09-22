import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
