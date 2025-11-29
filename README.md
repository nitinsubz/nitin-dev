# Nitin Dev - Personal Portfolio

A modern, responsive personal portfolio website built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Timeline Page**: Interactive timeline showcasing life events with smooth scroll animations
- **Career Page**: Professional work history with technology stack
- **Unfiltered Page**: Raw thoughts and brain dump section with a masonry layout
- **Admin Panel**: Full CRUD interface for managing all content
- **Firebase Integration**: All data backed by Firebase Firestore
- **Responsive Design**: Fully responsive with mobile menu
- **Smooth Animations**: Scroll-triggered animations and transitions

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Firebase** - Database and backend

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase configuration from Project Settings
   - Create a `.env` file in the root directory with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_ADMIN_PASSWORD=your-secure-password
   VITE_API_URL=http://localhost:3001/api
   ```

   **For Production Deployment:**
   - If your backend is at a different URL (e.g., `https://api.nsub.dev/api`), set `VITE_API_URL` to that URL
   - If your backend is proxied to `/api` on the same domain, leave `VITE_API_URL` unset (it will auto-detect)
   - Example: `VITE_API_URL=https://api.nsub.dev/api`

3. Set up Firebase Admin SDK (Backend):
   - In Firebase Console, go to Project Settings → Service Accounts
   - Click "Generate New Private Key" to download your service account key
   - Save the downloaded JSON file as `server/serviceAccountKey.json`
   - **Important**: 
     - This file contains sensitive credentials and is already in `.gitignore`
     - See `server/serviceAccountKey.json.example` for the expected format
     - Never commit this file to version control
   - Set the admin password in your environment (or use default):
   ```env
   ADMIN_PASSWORD=your-secure-password
   ```

4. Set up Firestore Collections:
   - In Firebase Console, go to Firestore Database
   - Create three collections: `timeline`, `career`, and `shitposts` (note: collection name remains `shitposts` for backward compatibility)
   - (Optional) Add some initial data or use the admin panel to add data

### Development

**Option 1: Run frontend and backend together (recommended)**
```bash
npm run dev:all
```
This starts both the frontend (Vite) and backend (Express) servers concurrently.

**Option 2: Run separately**

Start the backend server:
```bash
npm run dev:server
```
The backend API will be available at `http://localhost:3001`

Start the frontend development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Note**: The frontend needs the backend running for admin operations to work.

### Build

Build for production:
```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
nitin-dev/
├── src/
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Tailwind CSS imports
│   ├── components/
│   │   └── AdminPanel.tsx   # Admin interface
│   ├── firebase/
│   │   ├── config.ts        # Firebase client SDK configuration
│   │   ├── types.ts         # TypeScript types
│   │   └── services.ts     # Firestore read operations (client)
│   ├── services/
│   │   └── api.ts           # Backend API client
│   └── hooks/
│       └── useFirebaseData.ts  # React hooks for data fetching
├── server/
│   ├── index.ts             # Express backend server
│   ├── tsconfig.json        # Server TypeScript config
│   └── serviceAccountKey.json  # Firebase Admin SDK key (not in git)
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

## Admin Panel

Access the admin panel by clicking the settings icon (⚙️) in the navigation bar or navigating to the admin tab.

The admin panel allows you to:
- Add, edit, and delete timeline items
- Add, edit, and delete career items
- Add, edit, and delete unfiltered posts
- All changes are saved to Firebase via the backend API using Firebase Admin SDK

**Default Admin Password**: `admin123` (change via `VITE_ADMIN_PASSWORD` in `.env`)

**Important**: The admin panel requires the backend server to be running. All write operations go through the backend API which uses Firebase Admin SDK for secure, server-side operations.

## Customization

All content is managed through the admin panel and stored in Firebase. You can also:
- Customize the styling by editing Tailwind classes in components
- Modify the admin password via environment variables
- Add additional fields to data types in `src/firebase/types.ts`

## License

MIT

