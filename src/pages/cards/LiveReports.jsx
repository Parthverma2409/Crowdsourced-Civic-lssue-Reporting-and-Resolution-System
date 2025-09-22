import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { FaBell } from "react-icons/fa";

const data = [
    { day: "Mon", reports: 12 },
    { day: "Tue", reports: 18 },
    { day: "Wed", reports: 24 },
    { day: "Thu", reports: 20 },
    { day: "Fri", reports: 30 },
    { day: "Sat", reports: 22 },
    { day: "Sun", reports: 16 },
];

export default function LiveReports({ className }) {
    return (
        <div
            className={`${className} relative bg-gradient-to-br from-emerald-400 to-emerald-600/80 backdrop-blur-md rounded-2xl shadow-xl p-6 text-white flex flex-col justify-between`}
            style={{ minHeight: "250px" }}
        >
            {/* Icon */}
            <div className="absolute top-4 right-4 text-white/30 text-3xl">
                <FaBell />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2">Live Reports</h3>

            {/* Main Metric */}
            <p className="text-4xl font-bold mb-1 drop-shadow-md">145</p>
            <p className="text-sm text-white/70 mb-4">Reports submitted this week</p>

            {/* Sparkline / mini line chart */}
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.7)",
                                border: "none",
                                borderRadius: "6px",
                                color: "#fff",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="reports"
                            stroke="#ffffff"
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#34D399", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
