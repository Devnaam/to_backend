// backend/server.js

// 1. IMPORT PACKAGES
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// 2. MIDDLEWARE
// These lines are essential for our server to understand JSON and allow cross-origin requests.
app.use(express.json());
app.use(cors());

// 3. CONNECT TO MONGODB
// Paste your MongoDB connection string here. 
// Replace <username>, <password>, and <dbname> with your actual credentials.
const mongoURI = "mongodb://127.0.0.1:27017/my-todo-app-db";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected successfully!");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// 4. DEFINE A SCHEMA AND MODEL
// This is the blueprint for our to-do items.
// backend/server.js

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  // --- NEW FIELDS ---
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'], // Only allows these values
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    default: null // Can be empty
  },
  category: {
    type: String,
    default: 'General'
  }
});

const Todo = mongoose.model('Todo', todoSchema);

// 5. API ROUTES (Our CRUD operations)

// GET all todos (Read)
app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

// POST a new todo (Create)
// POST a new todo (Now accepts new fields)
app.post('/todos', async (req, res) => {
  const { text, priority, dueDate, category } = req.body;

  const newTodo = new Todo({
    text: text,
    priority: priority,
    dueDate: dueDate,
    category: category
  });

  await newTodo.save();
  res.status(201).json(newTodo);
});

// DELETE a todo
app.delete('/todos/:id', async (req, res) => {
  const result = await Todo.findByIdAndDelete(req.params.id);
  res.json(result);
});

// PUT (update) a todo to toggle completion
app.put('/todos/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id, 
            req.body, // Pass the entire request body to update
            { new: true } // This option returns the modified document
        );
        res.json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = app;