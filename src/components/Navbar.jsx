import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { FaBell, FaUser, FaSignOutAlt, FaHome, FaChevronDown } from "react-icons/fa";
import CivicLogo from "./CivicLogo";
import app from "../services/firebaseConfig";

export default function Navbar({ onToggleSidebar }) {
    const [showNavbar, setShowNavbar] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const lastScrollYRef = useRef(0);
    const navigate = useNavigate();
    const auth = getAuth(app);

    // Track user info
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserEmail(user.email);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    // Handle scroll show/hide navbar
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
                setShowNavbar(false); // scrolling down → hide
            } else {
                setShowNavbar(true); // scrolling up → show
            }
            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleSidebar = () => {
        if (onToggleSidebar) onToggleSidebar();
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setShowProfileMenu(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 to-gray-900 shadow-lg transition-transform duration-300 ${
                showNavbar ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left section */}
                    <div className="flex items-center space-x-4">
                        {/* Toggle Button */}
                        <button
                            onClick={toggleSidebar}
                            className="text-white hover:text-emerald-400 transition p-2 rounded hover:bg-white/10"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo - Home Link */}
                        <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition" aria-label="Home">
                            <CivicLogo className="h-8" />
                            <span className="text-white font-bold hidden sm:inline">Civic Portal</span>
                        </Link>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button 
                            className="text-white hover:text-emerald-400 transition p-2 rounded hover:bg-white/10 relative"
                            aria-label="Notifications"
                        >
                            <FaBell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-2 text-white hover:text-emerald-400 transition p-2 rounded hover:bg-white/10"
                                aria-label="Profile menu"
                            >
                                <FaUser className="w-5 h-5" />
                                <FaChevronDown className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Signed in as</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
                                    </div>
                                    
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                    >
                                        <FaHome className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                    >
                                        <FaSignOutAlt className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
