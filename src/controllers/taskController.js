const z = require('zod');
const pool = require('../db/db');

// Validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  completed: z.boolean().optional()
});

const getAllTasks = async (req, res, next) => {
  try {
    const { search, priority, completed } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (completed !== undefined) {
      query += ' AND completed = ?';
      params.push(completed === 'true' ? 1 : 0);
    }

    query += ' ORDER BY createdAt DESC';

    const [tasks] = await pool.query(query, params);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    const { title, description, priority, dueDate } = validatedData;

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, priority, dueDate) VALUES (?, ?, ?, ?)',
      [title, description || null, priority, dueDate || null]
    );

    const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = taskSchema.partial().parse(req.body);
    const { title, description, priority, dueDate, completed } = validatedData;

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (completed !== undefined) updates.completed = completed;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates);

    const [result] = await pool.query(
      `UPDATE tasks SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedTask[0]);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };