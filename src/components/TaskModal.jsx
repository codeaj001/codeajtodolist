import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Repeat, 
  CheckSquare, 
  Plus, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { 
  CATEGORIES, 
  DAYS_OF_WEEK, 
  getTodayString, 
  toDateString 
} from '../utils/dateUtils';

export function TaskModal({ 
  isOpen, 
  onClose, 
  onSaveTodo, 
  onSaveRoutine, 
  initialData = null, 
  defaultType = 'todo',
  defaultDate = null
}) {
  const [taskType, setTaskType] = useState(defaultType); // 'todo' | 'routine'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('work');
  
  // Todo specific fields
  const [dueDate, setDueDate] = useState(defaultDate || getTodayString());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Routine specific fields
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  // excludedDays: array of day ids (0=Sun, 1=Mon, ..., 6=Sat)
  const [excludedDays, setExcludedDays] = useState([]); 
  const [startDate, setStartDate] = useState(defaultDate || getTodayString());
  const [exceptionDates, setExceptionDates] = useState([]);
  const [newExceptionDate, setNewExceptionDate] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || 'work');

        if (initialData.frequency === 'daily' || initialData.excludedDays !== undefined) {
          setTaskType('routine');
          setTimeOfDay(initialData.timeOfDay || '08:00');
          setExcludedDays(initialData.excludedDays || []);
          setStartDate(initialData.startDate || getTodayString());
          setExceptionDates(initialData.customExceptionDates || []);
        } else {
          setTaskType('todo');
          setDueDate(initialData.dueDate || defaultDate || getTodayString());
          setDueTime(initialData.dueTime || '');
          setPriority(initialData.priority || 'medium');
          setSubtasks(initialData.subtasks || []);
        }
      } else {
        // Reset defaults
        setTaskType(defaultType);
        setTitle('');
        setDescription('');
        setCategory('work');
        setDueDate(defaultDate || getTodayString());
        setDueTime('');
        setPriority('medium');
        setSubtasks([]);
        setTimeOfDay('08:00');
        setExcludedDays([]);
        setStartDate(defaultDate || getTodayString());
        setExceptionDates([]);
      }
      setError('');
    }
  }, [isOpen, initialData, defaultType, defaultDate]);

  if (!isOpen) return null;

  const handleToggleDay = (dayId) => {
    if (excludedDays.includes(dayId)) {
      // Re-enable this day (remove from excluded)
      setExcludedDays(excludedDays.filter(d => d !== dayId));
    } else {
      // Exclude this day (must have at least one day active)
      if (excludedDays.length >= 6) {
        setError('At least one day of the week must remain active.');
        return;
      }
      setExcludedDays([...excludedDays, dayId]);
    }
  };

  const handlePresetDays = (preset) => {
    setError('');
    if (preset === 'all') {
      setExcludedDays([]);
    } else if (preset === 'weekdays') {
      // Exclude Sunday (0) and Saturday (6)
      setExcludedDays([0, 6]);
    } else if (preset === 'weekends') {
      // Exclude Mon-Fri (1,2,3,4,5)
      setExcludedDays([1, 2, 3, 4, 5]);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'sub-' + Date.now(), title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleAddExceptionDate = () => {
    if (!newExceptionDate) return;
    if (!exceptionDates.includes(newExceptionDate)) {
      setExceptionDates([...exceptionDates, newExceptionDate].sort());
    }
    setNewExceptionDate('');
  };

  const handleRemoveExceptionDate = (dateStr) => {
    setExceptionDates(exceptionDates.filter(d => d !== dateStr));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the task.');
      return;
    }

    if (taskType === 'todo') {
      onSaveTodo({
        id: initialData ? initialData.id : 'todo-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime: dueTime || null,
        priority,
        category,
        subtasks,
        completed: initialData ? initialData.completed : false,
        completedAt: initialData ? initialData.completedAt : null,
      });
    } else {
      onSaveRoutine({
        id: initialData ? initialData.id : 'routine-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        category,
        color: CATEGORIES.find(c => c.id === category)?.color || '#6366f1',
        timeOfDay: timeOfDay || 'Anytime',
        frequency: 'daily',
        excludedDays, // Days of week user does not want to do this task
        customExceptionDates: exceptionDates, // Specific dates skipped
        startDate,
        completedHistory: initialData?.completedHistory || {},
      });
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {initialData ? 'Edit Item' : 'Create New Item'}
          </div>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Task Type Switcher (only when creating new) */}
            {!initialData && (
              <div className="form-group">
                <label className="form-label">Item Type</label>
                <div className="form-type-toggle">
                  <button
                    type="button"
                    className={`type-toggle-btn ${taskType === 'todo' ? 'active' : ''}`}
                    onClick={() => setTaskType('todo')}
                  >
                    <CheckSquare size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    One-time Task
                  </button>
                  <button
                    type="button"
                    className={`type-toggle-btn ${taskType === 'routine' ? 'active' : ''}`}
                    onClick={() => setTaskType('routine')}
                  >
                    <Repeat size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Daily Recurring Habit
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--danger-subtle)',
                color: 'var(--danger)',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={taskType === 'todo' ? 'e.g., Deliver Quarterly Roadmap' : 'e.g., Daily 30-min Reading or Workout'}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Notes & Details (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add context, links, or expectations..."
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* --- SPECIFIC TO ONE-TIME TODO --- */}
            {taskType === 'todo' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Time (Optional)</label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {['low', 'medium', 'high'].map(p => (
                      <button
                        key={p}
                        type="button"
                        className="pill-btn"
                        style={{
                          textTransform: 'capitalize',
                          backgroundColor: priority === p ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                          borderColor: priority === p ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          color: priority === p ? 'var(--accent-text)' : 'var(--text-secondary)',
                          justifyContent: 'center'
                        }}
                        onClick={() => setPriority(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtasks builder */}
                <div className="form-group">
                  <label className="form-label">Checklist / Subtasks</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      placeholder="Add step or subtask..."
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={handleAddSubtask}
                      title="Add subtask"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {subtasks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {subtasks.map(sub => (
                        <div 
                          key={sub.id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: 'var(--bg-app)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.84rem'
                          }}
                        >
                          <span>{sub.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(sub.id)}
                            style={{ color: 'var(--text-tertiary)', padding: '2px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* --- SPECIFIC TO DAILY ROUTINE / AUTO-LOOPING HABIT --- */}
            {taskType === 'routine' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Scheduled Time</label>
                    <input
                      type="time"
                      value={timeOfDay}
                      onChange={e => setTimeOfDay(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Starting Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Day of week auto-looping selector */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="form-label">Repeat Every Weekday</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="pill-btn"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => handlePresetDays('all')}
                      >
                        All 7 Days
                      </button>
                      <button
                        type="button"
                        className="pill-btn"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => handlePresetDays('weekdays')}
                      >
                        Mon–Fri Only
                      </button>
                      <button
                        type="button"
                        className="pill-btn"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => handlePresetDays('weekends')}
                      >
                        Weekends
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Click any day to toggle on or off. Unselected days will be automatically skipped!
                  </p>

                  <div className="day-picker-group">
                    {DAYS_OF_WEEK.map(day => {
                      const isExcluded = excludedDays.includes(day.id);
                      const isIncluded = !isExcluded;
                      return (
                        <button
                          key={day.id}
                          type="button"
                          className={`day-picker-btn ${isIncluded ? 'selected' : ''}`}
                          onClick={() => handleToggleDay(day.id)}
                          title={`${day.full}: ${isIncluded ? 'Active' : 'Excluded'}`}
                        >
                          {day.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Dates Exception List */}
                <div className="form-group">
                  <label className="form-label">Specific Days to Skip (Exceptions)</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Specify any specific vacation or blackout days you do not want this task to loop.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="date"
                      value={newExceptionDate}
                      onChange={e => setNewExceptionDate(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="pill-btn"
                      onClick={handleAddExceptionDate}
                      disabled={!newExceptionDate}
                    >
                      <Plus size={14} style={{ marginRight: '4px' }} /> Skip Date
                    </button>
                  </div>

                  {exceptionDates.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {exceptionDates.map(dStr => (
                        <span 
                          key={dStr} 
                          className="meta-chip num-tabular"
                          style={{ gap: '6px', backgroundColor: 'var(--bg-app)' }}
                        >
                          <span>{dStr} (Skipped)</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExceptionDate(dStr)}
                            style={{ color: 'var(--danger)', cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="pill-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {initialData ? 'Save Changes' : (taskType === 'todo' ? 'Create Task' : 'Create Daily Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
