import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("/api/workers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch workers");
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("workers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "workers" }, () => {
        fetchWorkers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkers]);

  return { workers, loading, error, refetch: fetchWorkers };
}

export async function createWorker(token, workerData) {
  const res = await fetch("/api/create-worker", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workerData),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create worker");
  }

  return res.json();
}

export async function toggleWorkerAvailability(token, workerId, isAvailable) {
  const res = await fetch(`/api/workers?id=${workerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_available: isAvailable }),
  });

  if (!res.ok) throw new Error("Failed to update availability");
  return res.json();
}
