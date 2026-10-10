# Smart Attendance System - Frontend

Modern React 18 + TypeScript + Vite + Tailwind CSS + Three.js (React Three Fiber & Drei) web client.

## Technologies Used
- **React 18 & TypeScript**: Strict type safety and modular components.
- **Vite**: Rapid HMR and optimized production bundling.
- **Three.js & React Three Fiber (@react-three/fiber, @react-three/drei)**:
  - 3D Attendance Control Center in Admin Dashboard
  - Live Neural Recognition Scanner with laser sweeps
  - 3D Student Attendance Donut Ring
  - Automatic 2D Fallback toggle for low-power devices and `prefers-reduced-motion`
- **Recharts**: Area charts, bar charts, and department donut distributions.
- **TanStack Query (@tanstack/react-query)**: Server state caching and synchronization.
- **Zustand**: Fast state stores for authentication, real-time WebSocket feeds, and UI mode.
- **Tailwind CSS**: Enterprise dark-mode design system with glassmorphism styling.
- **Lucide Icons**: Crisp icon library.

---

## Getting Started

### 1. Install Dependencies (Already Completed)
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173/`

### 3. Production Build
```bash
npm run build
```
Generates minified static assets in `frontend/dist/`.

---

## Route Overview

| Route | Role | Description |
|-------|------|-------------|
| `/login` | Public | Role-aware login with Quick Demo Fill buttons |
| `/admin/dashboard` | Admin | KPI cards, 3D Attendance Control Center, trends |
| `/admin/live-recognition` | Admin | Webcam feed, dynamic bounding box, 3D HUD laser scanner |
| `/admin/students` | Admin | Searchable student table, filters, face registration |
| `/admin/students/new` | Admin | New student registration + webcam face capture modal |
| `/admin/students/:id` | Admin | Individual student attendance profile & history |
| `/admin/attendance` | Admin | Attendance logs, date range picker, manual mark, CSV/XLSX export |
| `/admin/analytics` | Admin | Deep visual analytics and department performance |
| `/admin/reports` | Admin | Custom report builder with instant Excel/CSV download |
| `/admin/cameras` | Admin | Vision camera management and stream toggles |
| `/admin/audit-logs` | Admin | Chronological administrative audit ledger |
| `/admin/settings` | Admin | Recognition threshold and WebGL 3D toggle |
| `/student/dashboard` | Student | Personal %, 3D Attendance Ring, today status |
| `/student/attendance` | Student | Personal verified attendance history |
| `/student/calendar` | Student | Monthly calendar with date detail popups |
| `/student/profile` | Student | Academic details and biometric template status |
