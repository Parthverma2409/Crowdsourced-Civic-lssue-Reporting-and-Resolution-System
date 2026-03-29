import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Home, Camera, FileText } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

const links = [
  { to: "/helper/home", label: "Home", icon: Home },
  { to: "/helper/submit", label: "Report Issue", icon: Camera },
  { to: "/helper/my-reports", label: "My Reports", icon: FileText },
];

export default function HelperLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={links}
        portal="helper"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          portal="helper"
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
