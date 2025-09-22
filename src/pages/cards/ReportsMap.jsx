import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Initial dummy reports
const initialReports = [
    { id: 1, lat: 28.6139, lng: 77.209, type: "Sanitation", desc: "Garbage overflow in street 5" },
    { id: 2, lat: 28.620, lng: 77.210, type: "Traffic", desc: "Broken traffic signal" },
];

export default function ReportsMap({ className }) {
    const [reports, setReports] = useState(initialReports);

    // Simulate new reports arriving every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const newReport = {
                id: reports.length + 1,
                lat: 28.6139 + Math.random() * 0.01,
                lng: 77.209 + Math.random() * 0.01,
                type: ["Sanitation", "Traffic", "Recycling", "Public Works"][
                    Math.floor(Math.random() * 4)
                    ],
                desc: "New report submitted",
            };
            setReports((prev) => [...prev, newReport]);
        }, 5000);

        return () => clearInterval(interval);
    }, [reports]);

    return (
        <div
            className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}
            style={{ height: "100%" }}
        >
            <h2 className="font-semibold text-gray-700 mb-3">City Reports Map</h2>
            <div className="h-64 md:h-[400px] w-full rounded-lg overflow-hidden">
                <MapContainer
                    center={[28.6139, 77.209]}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                    />
                    {reports.map((report) => (
                        <Marker key={report.id} position={[report.lat, report.lng]}>
                            <Popup>
                                <div>
                                    <strong>{report.type}</strong>
                                    <p>{report.desc}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
