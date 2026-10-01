import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  Repeat, 
  Plus, 
  Filter,
  CheckCircle2,
  Circle,
  ExternalLink,
  Video,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { 
  DAYS_OF_WEEK, 
  CATEGORIES, 
  getMonthGrid, 
  getWeekDays, 
  getTodayString, 
  toDateString, 
  isRoutineActiveOnDate, 
  formatFriendlyDate 
} from '../utils/dateUtils';
import { DayDetailModal } from './DayDetailModal';

export function CalendarView({ 
  todos = [], 
  routines = [], 
  googleEvents = [],
  isGCalConnected = false,
  onOpenGCalModal,
  onToggleTodo, 
  onToggleRoutineForDate,
  onSkipRoutineForDate,
  onOpenNewTaskModal,
  onPushTaskToGCal,
  onShowToast
}) {
  const todayStr = getTodayString();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'todos' | 'routines' | 'gcal'
  
  // Selected date for day detail modal
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openDayModal = (dateStr) => {
    setSelectedDayDate(dateStr);
    setIsDayModalOpen(true);
  };

  // Header Title
  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const week = getWeekDays(currentDate);
      const start = week[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = week[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helpers to get items for a date
  const getItemsForDate = (dateStr) => {
    const dayTodos = (typeFilter === 'all' || typeFilter === 'todos')
      ? todos.filter(t => t.dueDate === dateStr)
      : [];

    const dayRoutines = (typeFilter === 'all' || typeFilter === 'routines')
      ? routines.filter(r => isRoutineActiveOnDate(r, dateStr))
      : [];

    const dayGCal = (typeFilter === 'all' || typeFilter === 'gcal')
      ? googleEvents.filter(g => g.dueDate === dateStr)
      : [];

    return { dayTodos, dayRoutines, dayGCal };
  };

  // Month Grid data
  const monthDays = getMonthGrid(year, month);
  // Week days data
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="calendar-wrapper">
      {/* Calendar Topbar */}
      <div className="calendar-topbar">
        <div className="cal-nav-group">
          <button
            type="button"
            className="pill-btn"
            style={{ fontWeight: 600 }}
            onClick={handleToday}
          >
            Today
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={handlePrev}
              aria-label="Previous range"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={handleNext}
              aria-label="Next range"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="cal-month-title num-tabular">
            {getHeaderTitle()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Google Calendar Sync Action Button */}
          <button
            type="button"
            className="pill-btn"
            style={{
              backgroundColor: isGCalConnected ? 'rgba(66, 133, 244, 0.12)' : 'var(--bg-surface)',
              borderColor: isGCalConnected ? '#4285F4' : 'var(--border-subtle)',
              color: isGCalConnected ? '#4285F4' : 'var(--text-secondary)',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.78rem'
            }}
            onClick={onOpenGCalModal}
            title="Google Calendar API Sync"
          >
            <CalendarIcon size={13} color="#4285F4" />
            <span>{isGCalConnected ? `Google Calendar (${googleEvents.length})` : 'Sync Google Calendar'}</span>
          </button>

          {/* Type Filter */}
          <div className="filter-pills" style={{ paddingBottom: 0 }}>
            <button
              type="button"
              className={`pill-btn ${typeFilter === 'all' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`pill-btn ${typeFilter === 'todos' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setTypeFilter('todos')}
            >
              Tasks
            </button>
            <button
              type="button"
              className={`pill-btn ${typeFilter === 'routines' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => setTypeFilter('routines')}
            >
              Habits
            </button>
            {googleEvents.length > 0 && (
              <button
                type="button"
                className={`pill-btn ${typeFilter === 'gcal' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#4285F4' }}
                onClick={() => setTypeFilter('gcal')}
              >
                GCal ({googleEvents.length})
              </button>
            )}
          </div>

          {/* View Mode Toggle: Month, Week, Day */}
          <div className="cal-view-modes">
            <button
              type="button"
              className={`cal-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={`cal-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`cal-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MONTH VIEW
          =================================================================== */}
      {viewMode === 'month' && (
        <div>
          {/* Weekday column headers */}
          <div className="month-header-grid">
            {DAYS_OF_WEEK.map(d => (
              <div key={d.id} className="month-col-head">
                {d.name}
              </div>
            ))}
          </div>

          {/* Month 6x7 Grid */}
          <div className="month-days-grid">
            {monthDays.map((cell, idx) => {
              const { dateStr, dayNumber, isCurrentMonth } = cell;
              const isCellToday = dateStr === todayStr;
              const { dayTodos, dayRoutines, dayGCal } = getItemsForDate(dateStr);
              const totalItems = dayTodos.length + dayRoutines.length + dayGCal.length;
              const maxDisplay = 3;

              return (
                <div
                  key={idx}
                  className={`cal-cell ${!isCurrentMonth ? 'other-month' : ''} ${isCellToday ? 'is-today' : ''}`}
                  onClick={() => openDayModal(dateStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter') openDayModal(dateStr);
                  }}
                >
                  <div className="cal-day-header">
                    <span className="cal-day-num">{dayNumber}</span>
                    {totalItems > 0 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                        {totalItems}
                      </span>
                    )}
                  </div>

                  <div className="cal-chips-stack">
                    {/* Google Calendar events */}
                    {dayGCal.slice(0, 1).map(g => (
                      <div
                        key={g.id}
                        className="cal-chip"
                        style={{
                          backgroundColor: 'rgba(66, 133, 244, 0.15)',
                          color: '#4285F4',
                          borderLeft: '2px solid #4285F4'
                        }}
                        title={`Google Calendar: ${g.title}`}
                      >
                        <CalendarIcon size={10} style={{ flexShrink: 0 }} />
                        <span>{g.title}</span>
                      </div>
                    ))}

                    {/* Todos */}
                    {dayTodos.slice(0, 2).map(todo => (
                      <div
                        key={todo.id}
                        className={`cal-chip cal-chip-todo ${todo.completed ? 'completed' : ''}`}
                        title={`Task: ${todo.title}`}
                      >
                        <Check size={10} style={{ flexShrink: 0 }} />
                        <span>{todo.title}</span>
                      </div>
                    ))}

                    {/* Daily Routines */}
                    {dayRoutines.slice(0, Math.max(0, maxDisplay - dayGCal.length - Math.min(dayTodos.length, 2))).map(routine => {
                      const isDone = !!routine.completedHistory?.[dateStr];
                      return (
                        <div
                          key={routine.id}
                          className={`cal-chip cal-chip-routine ${isDone ? 'completed' : ''}`}
                          title={`Habit: ${routine.title}`}
                        >
                          <Repeat size={10} style={{ flexShrink: 0 }} />
                          <span>{routine.title}</span>
                        </div>
                      );
                    })}

                    {totalItems > maxDisplay && (
                      <div className="cal-more-chip num-tabular">
                        +{totalItems - maxDisplay} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          WEEK VIEW
          =================================================================== */}
      {viewMode === 'week' && (
        <div className="week-view-grid">
          {weekDays.map(day => {
            const { dateStr, dayName, dayNumber, isToday: isDayToday } = day;
            const { dayTodos, dayRoutines, dayGCal } = getItemsForDate(dateStr);

            return (
              <div key={dateStr} className="week-day-column">
                <div 
                  className={`week-col-head ${isDayToday ? 'today' : ''}`}
                  onClick={() => openDayModal(dateStr)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDayToday ? 'var(--accent-text)' : 'var(--text-secondary)' }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {dayNumber}
                  </div>
                </div>

                <div className="week-col-tasks">
                  {dayTodos.length === 0 && dayRoutines.length === 0 && dayGCal.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                      No items
                    </div>
                  ) : (
                    <>
                      {/* Google Calendar events in Week column */}
                      {dayGCal.map(g => (
                        <div
                          key={g.id}
                          style={{
                            padding: '8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(66, 133, 244, 0.08)',
                            border: '1px solid rgba(66, 133, 244, 0.25)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, color: '#4285F4', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                              Google Cal
                            </span>
                            {g.dueTime && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                {g.dueTime}
                              </span>
                            )}
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {g.title}
                          </div>
                          {g.hangoutLink && (
                            <a
                              href={g.hangoutLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#4285F4',
                                textDecoration: 'none',
                                marginTop: '2px'
                              }}
                            >
                              <Video size={11} />
                              <span>Join Meet</span>
                            </a>
                          )}
                        </div>
                      ))}

                      {/* Todos */}
                      {dayTodos.map(todo => (
                        <div
                          key={todo.id}
                          style={{
                            padding: '8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px'
                          }}
                        >
                          <button
                            type="button"
                            className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
                            style={{ width: '16px', height: '16px', marginTop: '1px' }}
                            onClick={() => onToggleTodo(todo.id)}
                          >
                            {todo.completed && <Check size={10} strokeWidth={3} />}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontWeight: 600, 
                              textDecoration: todo.completed ? 'line-through' : 'none',
                              opacity: todo.completed ? 0.6 : 1,
                              wordBreak: 'break-word'
                            }}>
                              {todo.title}
                            </div>
                            {todo.dueTime && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                {todo.dueTime}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Daily Routines */}
                      {dayRoutines.map(routine => {
                        const isDone = !!routine.completedHistory?.[dateStr];
                        return (
                          <div
                            key={routine.id}
                            style={{
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px'
                            }}
                          >
                            <button
                              type="button"
                              className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                              style={{ 
                                width: '16px', 
                                height: '16px', 
                                marginTop: '1px',
                                backgroundColor: isDone ? 'var(--success)' : 'transparent',
                                borderColor: isDone ? 'var(--success)' : 'var(--border-medium)',
                                color: '#fff'
                              }}
                              onClick={() => onToggleRoutineForDate(routine.id, dateStr)}
                            >
                              {isDone && <Check size={10} strokeWidth={3} />}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontWeight: 600, 
                                textDecoration: isDone ? 'line-through' : 'none',
                                opacity: isDone ? 0.6 : 1,
                                wordBreak: 'break-word',
                                color: '#10b981'
                              }}>
                                {routine.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                {routine.timeOfDay || 'Habit'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <button
                    type="button"
                    className="pill-btn"
                    style={{ fontSize: '0.72rem', width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                    onClick={() => openDayModal(dateStr)}
                  >
                    + View / Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================
          DAY VIEW / AGENDA
          =================================================================== */}
      {viewMode === 'day' && (
        <div className="day-view-container">
          <div className="day-view-header">
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatFriendlyDate(toDateString(currentDate), 'full')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Detailed schedule of tasks, routines, and Google Calendar events.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => onOpenNewTaskModal('todo', toDateString(currentDate))}
            >
              <Plus size={16} />
              <span>Add to This Day</span>
            </button>
          </div>

          {(() => {
            const activeDateStr = toDateString(currentDate);
            const { dayTodos, dayRoutines, dayGCal } = getItemsForDate(activeDateStr);

            if (dayTodos.length === 0 && dayRoutines.length === 0 && dayGCal.length === 0) {
              return (
                <div className="empty-state">
                  <div className="empty-icon">
                    <CalendarIcon size={24} />
                  </div>
                  <div className="empty-title">Clear schedule for this day</div>
                  <div className="empty-desc">
                    Enjoy your free time or schedule a task to stay ahead of your goals.
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onOpenNewTaskModal('todo', activeDateStr)}
                  >
                    <Plus size={16} />
                    <span>Schedule Task</span>
                  </button>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Google Calendar events */}
                {dayGCal.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#4285F4', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={15} />
                      <span>Google Calendar Events ({dayGCal.length})</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dayGCal.map(g => (
                        <div
                          key={g.id}
                          className="todo-card"
                          style={{
                            borderColor: 'rgba(66, 133, 244, 0.3)',
                            backgroundColor: 'rgba(66, 133, 244, 0.05)',
                            padding: '12px 14px'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div className="todo-title" style={{ color: 'var(--text-primary)' }}>{g.title}</div>
                            {g.description && <div className="todo-desc">{g.description}</div>}
                            <div className="todo-meta">
                              {g.dueTime && (
                                <span className="meta-chip num-tabular">
                                  <Clock size={12} />
                                  <span>{g.dueTime}</span>
                                </span>
                              )}
                              {g.location && (
                                <span className="meta-chip">
                                  <MapPin size={12} />
                                  <span>{g.location}</span>
                                </span>
                              )}
                              {g.hangoutLink && (
                                <a
                                  href={g.hangoutLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="meta-chip"
                                  style={{ color: '#4285F4' }}
                                >
                                  <Video size={12} />
                                  <span>Join Google Meet</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {g.htmlLink && (
                            <a
                              href={g.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-icon"
                              title="Open in Google Calendar"
                              style={{ width: '30px', height: '30px', color: '#4285F4' }}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* One-time tasks */}
                {dayTodos.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      One-Time Scheduled Tasks ({dayTodos.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dayTodos.map(todo => (
                        <div
                          key={todo.id}
                          className="todo-card"
                          style={{ padding: '12px 14px' }}
                        >
                          <button
                            type="button"
                            className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
                            onClick={() => onToggleTodo(todo.id)}
                          >
                            {todo.completed && <Check size={14} strokeWidth={3} />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div className="todo-title">{todo.title}</div>
                            {todo.description && <div className="todo-desc">{todo.description}</div>}
                            <div className="todo-meta">
                              {todo.dueTime && (
                                <span className="meta-chip num-tabular">
                                  <Clock size={12} />
                                  <span>{todo.dueTime}</span>
                                </span>
                              )}
                              <span className={`meta-chip priority-chip-${todo.priority}`}>
                                {todo.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily routines */}
                {dayRoutines.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      Active Daily Habits ({dayRoutines.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dayRoutines.map(routine => {
                        const isDone = !!routine.completedHistory?.[activeDateStr];
                        return (
                          <div
                            key={routine.id}
                            className="routine-card"
                            style={{ padding: '12px 14px', margin: 0 }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                  type="button"
                                  className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                                  style={{
                                    backgroundColor: isDone ? 'var(--success)' : 'transparent',
                                    borderColor: isDone ? 'var(--success)' : 'var(--border-medium)',
                                    color: '#ffffff'
                                  }}
                                  onClick={() => onToggleRoutineForDate(routine.id, activeDateStr)}
                                >
                                  {isDone && <Check size={14} strokeWidth={3} />}
                                </button>
                                <div>
                                  <div style={{ 
                                    fontWeight: 600, 
                                    textDecoration: isDone ? 'line-through' : 'none',
                                    opacity: isDone ? 0.6 : 1
                                  }}>
                                    {routine.title}
                                  </div>
                                  {routine.timeOfDay && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                      {routine.timeOfDay}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="pill-btn"
                                style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                                onClick={() => onSkipRoutineForDate(routine.id, activeDateStr)}
                              >
                                Skip This Day
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal for Day Details */}
      <DayDetailModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        dateStr={selectedDayDate}
        todos={todos}
        routines={routines}
        googleEvents={googleEvents}
        onToggleTodo={onToggleTodo}
        onToggleRoutineForDate={onToggleRoutineForDate}
        onSkipRoutineForDate={onSkipRoutineForDate}
        onOpenNewTaskModal={onOpenNewTaskModal}
        onPushTaskToGCal={onPushTaskToGCal}
      />
    </div>
  );
}
