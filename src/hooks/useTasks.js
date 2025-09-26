import axios from "axios";
import { useCallback } from "react";

const API_URL = "http://localhost:5000/api/tasks";

export function useTasks() {
  const createTask = useCallback(async (task) => {
    const res = await axios.post(API_URL, task);
    return res.data;
  }, []);

  const getTasks = useCallback(async () => {
    const res = await axios.get(API_URL);
    return res.data;
  }, []);


const updateTask = async (id, updates) => {
  const res = await axios.put(`${API_URL}/${id}`, updates);
  return res.data;
};


  const deleteTask = useCallback(async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }, []);

  return { createTask, getTasks, updateTask, deleteTask };
}
