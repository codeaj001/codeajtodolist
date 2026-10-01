import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { TodoListView } from './components/TodoListView';
import { RoutineListView } from './components/RoutineListView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { Toast } from './components/Toast';
import { 
  loadTodos, 
  saveTodos, 
  loadRoutines, 
  saveRoutines, 
  loadSettings, 
  saveSettings,
  getInitialTodos,
  getInitialRoutines
} from './utils/storage';
import { getTodayString } from './utils/dateUtils';
import { 
  getCachedGoogleEvents, 
  getActiveAccessToken, 
  createGoogleCalendarEvent 
} from './utils/googleCalendarService';

export function App() {
  const [todos, setTodos] = useState(() => loadTodos());
  const [routines, setRoutines] = useState(() => loadRoutines());
  const [settings, setSettings] = useState(() => loadSettings());
  const [googleEvents, setGoogleEvents] = useState(() => getCachedGoogleEvents());
  
  const [currentView, setCurrentView] = useState('todos'); // 'todos' | 'routines' | 'calendar' | 'analytics'
  const [activeCategory, setActiveCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal States
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    initialData: null,
    defaultType: 'todo',
    defaultDate: null
  });
  const [isGCalModalOpen, setIsGCalModalOpen] = useState(false);

  // Apply theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  }, [settings.theme]);

  // Sync to storage
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Toast auto-clear
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings(prev => ({ ...prev, theme: nextTheme }));
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid triggering when user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openNewTaskModal('todo');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Handlers: Todos ---
  const handleToggleTodo = (id) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
          // If completing todo, auto-complete its subtasks
          subtasks: nextCompleted 
            ? (t.subtasks || []).map(s => ({ ...s, completed: true }))
            : t.subtasks
        };
      }
      return t;
    }));
  };

  const handleToggleSubtask = (todoId, subtaskId) => {
    setTodos(prev => prev.map(t => {
      if (t.id === todoId) {
        const updatedSubs = (t.subtasks || []).map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        // Check if all subtasks are now completed
        const allDone = updatedSubs.length > 0 && updatedSubs.every(s => s.completed);
        return {
          ...t,
          subtasks: updatedSubs,
          completed: allDone ? true : t.completed,
          completedAt: allDone ? new Date().toISOString() : t.completedAt
        };
      }
      return t;
    }));
  };

  const handleDeleteTodo = (id) => {
    const target = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(t => t.id !== id));
    showToast(`Deleted task "${target?.title || 'item'}"`);
  };

  const handleSaveTodo = (todoData) => {
    setTodos(prev => {
      const exists = prev.some(t => t.id === todoData.id);
      if (exists) {
        showToast(`Updated "${todoData.title}"`);
        return prev.map(t => t.id === todoData.id ? todoData : t);
      }
      showToast(`Created task "${todoData.title}"`);
      return [todoData, ...prev];
    });
  };

  // --- Handlers: Routines (Daily Habits with Auto-Loop) ---
  const handleToggleRoutineToday = (id) => {
    const todayStr = getTodayString();
    handleToggleRoutineForDate(id, todayStr);
  };

  const handleToggleRoutineForDate = (id, dateStr) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const history = { ...(r.completedHistory || {}) };
        const currentlyDone = !!history[dateStr];
        if (currentlyDone) {
          delete history[dateStr];
        } else {
          history[dateStr] = true;
        }
        return {
          ...r,
          completedHistory: history
        };
      }
      return r;
    }));
  };

  const handleSkipRoutineToday = (id) => {
    const todayStr = getTodayString();
    handleSkipRoutineForDate(id, todayStr);
  };

  const handleSkipRoutineForDate = (id, dateStr) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const exceptions = [...(r.customExceptionDates || [])];
        const isSkipped = exceptions.includes(dateStr);
        let nextExceptions;
        if (isSkipped) {
          nextExceptions = exceptions.filter(d => d !== dateStr);
        } else {
          nextExceptions = [...exceptions, dateStr].sort();
        }
        return {
          ...r,
          customExceptionDates: nextExceptions
        };
      }
      return r;
    }));
  };

  const handleDeleteRoutine = (id) => {
    const target = routines.find(r => r.id === id);
    setRoutines(prev => prev.filter(r => r.id !== id));
    showToast(`Deleted routine "${target?.title || 'item'}"`);
  };

  const handleSaveRoutine = (routineData) => {
    setRoutines(prev => {
      const exists = prev.some(r => r.id === routineData.id);
      if (exists) {
        showToast(`Updated routine schedule "${routineData.title}"`);
        return prev.map(r => r.id === routineData.id ? routineData : r);
      }
      showToast(`Created daily habit "${routineData.title}"`);
      return [...prev, routineData];
    });
  };

  // --- Handlers: Google Calendar API ---
  const handlePushTaskToGCal = async (task) => {
    const token = getActiveAccessToken();
    if (!token && googleEvents.length === 0) {
      setIsGCalModalOpen(true);
      showToast('Connect Google Calendar to export tasks.');
      return;
    }

    try {
      if (token) {
        const created = await createGoogleCalendarEvent({ accessToken: token, task });
        setGoogleEvents(prev => [created, ...prev]);
        showToast(`Synced "${task.title}" to Google Calendar!`);
      } else {
        // Preview mode simulation
        const mockGCal = {
          id: `gcal-synced-${Date.now()}`,
          gcalId: `synced-${Date.now()}`,
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate || getTodayString(),
          dueTime: task.dueTime || null,
          isGoogleEvent: true,
          htmlLink: 'https://calendar.google.com',
          location: 'Google Calendar',
          category: 'google',
          completed: false,
          color: '#4285F4',
          source: 'google-calendar'
        };
        setGoogleEvents(prev => [mockGCal, ...prev]);
        showToast(`Synced "${task.title}" to Google Calendar!`);
      }
    } catch (err) {
      showToast(`Sync failed: ${err.message}`);
    }
  };

  // --- Modal Openers ---
  const openNewTaskModal = (defaultType = 'todo', defaultDate = null) => {
    setModalConfig({
      isOpen: true,
      initialData: null,
      defaultType,
      defaultDate
    });
  };

  const openEditModal = (item, type = 'todo') => {
    setModalConfig({
      isOpen: true,
      initialData: item,
      defaultType: type,
      defaultDate: null
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false, initialData: null }));
  };

  // Reset / Import
  const handleResetData = () => {
    const initialTodos = getInitialTodos();
    const initialRoutines = getInitialRoutines();
    setTodos(initialTodos);
    setRoutines(initialRoutines);
  };

  const handleImportData = (newTodos, newRoutines) => {
    setTodos(newTodos);
    setRoutines(newRoutines);
  };

  const isGCalConnected = !!getActiveAccessToken() || googleEvents.length > 0;

  return (
    <div className="app-container">
      {/* Sidebar for Desktop */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        todos={todos}
        routines={routines}
      />

      <div className="main-content">
        {/* Top Header */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          theme={settings.theme}
          toggleTheme={toggleTheme}
          openNewTaskModal={openNewTaskModal}
        />

        {/* Viewport Content */}
        <main className="content-viewport">
          {currentView === 'todos' && (
            <TodoListView
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onToggleSubtask={handleToggleSubtask}
              onDeleteTodo={handleDeleteTodo}
              onEditTodo={todo => openEditModal(todo, 'todo')}
              onOpenNewModal={openNewTaskModal}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onShowToast={showToast}
            />
          )}

          {currentView === 'routines' && (
            <RoutineListView
              routines={routines}
              onToggleRoutineToday={handleToggleRoutineToday}
              onSkipRoutineToday={handleSkipRoutineToday}
              onDeleteRoutine={handleDeleteRoutine}
              onEditRoutine={routine => openEditModal(routine, 'routine')}
              onOpenNewModal={openNewTaskModal}
              onShowToast={showToast}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              todos={todos}
              routines={routines}
              googleEvents={googleEvents}
              isGCalConnected={isGCalConnected}
              onOpenGCalModal={() => setIsGCalModalOpen(true)}
              onToggleTodo={handleToggleTodo}
              onToggleRoutineForDate={handleToggleRoutineForDate}
              onSkipRoutineForDate={handleSkipRoutineForDate}
              onOpenNewTaskModal={openNewTaskModal}
              onPushTaskToGCal={handlePushTaskToGCal}
              onShowToast={showToast}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              todos={todos}
              routines={routines}
              onResetData={handleResetData}
              onImportData={handleImportData}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Mobile Navigation bar and floating button */}
        <MobileNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          openNewTaskModal={openNewTaskModal}
        />
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onSaveTodo={handleSaveTodo}
        onSaveRoutine={handleSaveRoutine}
        initialData={modalConfig.initialData}
        defaultType={modalConfig.defaultType}
        defaultDate={modalConfig.defaultDate}
      />

      {/* Google Calendar API Modal */}
      <GoogleCalendarModal
        isOpen={isGCalModalOpen}
        onClose={() => setIsGCalModalOpen(false)}
        onEventsUpdated={(events) => setGoogleEvents(events)}
        todos={todos}
        onShowToast={showToast}
      />

      {/* Ephemeral Feedback Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
