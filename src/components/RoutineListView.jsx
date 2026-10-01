import React from 'react';
import { 
  Repeat, 
  Flame, 
  Check, 
  Trash2, 
  Edit3, 
  Plus, 
  Clock, 
  CalendarOff,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  DAYS_OF_WEEK, 
  CATEGORIES, 
  getTodayString, 
  isRoutineActiveOnDate, 
  calculateRoutineStreak,
  calculateRoutineStats
} from '../utils/dateUtils';

export function RoutineListView({ 
  routines, 
  onToggleRoutineToday, 
  onSkipRoutineToday,
  onDeleteRoutine, 
  onEditRoutine, 
  onOpenNewModal,
  onShowToast
}) {
  const todayStr = getTodayString();
  const d = new Date();
  const todayDayOfWeek = d.getDay();

  const handleToggle = (routine) => {
    const isCompleted = routine.completedHistory?.[todayStr];
    onToggleRoutineToday(routine.id);

    if (!isCompleted) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6366f1', '#f59e0b']
      });
      if (onShowToast) onShowToast(`Completed habit "${routine.title}" for today!`);
    }
  };

  const handleSkip = (routine) => {
    onSkipRoutineToday(routine.id);
    if (onShowToast) onShowToast(`Skipped "${routine.title}" for today`);
  };

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Daily Habits & Auto-Loop Routines
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Tasks configured to recur every day automatically, except on your designated rest or exception days.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => onOpenNewModal('routine')}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Daily Habit</span>
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Repeat size={24} />
          </div>
          <div className="empty-title">No daily routines configured</div>
          <div className="empty-desc">
            Build consistency with recurring daily habits. Specify which days of the week to loop and which to skip.
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenNewModal('routine')}
          >
            <Plus size={16} />
            <span>Create First Routine</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {routines.map(routine => {
            const streak = calculateRoutineStreak(routine);
            const stats = calculateRoutineStats(routine, 14);
            const cat = CATEGORIES.find(c => c.id === routine.category) || CATEGORIES[0];
            const isScheduledToday = isRoutineActiveOnDate(routine, todayStr);
            const isCompletedToday = !!routine.completedHistory?.[todayStr];
            const isExcludedToday = routine.excludedDays?.includes(todayDayOfWeek);
            const isSkippedToday = routine.customExceptionDates?.includes(todayStr);

            return (
              <div key={routine.id} className="routine-card">
                <div className="routine-header">
                  <div>
                    <div className="routine-title-row">
                      <span className="routine-title">{routine.title}</span>
                      <span className="streak-badge">
                        <Flame size={13} className={streak > 0 ? 'flame-active' : ''} />
                        <span>{streak} day streak</span>
                      </span>
                    </div>

                    {routine.description && (
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {routine.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEditRoutine(routine)}
                      title="Edit routine schedule"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onDeleteRoutine(routine.id)}
                      title="Delete routine"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Day of Week Auto-Loop Status */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Auto-Loop Schedule
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {stats.percentage}% adherence (last 14d)
                    </span>
                  </div>

                  <div className="routine-schedule-row">
                    {DAYS_OF_WEEK.map(day => {
                      const isExcluded = routine.excludedDays?.includes(day.id);
                      const isTodayDay = day.id === todayDayOfWeek;
                      return (
                        <div
                          key={day.id}
                          className={`day-circle ${isExcluded ? 'excluded' : 'active'}`}
                          title={`${day.full}: ${isExcluded ? 'Excluded from loop' : 'Loops every ' + day.name}`}
                          style={{
                            boxShadow: isTodayDay ? '0 0 0 2px var(--accent-primary)' : 'none'
                          }}
                        >
                          {day.short}
                        </div>
                      );
                    })}

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                      {routine.excludedDays?.length === 0 
                        ? 'Every day (7/7)' 
                        : (routine.excludedDays?.length === 2 && routine.excludedDays?.includes(0) && routine.excludedDays?.includes(6))
                          ? 'Mon–Fri (Weekends off)'
                          : `${7 - (routine.excludedDays?.length || 0)} days/week`}
                    </span>
                  </div>
                </div>

                {/* Footer with Today's Action */}
                <div className="routine-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {routine.timeOfDay && (
                      <span className="meta-chip num-tabular">
                        <Clock size={12} />
                        <span>{routine.timeOfDay}</span>
                      </span>
                    )}

                    <span className="meta-chip" style={{ color: cat.color }}>
                      <span className="filter-category-dot" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </span>
                  </div>

                  <div>
                    {isExcludedToday ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        Rest day (auto-skipped today)
                      </span>
                    ) : isSkippedToday ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
                          Skipped for today
                        </span>
                        <button
                          type="button"
                          className="pill-btn"
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          onClick={() => handleSkip(routine)}
                        >
                          Undo Skip
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className={`pill-btn ${isCompletedToday ? 'active' : ''}`}
                          style={{
                            backgroundColor: isCompletedToday ? 'var(--success-subtle)' : 'var(--bg-surface)',
                            borderColor: isCompletedToday ? 'var(--success)' : 'var(--border-subtle)',
                            color: isCompletedToday ? 'var(--success)' : 'var(--text-primary)',
                            gap: '6px',
                            fontWeight: 600,
                            padding: '6px 14px'
                          }}
                          onClick={() => handleToggle(routine)}
                        >
                          <Check size={14} strokeWidth={isCompletedToday ? 3 : 2} />
                          <span>{isCompletedToday ? 'Done Today' : 'Mark Done'}</span>
                        </button>

                        {!isCompletedToday && (
                          <button
                            type="button"
                            className="pill-btn"
                            title="Skip this habit today without breaking streak pattern"
                            style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}
                            onClick={() => handleSkip(routine)}
                          >
                            Skip Today
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
