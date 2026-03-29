import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useWorkerTasks(workerId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!workerId) return;
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/tasks?worker_id=${workerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workerId, getToken]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime
  useEffect(() => {
    if (!workerId) return;

    const channel = supabase
      .channel(`tasks-worker-${workerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `worker_id=eq.${workerId}` },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId, fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}

export async function updateTaskStatus(token, taskId, status, extras = {}) {
  const res = await fetch(`/api/tasks?id=${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, ...extras }),
  });

  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}
