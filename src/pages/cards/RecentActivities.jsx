export default function RecentActivities({ className }) {
    const activities = [
        { time: "10 min ago", text: "New report submitted in Downtown" },
        { time: "30 min ago", text: "Report resolved: Broken traffic signal" },
        { time: "1 hr ago", text: "Staff assigned to sanitation issue" },
    ];

    return (
        <div className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}>
            <h2 className="font-semibold text-gray-700 mb-3">Recent Activities</h2>
            <ul className="space-y-2 text-gray-600 text-sm">
                {activities.map((act, idx) => (
                    <li key={idx} className="flex justify-between">
                        <span>{act.text}</span>
                        <span className="text-gray-400">{act.time}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
