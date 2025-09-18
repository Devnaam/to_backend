import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = "/api";

function App() {
  const [todos, setTodos] = useState([]);
  
  // State for the new task form
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("Medium");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState("General");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data } = await axios.get(API_BASE + '/todos');
    setTodos(data);
  };

  // ADD TODO: Now sends all the new fields to the backend
  const addTodo = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    if (newTodoText.trim() === "") return;

    const { data } = await axios.post(API_BASE + '/todos', {
      text: newTodoText,
      priority: newTodoPriority,
      dueDate: newTodoDueDate,
      category: newTodoCategory
    });

    setTodos([...todos, data]);

    // Clear input fields after submission
    setNewTodoText("");
    setNewTodoPriority("Medium");
    setNewTodoDueDate("");
    setNewTodoCategory("General");
  };
  
  // TOGGLE COMPLETE: Now uses the updated PUT route
  const toggleTodoComplete = async (id, currentStatus) => {
    const { data } = await axios.put(API_BASE + '/todos/' + id, {
        completed: !currentStatus
    });

    setTodos(todos.map(todo => (todo._id === data._id ? data : todo)));
  };

  // DELETE TODO: No changes needed here
  const deleteTodo = async (id) => {
    await axios.delete(API_BASE + '/todos/' + id);
    setTodos(todos.filter(todo => todo._id !== id));
  };

  // Helper to format the date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="App">
      <h1>Advanced To-Do List</h1>
      
      {/* --- NEW ADD TASK FORM --- */}
      <form className="add-task-form" onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={e => setNewTodoText(e.target.value)}
          placeholder="Add a new task..."
          required
        />
        <div className="form-row">
          <select value={newTodoPriority} onChange={e => setNewTodoPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <input
            type="date"
            value={newTodoDueDate}
            onChange={e => setNewTodoDueDate(e.target.value)}
          />
          <input
            type="text"
            value={newTodoCategory}
            onChange={e => setNewTodoCategory(e.target.value)}
            placeholder="Category"
          />
        </div>
        <button type="submit">Add Task</button>
      </form>

      {/* --- UPDATED TODO LIST DISPLAY --- */}
      <div className="todo-list">
        {todos.map(todo => (
          <div
            key={todo._id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <div className="todo-content" onClick={() => toggleTodoComplete(todo._id, todo.completed)}>
              <p>{todo.text}</p>
              <div className="todo-details">
                <span className={`priority-tag priority-${todo.priority.toLowerCase()}`}>{todo.priority}</span>
                <span className="category-badge">{todo.category}</span>
                {todo.dueDate && <span className="due-date">Due: {formatDate(todo.dueDate)}</span>}
              </div>
            </div>
            <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;