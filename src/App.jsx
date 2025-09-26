import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import ThemeToggle from './components/ThemeToggle';
import { useTasks } from './hooks/useTasks';

function App() {
  const { tasks, loading, error, getTasks } = useTasks();
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    completed: '',
    dueDateStart: '',
    dueDateEnd: '',
    sortBy: '', // Options: 'dueDateAsc', 'dueDateDesc', 'createdAtAsc', 'createdAtDesc', 'priorityAsc', 'priorityDesc'
  });
  const [localTasks, setLocalTasks] = useState([]);

  // Fetch tasks
  const refreshTasks = useCallback(async () => {
    try {
      console.log('Fetching tasks...'); // Debug log
      const data = await getTasks();
      console.log('Fetched tasks:', data); // Debug log
      setLocalTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [getTasks]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300 text-lg">
      Loading...
    </div>
  );
  if (error) return (
    <div className="text-red-500 dark:text-red-400 text-center text-lg">
      Error: {error}
    </div>
  );

  // Filter and sort tasks
  const filteredTasks = Array.isArray(localTasks) ? localTasks
    .filter(task => {
      console.log('Filtering task:', task); // Debug log
      // Search filter
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      // Completed filter
      if (filters.completed !== '' && task.completed.toString() !== filters.completed) {
        return false;
      }
      // Due date range filter
      if (filters.dueDateStart && task.dueDate) {
        const startDate = new Date(filters.dueDateStart);
        const taskDueDate = new Date(task.dueDate);
        if (taskDueDate < startDate) return false;
      }
      if (filters.dueDateEnd && task.dueDate) {
        const endDate = new Date(filters.dueDateEnd);
        const taskDueDate = new Date(task.dueDate);
        if (taskDueDate > endDate) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'dueDateAsc':
          return (a.dueDate || '9999-12-31') > (b.dueDate || '9999-12-31') ? 1 : -1;
        case 'dueDateDesc':
          return (a.dueDate || '9999-12-31') < (b.dueDate || '9999-12-31') ? 1 : -1;
        case 'createdAtAsc':
          return new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1;
        case 'createdAtDesc':
          return new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1;
        case 'priorityAsc':
          const priorityOrder = { LOW: 3, MEDIUM: 2, HIGH: 1 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'priorityDesc':
          const priorityOrderDesc = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          return priorityOrderDesc[a.priority] - priorityOrderDesc[b.priority];
        default:
          return 0; // No sorting
      }
    }) : [];

  console.log('Filtered tasks:', filteredTasks); // Debug log

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-5xl mx-auto flex justify-between items-center mb-10"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Task Manager Pro
        </h1>
        <ThemeToggle />
      </motion.header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-5xl mx-auto"
      >
        <AddTaskForm onSuccess={refreshTasks} />
        <div className="mb-8 flex flex-wrap gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex-1 min-w-[200px]"
          />
          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 min-w-[150px]"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {/* Completed Filter */}
          {/* <select
            value={filters.completed}
            onChange={(e) => setFilters({ ...filters, completed: e.target.value })}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
          </select> */}
          {/* Due Date Start */}
          {/* <input
            type="date"
            value={filters.dueDateStart}
            onChange={(e) => setFilters({ ...filters, dueDateStart: e.target.value })}
            placeholder="Due Date Start"
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 min-w-[150px]"
          /> */}
          {/* Due Date End */}
          {/* <input
            type="date"
            value={filters.dueDateEnd}
            onChange={(e) => setFilters({ ...filters, dueDateEnd: e.target.value })}
            placeholder="Due Date End"
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 min-w-[150px]"
          /> */}
          {/* Sort By */}
          {/* <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 min-w-[150px]"
          >
            <option value="">Sort By</option>
            <option value="dueDateAsc">Due Date (Earliest First)</option>
            <option value="dueDateDesc">Due Date (Latest First)</option>
            <option value="createdAtAsc">Created (Oldest First)</option>
            <option value="createdAtDesc">Created (Newest First)</option>
            <option value="priorityAsc">Priority (Low to High)</option>
            <option value="priorityDesc">Priority (High to Low)</option>
          </select> */}
        </div>
        <TaskList tasks={filteredTasks} onRefresh={refreshTasks} />
      </motion.main>
    </div>
  );
}

export default App;