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
  CalendarOff,
  ExternalLink,
  Video,
  MapPin,
  UploadCloud
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
  googleEvents = [],
  onToggleTodo,
  onToggleRoutineForDate,
  onSkipRoutineForDate,
  onOpenNewTaskModal,
  onPushTaskToGCal
}) {
  if (!isOpen || !dateStr) return null;

  const todayStr = getTodayString();
  const isCurrentToday = dateStr === todayStr;

  // Filter items for this date
  const dayTodos = todos.filter(t => t.dueDate === dateStr);
  const dayRoutines = routines.filter(r => isRoutineActiveOnDate(r, dateStr));
  const dayGoogleEvents = googleEvents.filter(g => g.dueDate === dateStr);
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
                  Today's Schedule
                </span>
              )}
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Actions */}
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

          {/* Section: Google Calendar Events */}
          {dayGoogleEvents.length > 0 && (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '8px',
                paddingBottom: '4px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4285F4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarIcon size={14} />
                  <span>Google Calendar Events ({dayGoogleEvents.length})</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dayGoogleEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(66, 133, 244, 0.08)',
                      border: '1px solid rgba(66, 133, 244, 0.25)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {event.title}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {event.dueTime && (
                          <span className="num-tabular" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            <span>{event.dueTime}</span>
                          </span>
                        )}
                        {event.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            <span>{event.location}</span>
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {event.hangoutLink && (
                        <a
                          href={event.hangoutLink}
                          target="_blank"
                          rel="noreferrer"
                          className="pill-btn"
                          style={{
                            backgroundColor: '#4285F4',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            gap: '4px',
                            textDecoration: 'none'
                          }}
                        >
                          <Video size={11} />
                          <span>Meet</span>
                        </a>
                      )}

                      {event.htmlLink && (
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.72rem', color: '#4285F4', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <span>Open GCal</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="meta-chip" style={{ color: cat.color }}>
                          {cat.name}
                        </span>
                        {onPushTaskToGCal && (
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ width: '28px', height: '28px' }}
                            title="Export task to Google Calendar"
                            onClick={() => onPushTaskToGCal(todo)}
                          >
                            <UploadCloud size={13} />
                          </button>
                        )}
                      </div>
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
