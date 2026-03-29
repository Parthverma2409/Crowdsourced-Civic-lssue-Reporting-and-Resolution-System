import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Navigation } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkerTasks } from "../../hooks/useWorkerTasks";
import useGeolocation from "../../hooks/useGeolocation";
import { capitalize } from "../../lib/utils";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "../../lib/constants";
import "leaflet/dist/leaflet.css";

const TASK_COLORS = {
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  escalated: "#ef4444",
};

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14);
    }
  }, [position, map]);
  return null;
}

export default function WorkerMapView() {
  const { user } = useAuth();
  const { tasks } = useWorkerTasks(user?.id);
  const { position } = useGeolocation();

  const center = position
    ? [position.lat, position.lng]
    : DEFAULT_CENTER;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Map View</h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-xl border bg-white px-4 py-3">
        {Object.entries(TASK_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {capitalize(status)}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
          You
        </div>
      </div>

      <div className="h-[calc(100vh-250px)] rounded-xl border overflow-hidden">
        <MapContainer center={center} zoom={DEFAULT_ZOOM} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo position={position} />

          {/* Worker location */}
          {position && (
            <CircleMarker
              center={[position.lat, position.lng]}
              radius={10}
              pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.8 }}
            >
              <Popup>Your location</Popup>
            </CircleMarker>
          )}

          {/* Task markers */}
          {tasks
            .filter((t) => t.report?.lat && t.report?.lng)
            .map((task) => (
              <CircleMarker
                key={task.id}
                center={[task.report.lat, task.report.lng]}
                radius={8}
                pathOptions={{
                  color: TASK_COLORS[task.status] || "#6b7280",
                  fillColor: TASK_COLORS[task.status] || "#6b7280",
                  fillOpacity: 0.7,
                }}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-medium">{task.report.title}</p>
                    {task.report.description && (
                      <p className="text-xs text-gray-600">{task.report.description}</p>
                    )}
                    <p className="text-xs">Status: {capitalize(task.status)}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${task.report.lat},${task.report.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Navigation className="h-3 w-3" />
                      Navigate
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}
