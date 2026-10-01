import React from 'react';
import { 
  CheckSquare, 
  Repeat, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Plus 
} from 'lucide-react';

export function MobileNav({ currentView, setCurrentView, openNewTaskModal }) {
  return (
    <>
      <button
        type="button"
        className="mobile-fab"
        onClick={() => openNewTaskModal()}
        aria-label="Add new item"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-nav-item ${currentView === 'todos' ? 'active' : ''}`}
          onClick={() => setCurrentView('todos')}
        >
          <CheckSquare size={19} />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${currentView === 'routines' ? 'active' : ''}`}
          onClick={() => setCurrentView('routines')}
        >
          <Repeat size={19} />
          <span>Habits</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentView('calendar')}
        >
          <CalendarIcon size={19} />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-item ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentView('analytics')}
        >
          <BarChart3 size={19} />
          <span>Insights</span>
        </button>
      </nav>
    </>
  );
}
