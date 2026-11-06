# AssetTrack — Frontend Application

Modern Enterprise React Application for asset management, equipment lifecycle tracking, and employee inventory.

## Tech Stack
- **Framework:** React 19 (JavaScript / JSX)
- **Tooling:** Vite
- **Routing:** React Router v7
- **Styling:** Modular CSS & Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Motion

## Structure
```
frontend/
├── src/
│   ├── components/    # Reusable UI components (Navbar, Sidebar, StatusBadge, etc.)
│   ├── context/       # Auth and Notification state providers
│   ├── layouts/       # Enterprise dashboard layout
│   ├── pages/         # 16+ enterprise application pages
│   ├── routes/        # Role-based protected routes
│   ├── services/      # Storage service & initial enterprise seed data
│   ├── types/         # Domain definitions and enums
│   ├── utils/         # Asset validation rules, depreciation, CSV export
│   ├── App.jsx        # Root application component
│   ├── main.jsx       # Application entry point
│   └── index.css      # Design tokens and global theme styles
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
└── vite.config.js     # Vite configuration
```

## Running Frontend
```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`.
