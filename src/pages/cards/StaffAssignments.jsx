export default function StaffAssignments({ className }) {
    const data = [
        { staff: "Alice", task: "Sanitation - Sector 5", status: "Pending" },
        { staff: "Bob", task: "Traffic - Main St", status: "In Progress" },
        { staff: "Charlie", task: "Recycling - Zone 3", status: "Completed" },
    ];

    return (
        <div className={`${className} bg-white rounded-xl shadow-md p-4`}>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Staff Assignments</h3>
            <table className="w-full text-left text-sm">
                <thead>
                <tr className="border-b">
                    <th className="py-2 px-2">Staff</th>
                    <th className="py-2 px-2">Task</th>
                    <th className="py-2 px-2">Status</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{row.staff}</td>
                        <td className="py-2 px-2">{row.task}</td>
                        <td
                            className={`py-2 px-2 font-medium ${
                                row.status === "Completed"
                                    ? "text-green-600"
                                    : row.status === "In Progress"
                                        ? "text-yellow-500"
                                        : "text-red-500"
                            }`}
                        >
                            {row.status}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
