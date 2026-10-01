import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Clock, 
  Repeat, 
  CheckSquare, 
  Trash2,
  CalendarOff
} from 'lucide-react';
import { 
  CATEGORIES, 
  formatFriendlyDate, 
  isRoutineActiveOnDate, 
  getTodayString 
} from '../utils/dateUtils';

export function DayDetailModal({ 
  isOpen, 
  onClose, 
  dateStr, 
  todos = [], 
  routines = [],
  onToggleTodo,
  onToggleRoutineForDate,
  onSkipRoutineForDate,
  onOpenNewTaskModal
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'todos' | 'routines'

  if (!isOpen || !dateStr) return null;

  const todayStr = getTodayString();
  const isCurrentToday = dateStr === todayStr;

  // Filter items for this date
  const dayTodos = todos.filter(t => t.dueDate === dateStr);
  
  // Routines active on this date
  const dayRoutines = routines.filter(r => isRoutineActiveOnDate(r, dateStr));
  
  // Routines skipped specifically on this date
  const skippedRoutines = routines.filter(r => r.customExceptionDates?.includes(dateStr));

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
              <CalendarIcon size={15} />
            </div>
            <div>
              <div className="modal-title">{formatFriendlyDate(dateStr, 'full')}</div>
              {isCurrentToday && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-text)', fontWeight: 600 }}>
                  Today's Agenda
                </span>
              )}
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Add for this specific date */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                onClose();
                onOpenNewTaskModal('todo', dateStr);
              }}
            >
              <Plus size={15} />
              <span>Add Task for this Day</span>
            </button>

            <button
              type="button"
              className="pill-btn"
              onClick={() => {
                onClose();
                onOpenNewTaskModal('routine', dateStr);
              }}
            >
              <Repeat size={15} style={{ marginRight: '4px' }} />
              <span>New Habit</span>
            </button>
          </div>

          {/* Section: One-time Todos */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              paddingBottom: '4px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Scheduled Tasks ({dayTodos.length})
              </span>
            </div>

            {dayTodos.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '6px 0' }}>
                No one-off tasks scheduled for this day.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dayTodos.map(todo => {
                  const cat = CATEGORIES.find(c => c.id === todo.category) || CATEGORIES[0];
                  return (
                    <div 
                      key={todo.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
                          onClick={() => onToggleTodo(todo.id)}
                        >
                          {todo.completed && <Check size={12} strokeWidth={3} />}
                        </button>
                        <div>
                          <div style={{ 
                            fontSize: '0.88rem', 
                            fontWeight: 500,
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            opacity: todo.completed ? 0.6 : 1
                          }}>
                            {todo.title}
                          </div>
                          {todo.dueTime && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                              {todo.dueTime}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="meta-chip" style={{ color: cat.color }}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Daily Routines Auto-Looping on this date */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              paddingBottom: '4px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Daily Auto-Loop Habits ({dayRoutines.length})
              </span>
            </div>

            {dayRoutines.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '6px 0' }}>
                No recurring habits active on this day.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dayRoutines.map(routine => {
                  const isDone = !!routine.completedHistory?.[dateStr];
                  const cat = CATEGORIES.find(c => c.id === routine.category) || CATEGORIES[0];
                  return (
                    <div 
                      key={routine.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                          style={{
                            backgroundColor: isDone ? 'var(--success)' : 'transparent',
                            borderColor: isDone ? 'var(--success)' : 'var(--border-medium)',
                            color: '#ffffff'
                          }}
                          onClick={() => onToggleRoutineForDate(routine.id, dateStr)}
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </button>
                        <div>
                          <div style={{ 
                            fontSize: '0.88rem', 
                            fontWeight: 500,
                            textDecoration: isDone ? 'line-through' : 'none',
                            opacity: isDone ? 0.6 : 1
                          }}>
                            {routine.title}
                          </div>
                          {routine.timeOfDay && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                              {routine.timeOfDay}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="meta-chip" style={{ color: cat.color }}>
                          {cat.name}
                        </span>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Skip this habit on this date"
                          onClick={() => onSkipRoutineForDate(routine.id, dateStr)}
                        >
                          <CalendarOff size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Skipped / Exceptions for this day */}
          {skippedRoutines.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Skipped Exceptions ({skippedRoutines.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {skippedRoutines.map(r => (
                  <span 
                    key={r.id} 
                    className="meta-chip" 
                    style={{ color: 'var(--warning)', gap: '6px' }}
                  >
                    <span>{r.title}</span>
                    <button
                      type="button"
                      style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                      onClick={() => onSkipRoutineForDate(r.id, dateStr)}
                      title="Undo skip"
                    >
                      Undo
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
