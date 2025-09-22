import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "High", value: 45 },
    { name: "Medium", value: 70 },
    { name: "Low", value: 30 },
];

const COLORS = ["#EF4444", "#F59E0B", "#10B981"];

export default function ReportsByPriority({ className }) {
    return (
        <div className={`${className} bg-white rounded-xl shadow-md p-4`}>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Reports by Priority</h3>
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={60}
                        fill="#8884d8"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
