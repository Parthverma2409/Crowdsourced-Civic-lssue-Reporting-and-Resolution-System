export default function ReportCard({ icon, title, value, color }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition">
            <div className={`text-3xl ${color}`}>{icon}</div>
            <div>
                <h3 className="text-gray-600 text-sm">{title}</h3>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </div>
    );
}
