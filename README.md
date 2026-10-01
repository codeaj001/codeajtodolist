# CodeAJ • Minimalist Todo & Calendar

> A high-performance, minimalist productivity and daily habit tracking suite built with React 19, Vite, and an impeccable custom design system. Features an interactive Google Calendar-inspired schedule engine, auto-looping daily routines with custom rest day exclusions, seamless mobile responsiveness, and **two-way Google Calendar API integration**.

---

## ✨ Key Features

### 1. Google Calendar API Integration
- **Two-Way Sync**: Connect your primary Google Calendar via Google Identity Services (OAuth 2.0).
- **Overlay Google Events**: View all your Google Calendar meetings and appointments directly in the Month, Week, and Day views.
- **One-Click Video Meetings**: Launch Google Meet links right from the calendar cards.
- **Task Export to GCal**: Export scheduled tasks and deadlines directly into your Google Calendar with one click.
- **Demo Mode**: Test Google Calendar event rendering with 1-click preview events without needing cloud credentials immediately.

### 2. One-Time Tasks & Todo Management
- **Deadlines & Time Slots**: Schedule tasks with precise due dates and target completion times.
- **Priority System**: High, Medium, and Low priority classification with distinct visual markers.
- **Subtasks & Checklists**: Break down complex deliverables into step-by-step checklists with progress indicators.
- **Categories**: Organize tasks across *Work*, *Personal*, *Health & Fitness*, *Study & Learning*, and *Urgent*.

### 3. Auto-Looping Daily Routines & Habits
- **Everyday Auto-Loop**: Configure recurring habits that populate daily schedules automatically.
- **Custom Rest Day Exclusions**: Specify the exact days of the week you do or do not want to loop (e.g., *Weekdays only*, *Weekends off*, or custom weekday combinations).
- **Single-Day Skip Exceptions**: Skip a routine on any specific date without breaking your overall schedule configuration.
- **Streak Tracker & Adherence Stats**: Real-time streak tracking with active flame indicators and 14-day adherence progress bars.

### 4. Interactive Google Calendar-Style View
- **Month Grid View**: 6-week × 7-day comprehensive view displaying scheduled tasks, active recurring habits, and Google Calendar events as chips on each date.
- **Week Planner View**: 7-column timeline with direct one-click check-off directly on the calendar.
- **Day View / Agenda**: Chronological breakdown for focused execution on any specific day.
- **Interactive Day Drill-down**: Click on any calendar cell to view all tasks/habits for that date or quickly schedule a new task.

### 5. Impeccable Minimalist UI & Mobile Responsiveness
- **Design Tokens**: Carefully balanced typography with *Plus Jakarta Sans* and tabular numerals (*JetBrains Mono*).
- **Obsidian Dark & Crisp Paper Light Modes**: Seamless theme toggle with persistent user preference.
- **Micro-Interactions**: Snappy checkbox feedback and celebratory completion animations.
- **Mobile First**: Fixed bottom navigation bar, ergonomic floating action button, and touch targets.

### 6. Local Storage & Data Portability
- **Instant Persistence**: Automatically saves all todos, habits, and preferences in `localStorage`.
- **JSON Export / Import**: Easily export data backups as `.json` or import existing task lists.
- **Demo Seed Reset**: Quickly reset sample data to explore features out of the box.

---

## 🔑 Google Calendar API Setup (OAuth 2.0)

To connect your own Google Calendar:
1. Navigate to the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) page.
2. Create a project and enable the **Google Calendar API** in the API Library.
3. Under **OAuth consent screen**, select "External" and configure your app details.
4. Go to **Credentials > Create Credentials > OAuth client ID**.
5. Select **Web application**.
6. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:5173
   ```
   *(or your production hosting domain)*
7. Copy your **Client ID** and paste it into the **Sync Google Calendar** dialog within the app.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

```bash
# Clone the repository
git clone git@github.com:codeaj001/codeajtodolist.git
cd codeajtodolist

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be running at `http://localhost:5173/`.

### Production Build

```bash
# Create optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack

- **Core**: React 19, JavaScript (ESModules)
- **API**: Google Calendar REST API v3 & Google Identity Services (GIS)
- **Bundler & Tooling**: Vite
- **Icons**: Lucide React
- **Micro-Interactions**: Canvas Confetti
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, smooth transitions, and tabular numbers

---

## 📄 License

MIT License. Crafted for high-focus productivity.
