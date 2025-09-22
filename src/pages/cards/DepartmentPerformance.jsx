import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { department: "Sanitation", completed: 80 },
    { department: "Traffic", completed: 65 },
    { department: "Recycling", completed: 90 },
    { department: "Public Works", completed: 50 },
];

export default function DepartmentPerformance({ className }) {
    return (
        <div className={`${className} bg-white rounded-xl shadow-md p-4`}>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Department Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" data={data}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#6366F1" radius={5} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
