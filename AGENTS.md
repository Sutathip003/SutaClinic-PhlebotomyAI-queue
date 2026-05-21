# AGENTS.md

## Project
Build `SutaClinic-PhlebotomyAI-queue` as a clean multi-page clinic dashboard for phlebotomy queue and appointment management.

The UI should closely match the provided reference image:
- Clean medical dashboard
- Soft white background with subtle lavender and blue tint
- Left sidebar navigation
- Top header with page title and user profile area
- Statistic cards across the top
- Queue table, donut summary chart, appointments list, and AI insights panels

## Product Goal
Create a healthcare workflow application that helps staff:
- Manage patient queues
- Track appointments
- Monitor wait times
- Review daily completion metrics
- See AI-assisted insights and predictions

## Core Screens
Implement these screens first:
- Home / Login
- Dashboard
- Queue Management
- Appointments
- Patients
- AI Predictions
- Reports & Analytics
- Settings

## UI Direction
Match the reference image as closely as possible.

### Layout
- Home page is the login page
- After login, route the user to `Dashboard`
- Fixed left sidebar on app pages
- Main content area with generous spacing
- Top navigation bar with hamburger icon, page title, and user profile
- Rounded cards with soft shadows
- Clean table sections with light borders

### Visual Style
- Primary color: vivid clinic purple
- Secondary accents: blue, green, and red for status and metrics
- Background: very light lavender/white gradient feel
- Border radius: medium to large
- Shadows: soft and subtle
- Typography: modern, clean, highly readable

### Sidebar
Sidebar should include:
- Brand/logo area at top
- App name: `SUTA CLINIC`
- Subtitle: `Phlebotomy AI Queue & Appointment System`
- Navigation items with active state styling similar to the screenshot
- Remove `Notifications` from the left sidebar
- Include `Settings`
- Include `Logout`
- Footer copyright text

### Navigation Behavior
- `Logout` should return the user to the home page
- Home page should show username and password input fields
- When the user enters username and password, redirect to `Dashboard`

### Dashboard Sections
Build the dashboard using these sections:

1. KPI cards
- Today's Appointments
- Patients in Queue
- Completed Today
- No Shows

2. Live Queue table
- Token No.
- Patient Name
- Status
- Estimated Wait
- Counter

3. Queue Summary
- Donut chart
- Legend for In Progress, Waiting, Completed, No Show

4. Today's Appointments list
- Time
- Patient Name
- Test/Service
- Status

5. AI Insights panel
- AI prediction card
- Suggestion card

## File Organization
Separate the project into dedicated files so each screen is easier to maintain and fix.

Recommended structure:
- `index.html` for the home/login page
- `pages/dashboard.html`
- `pages/queue.html`
- `pages/appointments.html`
- `pages/patients.html`
- `pages/ai-predictions.html`
- `pages/reports.html`
- `pages/settings.html`
- `assets/css/styles.css` for shared styling
- `assets/js/app.js` for shared behavior

Guidelines:
- Keep shared layout styles in one CSS file
- Keep shared navigation and login/logout logic in one JS file
- Keep each screen's HTML separate
- Avoid mixing all screens in one large HTML file

## Status Styles
Use clear badge styles:
- `In Progress`: soft green background with green text
- `Waiting`: soft blue background with blue text
- `Completed`: mint/green badge
- `Pending`: soft amber badge
- `No Show`: soft red badge

## Data Behavior
Start with clean mock data and structure the code so live backend integration can be added later.

Prepare for these domain entities:
- Patient
- Appointment
- QueueToken
- Counter
- PredictionInsight

## Implementation Guidance
- Prefer reusable UI sections for cards, badges, tables, sidebar items, and section headers.
- Keep the design responsive for desktop first, then tablet/mobile.
- Preserve the same panel ordering and spacing rhythm as the reference image.
- Use semantic HTML and accessible labels.
- Keep the interface polished and production-like, not a wireframe.

## Current Build Direction
This project currently uses a simple static structure:
- HTML for each page
- Shared CSS
- Shared JavaScript

Keep the codebase simple and clean first. Framework migration can happen later if needed.

## Definition Of Done
The first implementation is complete when:
- Home page works as a login entry screen
- User can enter username and password and access `Dashboard`
- Dashboard visually resembles the provided screenshot
- Sidebar, header, KPI cards, queue table, chart, appointments panel, and AI insights are present
- Dashboard, Queue, Appointments, Patients, AI Predictions, Reports, and Settings each have separate HTML files
- Shared styling and behavior are moved into separate CSS and JS files
- `Notifications` is removed from the left sidebar
- `Logout` returns to the home page
- Styling is clean and consistent
- Layout works well on common desktop and laptop sizes
- Code is organized for future expansion into a full clinic application
