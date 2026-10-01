import React from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Repeat, 
  BarChart3, 
  Plus, 
  Sun, 
  Moon 
} from 'lucide-react';
import { formatFriendlyDate, getTodayString } from '../utils/dateUtils';

export function Header({ 
  currentView, 
  setCurrentView, 
  theme, 
  toggleTheme, 
  openNewTaskModal 
}) {
  const todayStr = getTodayString();
  const friendlyToday = formatFriendlyDate(todayStr, 'full');

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-badge">
          <div className="brand-icon">
            <CheckSquare size={18} strokeWidth={2.5} />
          </div>
          <span className="brand-title">CodeAJ</span>
        </div>
        <div className="brand-date num-tabular">
          {friendlyToday}
        </div>
      </div>

      <nav className="header-center" aria-label="Main Navigation">
        <button
          type="button"
          className={`view-tab-btn ${currentView === 'todos' ? 'active' : ''}`}
          onClick={() => setCurrentView('todos')}
        >
          <CheckSquare size={15} />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          className={`view-tab-btn ${currentView === 'routines' ? 'active' : ''}`}
          onClick={() => setCurrentView('routines')}
        >
          <Repeat size={15} />
          <span>Daily Habits</span>
        </button>

        <button
          type="button"
          className={`view-tab-btn ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentView('calendar')}
        >
          <CalendarIcon size={15} />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          className={`view-tab-btn ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentView('analytics')}
        >
          <BarChart3 size={15} />
          <span>Insights</span>
        </button>
      </nav>

      <div className="header-right">
        <button
          type="button"
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={() => openNewTaskModal()}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Item</span>
        </button>
      </div>
    </header>
  );
}
