export default function ReportTimeline({ className }) {
    const timeline = [
        { time: "09:00 AM", event: "Report submitted" },
        { time: "09:15 AM", event: "Acknowledged by staff" },
        { time: "10:00 AM", event: "Assigned to department" },
        { time: "12:30 PM", event: "Resolved" },
    ];

    return (
        <div className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}>
            <h2 className="font-semibold text-gray-700 mb-4">Report Timeline</h2>
            <ul className="space-y-3 text-gray-600">
                {timeline.map((t, idx) => (
                    <li key={idx} className="flex justify-between">
                        <span className="font-medium">{t.time}</span>
                        <span>{t.event}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
