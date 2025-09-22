// src/NavigationRoutes.jsx
import { FaHome, FaTrafficLight, FaTools, FaRecycle } from "react-icons/fa";

const navigationRoutes = {
    routes: [

        {
            name: "civicActions",
            displayName: "Civic Actions",
            meta: { icon: <FaTools /> },
            children: [
                {
                    name: "reportIssue",
                    displayName: "Report Issue",
                },
                {
                    name: "viewStatus",
                    displayName: "View Status",
                },
            ],
        },
        {
            name: "traffic",
            displayName: "Traffic Management",
            meta: { icon: <FaTrafficLight /> },
            children: [
                {
                    name: "trafficSignals",
                    displayName: "Traffic Signals",
                },
                {
                    name: "violations",
                    displayName: "Violations",
                },
            ],
        },
        {
            name: "recycling",
            displayName: "Recycling Center",
            meta: { icon: <FaRecycle /> },
            children: [
                {
                    name: "dropOffPoints",
                    displayName: "Drop-off Points",
                },
                {
                    name: "collectionSchedule",
                    displayName: "Collection Schedule",
                },
            ],
        },

    ],
};

export default navigationRoutes;
