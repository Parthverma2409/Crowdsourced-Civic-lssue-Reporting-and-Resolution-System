import { useState } from "react";
import Navbar from "../components/Navbar"; // your Navbar component
import Sidebar from "../components/Sidebar"; // your Sidebar component
import LiveReports from "./cards/LiveReports";
import ReportsMap from "./cards/ReportsMap";
import ReportsByCategory from "./cards/ReportsByCategory";
import ReportsByPriority from "./cards/ReportsByPriority";
import ReportTimeline from "./cards/ReportTimeline";
import StaffAssignments from "./cards/StaffAssignments";
import DepartmentPerformance from "./cards/DepartmentPerformance";
import RecentActivities from "./cards/RecentActivities";

export default function Dashboard() {
    const [sidebarVisible, setSidebarVisible] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar onToggleSidebar={setSidebarVisible} />

            {/* Sidebar */}
            <Sidebar visible={sidebarVisible} />

            {/* Main content */}
            <div
                className={`pt-20 transition-all duration-300 ${
                    sidebarVisible ? "ml-64" : "ml-0"
                } p-6`} // pt-20 = navbar height, ml-64 = sidebar width
            >
                {/* Page Title */}
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

                {/* Live Reports + Top Priority */}
                <section className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <LiveReports className="w-full sm:w-[70%] bg-white rounded-xl shadow-md p-4" />
                        <div className="flex flex-col gap-4 w-full sm:w-[30%]">
                            <ReportsByPriority className="h-full bg-white rounded-xl shadow-md p-4" />
                            <ReportsByCategory className="bg-white rounded-xl shadow-md p-4" />
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <RecentActivities className="bg-white rounded-xl shadow-md p-4" />
                </section>

                {/* Interactive Map + Department Performance */}
                <section className="flex flex-col md:flex-row gap-4 mb-6">
                    <ReportsMap className="w-full md:w-4/6 rounded-xl shadow-md" />
                    <DepartmentPerformance className="w-full md:w-2/6 bg-white rounded-xl shadow-md p-4" />
                </section>

                {/* Staff Assignments Table + Timeline */}
                <section className="flex flex-col md:flex-row gap-4">
                    <StaffAssignments className="w-full md:w-1/2 bg-white rounded-xl shadow-md p-4" />
                    <ReportTimeline className="w-full md:w-1/2 bg-white rounded-xl shadow-md p-4" />
                </section>
            </div>
        </div>
    );
}
