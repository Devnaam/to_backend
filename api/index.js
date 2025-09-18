// api/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cors());

// CONNECT TO MONGODB ATLAS
// This line now safely reads the connection string from your Vercel project's settings.
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected successfully!");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// DEFINE A SCHEMA AND MODEL
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    default: 'General'
  }
});

const Todo = mongoose.model('Todo', todoSchema);

// API ROUTES

// GET all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching todos" });
  }
});

// POST a new todo
app.post('/todos', async (req, res) => {
  const { text, priority, dueDate, category } = req.body;
  try {
    const newTodo = new Todo({ text, priority, dueDate, category });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: "Error creating todo" });
  }
});

// DELETE a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting todo" });
  }
});

// PUT (update) a todo
app.put('/todos/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        if (!updatedTodo) return res.status(404).json({ message: "Todo not found" });
        res.json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// This line allows Vercel to use your Express app.
module.exports = app;