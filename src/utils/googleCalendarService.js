// Google Calendar API Integration Service
// Uses Google Identity Services (GIS) & Google Calendar REST API v3

const GCAL_CLIENT_ID_KEY = 'codeaj_gcal_client_id';
const GCAL_TOKEN_KEY = 'codeaj_gcal_token';
const GCAL_EXPIRY_KEY = 'codeaj_gcal_token_expiry';
const GCAL_EVENTS_KEY = 'codeaj_gcal_cached_events';

// Default Scope for Google Calendar Events reading and writing
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

/**
 * Get stored Google Client ID
 */
export function getStoredClientId() {
  return localStorage.getItem(GCAL_CLIENT_ID_KEY) || '';
}

/**
 * Save Google Client ID
 */
export function saveStoredClientId(clientId) {
  if (clientId) {
    localStorage.setItem(GCAL_CLIENT_ID_KEY, clientId.trim());
  } else {
    localStorage.removeItem(GCAL_CLIENT_ID_KEY);
  }
}

/**
 * Get active access token if not expired
 */
export function getActiveAccessToken() {
  const token = localStorage.getItem(GCAL_TOKEN_KEY);
  const expiry = localStorage.getItem(GCAL_EXPIRY_KEY);
  if (!token || !expiry) return null;

  if (Date.now() >= Number(expiry)) {
    // Token expired
    localStorage.removeItem(GCAL_TOKEN_KEY);
    localStorage.removeItem(GCAL_EXPIRY_KEY);
    return null;
  }
  return token;
}

/**
 * Save access token with expires_in seconds
 */
export function saveAccessToken(token, expiresInSeconds = 3600) {
  localStorage.setItem(GCAL_TOKEN_KEY, token);
  localStorage.setItem(GCAL_EXPIRY_KEY, String(Date.now() + (expiresInSeconds - 60) * 1000));
}

/**
 * Clear Google Calendar session
 */
export function clearGoogleSession() {
  localStorage.removeItem(GCAL_TOKEN_KEY);
  localStorage.removeItem(GCAL_EXPIRY_KEY);
  localStorage.removeItem(GCAL_EVENTS_KEY);
}

/**
 * Get cached Google Calendar events
 */
export function getCachedGoogleEvents() {
  try {
    const raw = localStorage.getItem(GCAL_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Cache Google Calendar events
 */
export function saveCachedGoogleEvents(events) {
  try {
    localStorage.setItem(GCAL_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to cache Google events', e);
  }
}

/**
 * Check if GIS script is loaded in window
 */
export function isGoogleIdentityLoaded() {
  return typeof window !== 'undefined' && window.google?.accounts?.oauth2;
}

/**
 * Request Access Token using Google Identity Services token client
 */
export function requestGoogleAccessToken({ clientId, onTokenSuccess, onError }) {
  if (!isGoogleIdentityLoaded()) {
    onError(new Error('Google Identity Services script is not loaded yet. Please check your internet connection or reload.'));
    return;
  }

  const effectiveClientId = clientId || getStoredClientId();
  if (!effectiveClientId) {
    onError(new Error('Please configure your Google Cloud Client ID.'));
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: effectiveClientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          onError(new Error(response.error_description || response.error));
          return;
        }
        if (response.access_token) {
          saveAccessToken(response.access_token, response.expires_in || 3600);
          onTokenSuccess(response.access_token);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (err) {
    onError(err);
  }
}

/**
 * Fetch events from Google Calendar REST API v3
 */
export async function fetchGoogleCalendarEvents({ accessToken, timeMin, timeMax }) {
  const token = accessToken || getActiveAccessToken();
  if (!token) {
    throw new Error('No valid Google Calendar access token found.');
  }

  const min = timeMin ? new Date(timeMin).toISOString() : new Date(Date.now() - 30 * 86400000).toISOString();
  const max = timeMax ? new Date(timeMax).toISOString() : new Date(Date.now() + 60 * 86400000).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(min)}&timeMax=${encodeURIComponent(max)}&maxResults=250`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearGoogleSession();
      throw new Error('Google Calendar authorization expired. Please reconnect.');
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Failed to fetch events: ${response.statusText}`);
  }

  const data = await response.json();
  const normalizedEvents = (data.items || []).map(normalizeGoogleEvent);
  saveCachedGoogleEvents(normalizedEvents);
  return normalizedEvents;
}

/**
 * Insert task into Google Calendar as an event
 */
export async function createGoogleCalendarEvent({ accessToken, task }) {
  const token = accessToken || getActiveAccessToken();
  if (!token) {
    throw new Error('Google Calendar is not connected.');
  }

  const dueDateStr = task.dueDate || new Date().toISOString().split('T')[0];
  let startDateTime;
  let endDateTime;

  if (task.dueTime) {
    const [hours, mins] = task.dueTime.split(':');
    const start = new Date(`${dueDateStr}T${hours}:${mins}:00`);
    const end = new Date(start.getTime() + 45 * 60000); // 45 min default duration
    startDateTime = { dateTime: start.toISOString() };
    endDateTime = { dateTime: end.toISOString() };
  } else {
    // All-day event
    startDateTime = { date: dueDateStr };
    endDateTime = { date: dueDateStr };
  }

  const eventPayload = {
    summary: task.title,
    description: `${task.description || ''}\n\n[Synced from CodeAJ Todo & Calendar]`,
    start: startDateTime,
    end: endDateTime,
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Could not create Google Calendar event');
  }

  const created = await response.json();
  return normalizeGoogleEvent(created);
}

/**
 * Normalize Google Event to uniform calendar item
 */
function normalizeGoogleEvent(item) {
  let startDateStr = '';
  let startTimeStr = '';

  if (item.start?.dateTime) {
    const d = new Date(item.start.dateTime);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    startDateStr = `${yr}-${mo}-${da}`;
    startTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } else if (item.start?.date) {
    startDateStr = item.start.date;
  }

  return {
    id: `gcal-${item.id}`,
    gcalId: item.id,
    title: item.summary || '(Google Event)',
    description: item.description || '',
    dueDate: startDateStr,
    dueTime: startTimeStr || null,
    isGoogleEvent: true,
    htmlLink: item.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${item.id}`,
    location: item.location || '',
    hangoutLink: item.hangoutLink || null,
    category: 'google',
    completed: false,
    color: '#4285F4', // Google Calendar signature blue
    source: 'google-calendar',
  };
}

/**
 * Generate Demo Google Calendar events for quick verification without GCP setup
 */
export function getDemoGoogleEvents() {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = d.getDate();

  const pad = (n) => String(n).padStart(2, '0');

  const todayStr = `${yr}-${mo}-${pad(day)}`;

  const tomorrow = new Date(d);
  tomorrow.setDate(d.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

  const in3Days = new Date(d);
  in3Days.setDate(d.getDate() + 3);
  const in3DaysStr = `${in3Days.getFullYear()}-${pad(in3Days.getMonth() + 1)}-${pad(in3Days.getDate())}`;

  return [
    {
      id: 'gcal-demo-1',
      gcalId: 'demo-1',
      title: 'Sprint Planning & Team Sync (Google Meet)',
      description: 'Discuss upcoming sprints, velocity metrics, and feature backlog with engineering team.',
      dueDate: todayStr,
      dueTime: '10:00',
      isGoogleEvent: true,
      htmlLink: 'https://calendar.google.com',
      hangoutLink: 'https://meet.google.com/abc-defg-hij',
      location: 'Google Meet',
      category: 'google',
      completed: false,
      color: '#4285F4',
      source: 'google-calendar',
    },
    {
      id: 'gcal-demo-2',
      gcalId: 'demo-2',
      title: 'Quarterly Client Strategy Review',
      description: 'Review product demo, deliverables timeline, and roadmap alignment.',
      dueDate: tomorrowStr,
      dueTime: '15:30',
      isGoogleEvent: true,
      htmlLink: 'https://calendar.google.com',
      location: 'Conference Room Alpha',
      category: 'google',
      completed: false,
      color: '#4285F4',
      source: 'google-calendar',
    },
    {
      id: 'gcal-demo-3',
      gcalId: 'demo-3',
      title: 'Design Critique: Design System Refinements',
      description: 'Audit micro-interactions, dark/light contrast ratios, and typography rhythm.',
      dueDate: in3DaysStr,
      dueTime: '11:00',
      isGoogleEvent: true,
      htmlLink: 'https://calendar.google.com',
      hangoutLink: 'https://meet.google.com/xyz-uvwx-rst',
      location: 'Virtual',
      category: 'google',
      completed: false,
      color: '#4285F4',
      source: 'google-calendar',
    },
  ];
}
