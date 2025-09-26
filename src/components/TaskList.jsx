import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useTasks } from "../hooks/useTasks";

const priorities = ["LOW", "MEDIUM", "HIGH"];

export default function TaskList({ tasks: propTasks, onRefresh }) {
  const { getTasks, updateTask, deleteTask } = useTasks();
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  // Normalize task data (convert completed to boolean)
  const normalizeTask = (task) => ({
    ...task,
    completed: !!task.completed, // Convert 0/1 to false/true
  });

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data.map(normalizeTask));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [getTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditForm(normalizeTask(task));
  };

  const saveEdit = async () => {
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
      };
      console.log("Updating task payload:", payload); // Debug log
      const updated = await updateTask(editForm.id, payload);
      setTasks(tasks.map((t) => (t.id === editForm.id ? normalizeTask(updated) : t)));
      setEditingId(null);
      setEditForm({});
      if (onRefresh) onRefresh(); // Trigger refresh in App
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log("Deleting task:", id); // Debug log
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
      if (onRefresh) onRefresh(); // Trigger refresh in App
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleCompleted = async (task) => {
    try {
      const payload = {
        completed: !task.completed,
      };
      console.log("Toggling completed for task:", task.id, payload); // Debug log
      const updated = await updateTask(task.id, payload);
      setTasks(tasks.map((t) => (t.id === task.id ? normalizeTask(updated) : t)));
      if (onRefresh) onRefresh(); // Trigger refresh in App
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  // Use propTasks if provided, else fallback to local tasks
  const displayTasks = (propTasks || tasks).map(normalizeTask);

  if (loading) return <p className="text-center text-gray-500 dark:text-gray-400">Loading tasks...</p>;
  if (displayTasks.length === 0)
    return <p className="text-center text-gray-500 dark:text-gray-400">No tasks found. Add one above!</p>;

  return (
    <ul className="space-y-4">
      <AnimatePresence>
        {displayTasks.map((task) => (
          <motion.li
            key={task.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`p-6 rounded-xl shadow-md transition ${
              task.completed
                ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                : task.priority === "HIGH"
                ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                : task.priority === "MEDIUM"
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500"
                : "bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500"
            }`}
          >
            {editingId === task.id ? (
              <div className="space-y-3">
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3 py-1 border rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-1 border rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority: e.target.value })
                  }
                  className="w-full px-3 py-1 border rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => saveEdit()}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-gray-800 dark:text-gray-100 ${
                      task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        task.priority === "HIGH"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          : task.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      }`}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCompleted(task)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Done</span>
                  </label>
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}