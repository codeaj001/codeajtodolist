import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Key, 
  Sparkles,
  UploadCloud,
  LogOut
} from 'lucide-react';
import { 
  getStoredClientId, 
  saveStoredClientId, 
  getActiveAccessToken, 
  clearGoogleSession,
  requestGoogleAccessToken,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  getDemoGoogleEvents
} from '../utils/googleCalendarService';

export function GoogleCalendarModal({ 
  isOpen, 
  onClose, 
  onEventsUpdated, 
  todos = [],
  onShowToast 
}) {
  const [clientId, setClientId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingTasks, setSyncingTasks] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClientId(getStoredClientId());
      const token = getActiveAccessToken();
      setIsConnected(!!token);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveClientId = () => {
    saveStoredClientId(clientId);
    onShowToast?.('Client ID saved');
  };

  const handleConnect = () => {
    setError('');
    if (!clientId.trim()) {
      setError('Please provide a Google Cloud Client ID below, or use Demo Mode.');
      return;
    }
    saveStoredClientId(clientId);
    setLoading(true);

    requestGoogleAccessToken({
      clientId: clientId.trim(),
      onTokenSuccess: async (token) => {
        setIsConnected(true);
        setIsDemoMode(false);
        try {
          const events = await fetchGoogleCalendarEvents({ accessToken: token });
          onEventsUpdated(events);
          onShowToast?.(`Connected to Google Calendar! Synced ${events.length} events.`);
          setLoading(false);
        } catch (err) {
          setError(err.message || 'Connected, but failed to fetch events.');
          setLoading(false);
        }
      },
      onError: (err) => {
        setError(err.message || 'Failed to authenticate with Google.');
        setLoading(false);
      }
    });
  };

  const handleDisconnect = () => {
    clearGoogleSession();
    setIsConnected(false);
    setIsDemoMode(false);
    onEventsUpdated([]);
    onShowToast?.('Disconnected from Google Calendar.');
  };

  const handleRefreshEvents = async () => {
    if (isDemoMode) {
      const demo = getDemoGoogleEvents();
      onEventsUpdated(demo);
      onShowToast?.('Refreshed demo Google Calendar events.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const events = await fetchGoogleCalendarEvents({});
      onEventsUpdated(events);
      onShowToast?.(`Refreshed ${events.length} Google Calendar events.`);
    } catch (err) {
      setError(err.message || 'Failed to refresh events.');
      if (err.message.includes('expired')) {
        setIsConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnableDemo = () => {
    setIsDemoMode(true);
    setIsConnected(true);
    const demo = getDemoGoogleEvents();
    onEventsUpdated(demo);
    onShowToast?.('Activated Google Calendar preview mode with sample events.');
  };

  // Push pending todos to Google Calendar
  const handlePushTasksToGCal = async () => {
    if (!isConnected) {
      setError('Connect to Google Calendar before syncing tasks.');
      return;
    }
    const pendingTodos = todos.filter(t => !t.completed && t.dueDate);
    if (pendingTodos.length === 0) {
      onShowToast?.('No pending tasks with due dates to sync.');
      return;
    }

    if (isDemoMode) {
      onShowToast?.(`Simulated sync: ${pendingTodos.length} tasks synced to Google Calendar.`);
      return;
    }

    setSyncingTasks(true);
    setError('');
    let syncedCount = 0;

    try {
      for (const task of pendingTodos) {
        await createGoogleCalendarEvent({ task });
        syncedCount++;
      }
      onShowToast?.(`Successfully exported ${syncedCount} tasks into your Google Calendar!`);
      // Refresh events
      await handleRefreshEvents();
    } catch (err) {
      setError(`Failed during sync: ${err.message}`);
    } finally {
      setSyncingTasks(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: '#4285F4', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff' 
            }}>
              <CalendarIcon size={18} />
            </div>
            <div>
              <div className="modal-title">Google Calendar API</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Two-way sync with your primary Google Calendar
              </span>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--danger-subtle)',
              color: 'var(--danger)',
              fontSize: '0.82rem'
            }}>
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-app)',
            border: `1px solid ${isConnected ? 'var(--success)' : 'var(--border-subtle)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--success)' : 'var(--text-tertiary)'
              }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {isConnected 
                    ? (isDemoMode ? 'Google Calendar (Demo Preview Mode)' : 'Connected to Google Calendar')
                    : 'Google Calendar Not Connected'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {isConnected 
                    ? 'Calendar events are automatically overlaid in your views' 
                    : 'Connect via OAuth 2.0 or test with sample events'}
                </div>
              </div>
            </div>

            {isConnected ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="pill-btn"
                  onClick={handleRefreshEvents}
                  disabled={loading}
                  title="Refresh events from Google"
                >
                  <RefreshCw size={13} className={loading ? 'flame-active' : ''} style={{ marginRight: '4px' }} />
                  Refresh
                </button>
                <button
                  type="button"
                  className="pill-btn"
                  style={{ color: 'var(--danger)' }}
                  onClick={handleDisconnect}
                  title="Disconnect"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{ backgroundColor: '#4285F4', gap: '6px' }}
                onClick={handleConnect}
                disabled={loading}
              >
                <ShieldCheck size={15} />
                <span>{loading ? 'Connecting...' : 'Authorize'}</span>
              </button>
            )}
          </div>

          {/* Sync Tasks to Google Calendar Action */}
          {isConnected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>Export Scheduled Tasks → Google Calendar</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Pushes your open tasks with due dates into your primary Google Calendar.
                </div>
              </div>
              <button
                type="button"
                className="pill-btn"
                style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--accent-primary)', color: 'var(--accent-text)', gap: '6px' }}
                onClick={handlePushTasksToGCal}
                disabled={syncingTasks}
              >
                <UploadCloud size={14} />
                <span>{syncingTasks ? 'Syncing...' : 'Sync Tasks'}</span>
              </button>
            </div>
          )}

          {/* Configuration: Client ID */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={13} />
                <span>Google Cloud OAuth Client ID</span>
              </label>
              <button
                type="button"
                style={{ fontSize: '0.75rem', color: 'var(--accent-text)', cursor: 'pointer' }}
                onClick={() => setShowGuide(!showGuide)}
              >
                {showGuide ? 'Hide Setup Guide' : 'Setup Guide & Credentials'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                style={{ flex: 1, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                className="pill-btn"
                onClick={handleSaveClientId}
              >
                Save ID
              </button>
            </div>
          </div>

          {/* Quick Demo Preview Option */}
          {!isConnected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-app)',
              border: '1px dashed var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>No Google Cloud credentials ready?</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Test Google Calendar event rendering with 1-click sample events.
                </p>
              </div>
              <button
                type="button"
                className="pill-btn"
                onClick={handleEnableDemo}
              >
                <Sparkles size={14} style={{ marginRight: '4px', color: '#f59e0b' }} />
                Demo Mode
              </button>
            </div>
          )}

          {/* Setup Guide */}
          {showGuide && (
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                How to get your free Google OAuth Client ID:
              </div>
              <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>
                  Go to{' '}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    Google Cloud Console Credentials <ExternalLink size={11} style={{ display: 'inline' }} />
                  </a>
                </li>
                <li>Create a Project and enable the <strong>Google Calendar API</strong> in the API Library.</li>
                <li>Under <strong>OAuth consent screen</strong>, select "External" and add your email.</li>
                <li>Go to <strong>Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.</li>
                <li>Application type: <strong>Web application</strong>.</li>
                <li>
                  Authorized JavaScript origins:{' '}
                  <code style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '4px' }}>
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}
                  </code>
                </li>
                <li>Copy the Client ID and paste it into the field above.</li>
              </ol>
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
