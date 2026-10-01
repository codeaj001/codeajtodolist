// CodeAJ Todo & Calendar - Persistence & Mock Data

import { getTodayString, toDateString } from './dateUtils';

const TODOS_KEY = 'codeaj_todos_v1';
const ROUTINES_KEY = 'codeaj_routines_v1';
const SETTINGS_KEY = 'codeaj_settings_v1';

export function getInitialTodos() {
  const today = getTodayString();
  const d = new Date();

  const tomorrow = new Date(d);
  tomorrow.setDate(d.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  const dayAfterTomorrow = new Date(d);
  dayAfterTomorrow.setDate(d.getDate() + 2);
  const dayAfterTomorrowStr = toDateString(dayAfterTomorrow);

  return [
    {
      id: 'todo-1',
      title: 'Review pull request & finalize API schema',
      description: 'Ensure all GraphQL queries are strictly typed and error states handled.',
      dueDate: today,
      dueTime: '14:00',
      priority: 'high',
      category: 'work',
      completed: false,
      completedAt: null,
      subtasks: [
        { id: 'sub-1', title: 'Check pagination logic', completed: true },
        { id: 'sub-2', title: 'Verify rate limiting response headers', completed: false },
        { id: 'sub-3', title: 'Write unit test assertions', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'todo-2',
      title: 'Submit quarterly budget proposal',
      description: 'Review software tool subscriptions and team cloud infrastructure costs.',
      dueDate: today,
      dueTime: '17:30',
      priority: 'medium',
      category: 'work',
      completed: true,
      completedAt: new Date().toISOString(),
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'todo-3',
      title: 'Grocery restock: Organic veggies & oats',
      description: 'Pick up spinach, avocados, almond milk, and ground coffee.',
      dueDate: tomorrowStr,
      dueTime: '18:00',
      priority: 'low',
      category: 'personal',
      completed: false,
      completedAt: null,
      subtasks: [
        { id: 'sub-4', title: 'Check pantry first', completed: true },
        { id: 'sub-5', title: 'Bring reusable bags', completed: false },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'todo-4',
      title: 'Complete System Architecture Chapter 4',
      description: 'Take notes on distributed consensus algorithms (Raft & Paxos).',
      dueDate: dayAfterTomorrowStr,
      dueTime: '20:00',
      priority: 'medium',
      category: 'study',
      completed: false,
      completedAt: null,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getInitialRoutines() {
  const today = getTodayString();
  const d = new Date();

  // Create some completed dates for streaks
  const past1 = new Date(d);
  past1.setDate(d.getDate() - 1);
  const past1Str = toDateString(past1);

  const past2 = new Date(d);
  past2.setDate(d.getDate() - 2);
  const past2Str = toDateString(past2);

  const past3 = new Date(d);
  past3.setDate(d.getDate() - 3);
  const past3Str = toDateString(past3);

  const twoWeeksAgo = new Date(d);
  twoWeeksAgo.setDate(d.getDate() - 14);
  const startStr = toDateString(twoWeeksAgo);

  return [
    {
      id: 'routine-1',
      title: 'Morning Focus: 45 min Deep Work',
      description: 'Zero notifications, phone in another room, high-leverage engineering.',
      category: 'work',
      color: '#6366f1',
      timeOfDay: '08:30',
      frequency: 'daily',
      excludedDays: [0, 6], // Excludes Sunday (0) and Saturday (6)
      customExceptionDates: [], // specific skipped dates
      startDate: startStr,
      completedHistory: {
        [past3Str]: true,
        [past2Str]: true,
        [past1Str]: true,
        [today]: true,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'routine-2',
      title: 'Daily 30-min Physical Workout & Stretching',
      description: 'HIIT, run, or bodyweight circuit plus mobility work.',
      category: 'health',
      color: '#10b981',
      timeOfDay: '07:00',
      frequency: 'daily',
      excludedDays: [], // Every single day
      customExceptionDates: [],
      startDate: startStr,
      completedHistory: {
        [past2Str]: true,
        [past1Str]: true,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'routine-3',
      title: 'Read 20 pages of non-fiction or tech paper',
      description: 'Keep cultivating deep technical and philosophical knowledge.',
      category: 'study',
      color: '#f59e0b',
      timeOfDay: '21:30',
      frequency: 'daily',
      excludedDays: [0], // Exclude Sunday for restorative rest
      customExceptionDates: [],
      startDate: startStr,
      completedHistory: {
        [past3Str]: true,
        [past2Str]: true,
        [past1Str]: true,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'routine-4',
      title: 'Hydrate 2.5 Liters of Water',
      description: 'Track daily hydration bottle refills throughout the day.',
      category: 'health',
      color: '#06b6d4',
      timeOfDay: 'All Day',
      frequency: 'daily',
      excludedDays: [],
      customExceptionDates: [],
      startDate: startStr,
      completedHistory: {
        [past1Str]: true,
        [today]: false,
      },
      createdAt: new Date().toISOString(),
    },
  ];
}

export function loadTodos() {
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    if (!raw) {
      const initial = getInitialTodos();
      localStorage.setItem(TODOS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load todos from localStorage', e);
    return getInitialTodos();
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('Failed to save todos to localStorage', e);
  }
}

export function loadRoutines() {
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    if (!raw) {
      const initial = getInitialRoutines();
      localStorage.setItem(ROUTINES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load routines from localStorage', e);
    return getInitialRoutines();
  }
}

export function saveRoutines(routines) {
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines to localStorage', e);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        theme: 'dark', // obsidian dark by default, crisp and modern
        soundEffect: true,
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return { theme: 'dark', soundEffect: true };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}
