import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import navigate
import { Shield } from "lucide-react";
import { FaTrash, FaTools, FaTrafficLight, FaUsers, FaShareAlt, FaThumbsUp} from "react-icons/fa";
import { MdEco, MdOutlineReportProblem, MdOutlineFeedback, MdOutlineWaterDrop, MdGroups, MdPark} from "react-icons/md";
import { AiOutlineTeam, AiOutlineForm } from "react-icons/ai";
import { RiSurveyLine } from "react-icons/ri";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // <-- initialize navigate

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple login logic
        // Replace this with real authentication later
        if (email === "admin@civic.com" && password === "1234") {
            navigate("/dashboard"); // <-- move to dashboard
        } else {
            alert("Invalid email or password");
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 relative overflow-hidden">

            {/* Civic Icons in Background */}
            <FaTrash className="absolute text-white/10 text-8xl top-20 left-16 rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaTools className="absolute text-white/10 text-8xl bottom-24 right-20 -rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaTrafficLight className="absolute text-white/10 text-7xl bottom-10 left-1/3 rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaUsers className="absolute text-white/10 text-7xl top-32 right-10 -rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaShareAlt className="absolute text-white/10 text-9xl bottom-36 left-8 rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <FaThumbsUp className="absolute text-white/10 text-9xl top-40 left-1/4 -rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdEco className="absolute text-white/10 text-9xl top-10 right-1/4 rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdOutlineReportProblem className="absolute text-white/10 text-9xl bottom-16 left-20 -rotate-9 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdOutlineFeedback className="absolute text-white/10 text-6xl top-1/3 left-1/2 rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdOutlineWaterDrop className="absolute text-white/10 text-7xl bottom-32 right-1/3 rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdGroups className="absolute text-white/10 text-6xl top-1/4 left-10 -rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <MdPark className="absolute text-white/10 text-7xl bottom-20 right-1/4 rotate-9 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <AiOutlineTeam className="absolute text-white/10 text-8xl top-16 left-3/4 -rotate-12 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <AiOutlineForm className="absolute text-white/10 text-9xl bottom-80 right-16 rotate-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />
            <RiSurveyLine className="absolute text-white/10 text-9xl top-1/2 left-1/3 -rotate-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition duration-300 hover:text-white hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] hover:scale-110" />

            {/* Background Glow */}
            <div className="absolute pointer-events-none -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
            <div className="absolute pointer-events-none -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

            {/* Glass Login Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-10 w-96 border border-white/20">
                <div className="flex flex-col items-center mb-6">
                    <Shield size={42} className="text-emerald-400 mb-3" />
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-gray-300 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-900/40 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-900/40 border border-gray-700 placeholder-gray-400 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg hover:opacity-90 transition duration-300"
                    >
                        Login
                    </button>
                </form>

                <p className="text-gray-400 text-xs text-center mt-6">
                    © 2025 City Civic Portal
                </p>
            </div>
        </div>
    );
}
