import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronUp, FaHome, FaClipboardList, FaChartLine } from "react-icons/fa";
import navigationRoutes from "../context/NavigationRoutes";

export default function Sidebar() {
    const location = useLocation();
    const [expanded, setExpanded] = useState(
        navigationRoutes.routes.map(() => false)
    );

    // Auto-expand active category
    useEffect(() => {
        const newExpanded = navigationRoutes.routes.map((route) =>
            route.children
                ? route.children.some((child) => location.pathname.includes(child.name))
                : location.pathname.includes(route.name)
        );
        setExpanded(newExpanded);
    }, [location.pathname]);

    const toggleExpand = (index) =>
        setExpanded((prev) => prev.map((v, i) => (i === index ? !v : v)));

    return (
        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-slate-900 to-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
            {/* Dashboard Home Link */}
            <Link
                to="/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 mx-2 mt-2 rounded-lg transition-all ${
                    location.pathname === "/dashboard"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                        : "text-gray-300 hover:bg-white/5"
                }`}
            >
                <FaHome className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
            </Link>

            <div className="border-t border-gray-800 my-2"></div>

            {/* Navigation Categories */}
            {navigationRoutes.routes.map((route, idx) => (
                <div key={idx}>
                    {/* Category Header or Single Item */}
                    <div
                        className={`flex items-center justify-between cursor-pointer py-3 px-4 mx-2 rounded-lg transition-all font-medium group ${
                            location.pathname.includes("/" + route.name) ||
                            (route.children &&
                                route.children.some((child) =>
                                    location.pathname.includes("/" + child.name)
                                ))
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                                : "text-gray-300 hover:bg-white/5"
                        }`}
                        onClick={() => {
                            if (route.children) toggleExpand(idx);
                            else if (!route.children) {
                                // Single link navigation
                            }
                        }}
                    >
                        <div className="flex items-center space-x-3">
                            {route.meta?.icon && (
                                <span className="text-base">{route.meta.icon}</span>
                            )}
                            <span>{route.displayName}</span>
                        </div>

                        {route.children &&
                            (expanded[idx] ? (
                                <FaChevronUp className="text-gray-400 text-sm" />
                            ) : (
                                <FaChevronDown className="text-gray-400 text-sm" />
                            ))}
                    </div>

                    {/* Child Routes / Submenu */}
                    {route.children && expanded[idx] && (
                        <div className="flex flex-col bg-black/20 mx-2 rounded-lg my-1 overflow-hidden">
                            {route.children.map((child, cidx) => (
                                <Link
                                    key={cidx}
                                    to={`/${child.name}`}
                                    className={`py-2 px-6 text-sm transition-all border-l-2 ${
                                        location.pathname.includes("/" + child.name)
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent"
                                    }`}
                                >
                                    {child.displayName}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Reports Section */}
            <div className="border-t border-gray-800 my-3"></div>
            
            <Link
                to="/reports"
                className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                    location.pathname === "/reports"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                        : "text-gray-300 hover:bg-white/5"
                }`}
            >
                <FaClipboardList className="w-5 h-5" />
                <span className="font-medium">Reports</span>
            </Link>

            {/* Analytics Section */}
            <Link
                to="/analytics"
                className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                    location.pathname === "/analytics"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                        : "text-gray-300 hover:bg-white/5"
                }`}
            >
                <FaChartLine className="w-5 h-5" />
                <span className="font-medium">Analytics</span>
            </Link>

            {/* Footer spacing */}
            <div className="flex-1"></div>
            <div className="p-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">© 2025 Civic Portal</p>
            </div>
        </aside>
    );
}
