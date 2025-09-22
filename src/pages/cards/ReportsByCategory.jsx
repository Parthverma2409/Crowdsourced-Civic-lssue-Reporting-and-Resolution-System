import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { category: "Sanitation", count: 50 },
    { category: "Traffic", count: 30 },
    { category: "Recycling", count: 20 },
    { category: "Public Works", count: 15 },
];

export default function ReportsByCategory({ className }) {
    return (
        <div className={`${className} bg-white rounded-xl shadow-md p-4`}>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Reports by Category</h3>
            <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data}>
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
