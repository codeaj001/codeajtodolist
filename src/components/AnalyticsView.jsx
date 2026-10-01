import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Flame, 
  Repeat, 
  Clock, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  CATEGORIES, 
  calculateRoutineStreak, 
  calculateRoutineStats,
  getTodayString 
} from '../utils/dateUtils';
import { getInitialTodos, getInitialRoutines } from '../utils/storage';

export function AnalyticsView({ 
  todos, 
  routines, 
  onResetData, 
  onImportData, 
  onShowToast 
}) {
  const completedTodos = todos.filter(t => t.completed);
  const pendingTodos = todos.filter(t => !t.completed);

  // Overall routine stats
  let totalActiveSlots = 0;
  let totalCompletedSlots = 0;
  let highestStreak = 0;
  let bestHabitName = 'None';

  routines.forEach(r => {
    const streak = calculateRoutineStreak(r);
    if (streak > highestStreak) {
      highestStreak = streak;
      bestHabitName = r.title;
    }
    const stat = calculateRoutineStats(r, 14);
    totalActiveSlots += stat.totalActive;
    totalCompletedSlots += stat.completed;
  });

  const habitAdherence = totalActiveSlots > 0 
    ? Math.round((totalCompletedSlots / totalActiveSlots) * 100) 
    : 0;

  // Category breakdown
  const categoryCounts = CATEGORIES.map(cat => {
    const catTodos = todos.filter(t => t.category === cat.id);
    const catRoutines = routines.filter(r => r.category === cat.id);
    return {
      ...cat,
      total: catTodos.length + catRoutines.length,
      completed: catTodos.filter(t => t.completed).length,
    };
  });

  // Export JSON
  const handleExport = () => {
    const data = {
      todos,
      routines,
      exportedAt: new Date().toISOString(),
      app: 'CodeAJ Todo & Calendar'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeaj_backup_${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('Exported tasks backup JSON successfully');
  };

  // Import JSON
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.todos && parsed.routines) {
          onImportData(parsed.todos, parsed.routines);
          if (onShowToast) onShowToast('Data imported successfully!');
        } else {
          alert('Invalid backup format.');
        }
      } catch (err) {
        alert('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Insights & Habit Consistency
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Comprehensive tracking of your daily adherence, ongoing streaks, and execution momentum.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="pill-btn"
            onClick={handleExport}
            title="Download JSON backup"
          >
            <Download size={14} style={{ marginRight: '6px' }} />
            Export Data
          </button>

          <label className="pill-btn" style={{ cursor: 'pointer' }}>
            <Upload size={14} style={{ marginRight: '6px' }} />
            Import
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{completedTodos.length}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Flame size={22} className={highestStreak > 0 ? 'flame-active' : ''} />
          </div>
          <div>
            <div className="stat-value">{highestStreak} days</div>
            <div className="stat-label">Longest Active Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
            <Repeat size={22} />
          </div>
          <div>
            <div className="stat-value">{habitAdherence}%</div>
            <div className="stat-label">14-Day Habit Adherence</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{pendingTodos.length}</div>
            <div className="stat-label">Open Pending Tasks</div>
          </div>
        </div>
      </div>

      {/* Habits Streaks Performance Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Habit Consistency Breakdown
        </h3>

        {routines.length === 0 ? (
          <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            No routines tracked yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {routines.map(routine => {
              const streak = calculateRoutineStreak(routine);
              const stats = calculateRoutineStats(routine, 14);

              return (
                <div 
                  key={routine.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{routine.title}</span>
                      <span className="streak-badge">
                        <Flame size={12} className={streak > 0 ? 'flame-active' : ''} />
                        {streak}d streak
                      </span>
                    </div>

                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {stats.completed}/{stats.totalActive} days ({stats.percentage}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${stats.percentage}%`,
                      height: '100%',
                      backgroundColor: stats.percentage > 70 ? 'var(--success)' : stats.percentage > 40 ? 'var(--warning)' : 'var(--accent-primary)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Distribution */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Activity by Category
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {categoryCounts.map(cat => (
            <div
              key={cat.id}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="filter-category-dot" style={{ backgroundColor: cat.color }} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat.name}</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cat.total} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>items</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Data Option */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        marginTop: '20px'
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Sample Data Reset</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Want to explore with fresh sample todos and auto-loop habits?
          </div>
        </div>

        <button
          type="button"
          className="pill-btn"
          onClick={() => {
            if (window.confirm('Reset all tasks and habits to demo defaults?')) {
              onResetData();
              if (onShowToast) onShowToast('Reset to demo sample data');
            }
          }}
        >
          <RotateCcw size={14} style={{ marginRight: '6px' }} />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
