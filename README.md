# WIF2003 - KPI Management System

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)

## 📌 Project Overview

A web-based **Key Performance Indicator (KPI) Management System** developed for the WIF2003 Web Programming Group Assignment under the supervision of **Dr. Uzair Iqbal**.

This system is designed to help organizations efficiently **track, manage, assign, and evaluate KPIs** for staff members through a structured workflow and visual dashboard.

## 👥 User Roles & Responsibilities

| Role     | Responsibilities |
|----------|------------------|
| **Manager** | - Create, update, and delete KPIs<br>- Assign KPIs to staff members<br>- Verify submitted KPI evidence<br>- Monitor overall KPI progress |
| **Staff** | - View assigned KPIs<br>- Update KPI progress<br>- Submit evidence for KPI completion<br>- Track personal performance |

## 🎯 Project Objectives

The KP Eye system aims to:
- Centralize KPI tracking and management
- Improve transparency in performance evaluation
- Enable structured KPI assignment and verification
- Provide real-time progress tracking through dashboards
- Simplify communication between managers and staff

## 📁 Project Structure

```text
├── Figma design                # UI/UX wireframes and interface mockups
│   ├── 2.1 Main.png
│   ├── 2.1 Manager Dashboard.png
│   ├── 2.1 Sidebar.png
│   ├── 2.2 All KPIs.png
│   ├── 2.2 Main.png
│   ├── 2.2 Sidebar.png
│   ├── 2.3 Edit KPI form.png
│   ├── 2.4 KPI Assignment Center.png
│   ├── staff UI example (3.1).png
│   └── web design.txt
├── frontend                    # React + Vite frontend application
│   ├── public                  # Static public assets
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── kpeye.png
│   ├── src                     # Main application source code
│   │   ├── assets              # Images and visual assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── component           # Reusable React UI components
│   │   │   ├── ActivityLog.jsx
│   │   │   ├── CategoryBadge.jsx
│   │   │   ├── ConversationMessage.jsx
│   │   │   ├── KpiSelectItem.jsx
│   │   │   ├── MilestoneRow.jsx
│   │   │   ├── NotificationCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StaffAssigneeRow.jsx
│   │   │   └── StatCard.jsx
│   │   ├── pages               # Application pages/routes
│   │   │   ├── all-kpis.jsx
│   │   │   ├── assignment-center.jsx
│   │   │   ├── create-edit-kpi.jsx
│   │   │   ├── evidence-detail-view.jsx
│   │   │   ├── feedback.jsx
│   │   │   ├── login.jsx
│   │   │   ├── manager-dashboard.jsx
│   │   │   ├── notification-dashboard.jsx
│   │   │   ├── register.jsx
│   │   │   ├── staff-assigned-kpi.jsx
│   │   │   ├── staff-dashboard.jsx
│   │   │   ├── staff-submit-progress.jsx
│   │   │   └── verification-inbox.jsx
│   │   ├── styles              # Global styling and themes
│   │   │   └── theme.css
│   │   ├── App.jsx             # Root React component
│   │   └── main.jsx            # Application entry point
│   ├── .gitignore
│   ├── README.md               # Frontend-specific documentation
│   ├── eslint.config.js        # ESLint configuration
│   ├── index.html              # Main HTML template
│   ├── package-lock.json
│   ├── package.json            # Project dependencies and scripts
│   └── vite.config.js          # Vite configuration
├── README.md                   # Main project documentation
└── package-lock.json
```


## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Edwintan-sk/WIF2003-Web_Programming.git
```

### 2. Navigate to frontend
```bash
cd frontend
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the frontend
```bash
npm run dev
```

### 2. Navigate to backend
```bash
cd backend
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the backend
```bash
npm run dev
```
---

*Developed by Group KP Eye*
