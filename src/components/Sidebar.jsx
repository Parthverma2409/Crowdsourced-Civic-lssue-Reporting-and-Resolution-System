import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import navigationRoutes from "../context/NavigationRoutes";
import { t } from "i18next";
import { classNames } from "../utils/className.jsx";

export default function Sidebar() {
    const location = useLocation();
    const [expanded, setExpanded] = useState(
        navigationRoutes.routes.map(() => false)
    );

    // Auto-expand active category
    useEffect(() => {
        const newExpanded = navigationRoutes.routes.map((route) =>
            route.children
                ? route.children.some((child) => location.pathname.endsWith(child.name))
                : location.pathname.endsWith(route.name)
        );
        setExpanded(newExpanded);
    }, [location.pathname]);

    const toggleExpand = (index) =>
        setExpanded((prev) => prev.map((v, i) => (i === index ? !v : v)));

    return (
        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            {navigationRoutes.routes.map((route, idx) => (
                <div key={idx}>
                    {/* Category or single item */}
                    <div
                        className={classNames(
                            "flex items-center justify-between cursor-pointer py-3 px-4 text-gray-700 font-medium rounded hover:bg-gray-100 transition-colors",
                            location.pathname.endsWith(route.name) ||
                            (route.children &&
                                route.children.some((child) =>
                                    location.pathname.endsWith(child.name)
                                ))
                                ? "bg-gray-100 text-emerald-600"
                                : ""
                        )}
                        onClick={() => route.children && toggleExpand(idx)}
                        aria-label={
                            route.children
                                ? `Open category ${t(route.displayName)}`
                                : `Visit ${t(route.displayName)}`
                        }
                    >
                        <div className="flex items-center space-x-3">
                            {route.meta?.icon && (
                                <span className="text-gray-500">{route.meta.icon}</span>
                            )}
                            <span>{t(route.displayName)}</span>
                        </div>

                        {route.children &&
                            (expanded[idx] ? (
                                <FaChevronUp className="text-gray-400" />
                            ) : (
                                <FaChevronDown className="text-gray-400" />
                            ))}
                    </div>

                    {/* Child routes */}
                    {route.children && expanded[idx] && (
                        <div className="flex flex-col">
                            {route.children.map((child, cidx) => (
                                <Link
                                    key={cidx}
                                    to={`/${child.name}`}
                                    className={classNames(
                                        "py-2 px-8 text-gray-600 rounded hover:bg-gray-100 transition-colors font-medium",
                                        location.pathname.endsWith(child.name)
                                            ? "bg-gray-100 text-emerald-600"
                                            : ""
                                    )}
                                    aria-label={`Visit ${t(child.displayName)}`}
                                >
                                    {t(child.displayName)}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </aside>
    );
}
