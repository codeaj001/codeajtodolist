import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Clock, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3, 
  Search, 
  ListChecks, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CATEGORIES, 
  formatFriendlyDate, 
  getTodayString 
} from '../utils/dateUtils';

export function TodoListView({ 
  todos, 
  onToggleTodo, 
  onToggleSubtask, 
  onDeleteTodo, 
  onEditTodo, 
  onOpenNewModal,
  activeCategory,
  setActiveCategory,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [expandedSubtasks, setExpandedSubtasks] = useState({});

  const todayStr = getTodayString();

  const toggleSubtaskExpand = (id) => {
    setExpandedSubtasks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCheckboxClick = (todo) => {
    const willBeCompleted = !todo.completed;
    onToggleTodo(todo.id);

    if (willBeCompleted) {
      // Trigger subtle delightful celebratory confetti
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4']
      });
      if (onShowToast) onShowToast(`Completed "${todo.title}"`);
    }
  };

  // Filter todos
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      // Category filter
      if (activeCategory !== 'all' && t.category !== activeCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pending' && t.completed) return false;
      if (statusFilter === 'completed' && !t.completed) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [todos, activeCategory, statusFilter, searchQuery]);

  // Grouping
  const grouped = useMemo(() => {
    const overdue = [];
    const today = [];
    const upcoming = [];
    const completed = [];

    filteredTodos.forEach(t => {
      if (t.completed) {
        completed.push(t);
      } else if (t.dueDate < todayStr) {
        overdue.push(t);
      } else if (t.dueDate === todayStr) {
        today.push(t);
      } else {
        upcoming.push(t);
      }
    });

    // Sort upcoming by due date ascending
    upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return { overdue, today, upcoming, completed };
  }, [filteredTodos, todayStr]);

  const renderTodoCard = (todo) => {
    const cat = CATEGORIES.find(c => c.id === todo.category) || CATEGORIES[0];
    const isExpanded = !!expandedSubtasks[todo.id];
    const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
    const completedSubtasksCount = hasSubtasks 
      ? todo.subtasks.filter(s => s.completed).length 
      : 0;

    return (
      <div 
        key={todo.id} 
        className={`todo-card ${todo.completed ? 'completed' : ''}`}
      >
        <button
          type="button"
          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => handleCheckboxClick(todo)}
          aria-label={todo.completed ? 'Mark task pending' : 'Mark task completed'}
        >
          {todo.completed && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="todo-content">
          <div className="todo-title">{todo.title}</div>
          {todo.description && (
            <div className="todo-desc">{todo.description}</div>
          )}

          <div className="todo-meta">
            {/* Category tag */}
            <span className="meta-chip" style={{ color: cat.color }}>
              <span className="filter-category-dot" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </span>

            {/* Due date tag */}
            <span className="meta-chip num-tabular">
              <CalendarIcon size={12} />
              <span>{formatFriendlyDate(todo.dueDate)}</span>
              {todo.dueTime && <span>• {todo.dueTime}</span>}
            </span>

            {/* Priority tag */}
            <span className={`meta-chip priority-chip-${todo.priority}`}>
              {todo.priority.toUpperCase()}
            </span>

            {/* Subtasks summary tag */}
            {hasSubtasks && (
              <button
                type="button"
                className="meta-chip"
                onClick={() => toggleSubtaskExpand(todo.id)}
                style={{ cursor: 'pointer' }}
              >
                <ListChecks size={12} />
                <span>{completedSubtasksCount}/{todo.subtasks.length} subtasks</span>
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* Subtasks list */}
          {hasSubtasks && isExpanded && (
            <div className="subtasks-wrapper">
              {todo.subtasks.map(sub => (
                <div key={sub.id} className="subtask-item">
                  <button
                    type="button"
                    className={`subtask-checkbox ${sub.completed ? 'checked' : ''}`}
                    onClick={() => onToggleSubtask(todo.id, sub.id)}
                  >
                    {sub.completed && <Check size={10} strokeWidth={3} />}
                  </button>
                  <span style={{ 
                    textDecoration: sub.completed ? 'line-through' : 'none',
                    opacity: sub.completed ? 0.6 : 1 
                  }}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="todo-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => onEditTodo(todo)}
            title="Edit task"
            style={{ width: '30px', height: '30px' }}
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onDeleteTodo(todo.id)}
            title="Delete task"
            style={{ width: '30px', height: '30px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  const totalFilteredCount = filteredTodos.length;

  return (
    <div>
      {/* Top Filter and Search Bar */}
      <div className="action-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks, details, tags..."
          />
        </div>

        <div className="filter-pills">
          <button
            type="button"
            className={`pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Tasks
          </button>
          <button
            type="button"
            className={`pill-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            type="button"
            className={`pill-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {totalFilteredCount === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ListChecks size={24} />
          </div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-desc">
            {searchQuery 
              ? 'Try changing your search keywords or clear the filter.' 
              : 'Keep your mind clear. Capture your next goal or action item.'}
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenNewModal('todo')}
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Overdue Section */}
          {grouped.overdue.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div className="task-group-heading" style={{ color: 'var(--danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>Overdue ({grouped.overdue.length})</span>
                </div>
              </div>
              <div className="task-list-grid">
                {grouped.overdue.map(renderTodoCard)}
              </div>
            </div>
          )}

          {/* Today Section */}
          {grouped.today.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div className="task-group-heading">
                <span>Due Today ({grouped.today.length})</span>
              </div>
              <div className="task-list-grid">
                {grouped.today.map(renderTodoCard)}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {grouped.upcoming.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div className="task-group-heading">
                <span>Upcoming ({grouped.upcoming.length})</span>
              </div>
              <div className="task-list-grid">
                {grouped.upcoming.map(renderTodoCard)}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {grouped.completed.length > 0 && (
            <div>
              <div className="task-group-heading" style={{ color: 'var(--text-secondary)' }}>
                <span>Completed ({grouped.completed.length})</span>
              </div>
              <div className="task-list-grid">
                {grouped.completed.map(renderTodoCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
