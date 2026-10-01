import React from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Repeat, 
  BarChart3, 
  Clock, 
  Flame,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { CATEGORIES, calculateRoutineStreak, getTodayString } from '../utils/dateUtils';

export function Sidebar({ 
  currentView, 
  setCurrentView, 
  activeCategory, 
  setActiveCategory,
  todos = [],
  routines = []
}) {
  const todayStr = getTodayString();
  const pendingTodos = todos.filter(t => !t.completed);
  const todayTodos = todos.filter(t => t.dueDate === todayStr && !t.completed);

  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      <div className="sidebar-section">
        <div className="sidebar-title">Views</div>
        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'todos' ? 'active' : ''}`}
          onClick={() => setCurrentView('todos')}
        >
          <div className="nav-item-left">
            <CheckSquare size={16} />
            <span>Tasks</span>
          </div>
          <span className="count-pill">{pendingTodos.length}</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'routines' ? 'active' : ''}`}
          onClick={() => setCurrentView('routines')}
        >
          <div className="nav-item-left">
            <Repeat size={16} />
            <span>Daily Habits</span>
          </div>
          <span className="count-pill">{routines.length}</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentView('calendar')}
        >
          <div className="nav-item-left">
            <CalendarIcon size={16} />
            <span>Calendar</span>
          </div>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentView('analytics')}
        >
          <div className="nav-item-left">
            <BarChart3 size={16} />
            <span>Insights & Streaks</span>
          </div>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Categories</div>
        <button
          type="button"
          className={`sidebar-nav-item ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <div className="nav-item-left">
            <ListTodo size={15} />
            <span>All Categories</span>
          </div>
        </button>

        {CATEGORIES.map(cat => {
          const count = todos.filter(t => t.category === cat.id && !t.completed).length;
          return (
            <button
              key={cat.id}
              type="button"
              className={`sidebar-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="nav-item-left">
                <span 
                  className="filter-category-dot" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span>{cat.name}</span>
              </div>
              {count > 0 && <span className="count-pill">{count}</span>}
            </button>
          );
        })}
      </div>

      {routines.length > 0 && (
        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <div className="sidebar-title">Active Streaks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {routines.slice(0, 3).map(routine => {
              const streak = calculateRoutineStreak(routine);
              return (
                <div 
                  key={routine.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-chip)',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    maxWidth: '140px',
                    color: 'var(--text-secondary)'
                  }}>
                    {routine.title}
                  </span>
                  <span className="streak-badge">
                    <Flame size={12} className={streak > 0 ? 'flame-active' : ''} />
                    {streak}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
