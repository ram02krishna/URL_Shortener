# Shortify - A Full-Stack URL Shortener

Shortify is a modern, full-stack URL shortener application built with a React frontend and a Node.js/Express backend. It provides a seamless experience for users to create, manage, and share shortened URLs. With a clean, responsive interface and powerful features, Shortify is designed to be both user-friendly and highly functional.

## Key Features

- **Free Tier**: 3 free URL shortens per device without signup - no login required!
- **User Authentication**: Secure user registration and login using JWT-based authentication.
- **URL Shortening**: Generate custom or random short URLs from long ones.
- **URL Management**: Create, retrieve, and delete shortened URLs.
- **Redirection**: Handles redirection from short URLs to their original target.
- **Dashboard**: A personalized dashboard to view, copy, and delete your shortened URLs.
- **Rate Limiting**: Built-in API rate limiting to prevent abuse and ensure fair usage.
- **Theme Control**: Switch between light, dark, and system-default themes for a comfortable user experience.
- **Responsive Design**: A sleek and modern UI that looks great on all screen sizes.
- **API Endpoints**: A well-structured backend API for managing users and URLs.
- **Toast Notifications**: Instant, user-friendly feedback for all actions.
- **Database**: Uses PostgreSQL with Drizzle ORM for database management.

## Tech Stack

| Category          | Technology                                       |
| ----------------- | ------------------------------------------------ |
| **Frontend**      | React, Vite, Tailwind CSS, React Router, Axios   |
| **Backend**       | Node.js, Express.js, PostgreSQL, Drizzle ORM     |
| **Authentication**| JSON Web Tokens (JWT)                            |
| **Containerization**| Docker                                           |

### Backend Technologies
- **Framework**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod (Centralized Middleware)
- **Error Handling**: Centralized `asyncHandler` and global error router
- **Rate Limiting**: `express-rate-limit`
- **ID Generation**: `nanoid`

## Project Structure

The project is organized into two main directories:

- **`/frontend`**: Contains the React application, including all components, pages, services, and styles.
- **`/backend`**: Contains the Node.js server, including API routes, database models, and authentication logic.

## Getting Started

To get the application up and running locally, follow these steps:

### Prerequisites

- Node.js (LTS version)
- pnpm (or npm/yarn)
- Docker and Docker Compose

---

### Step 1: Clone the Repository

Clone this project to your local machine:
```bash
git clone <your-repository-url>
cd <repository-folder>
```

---

### Step 2: Backend Setup

First, set up and start the backend server.

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create Environment File**:
    Create a `.env` file in the `backend` directory and add the following variables.
    ```
    # Port for the backend server
    PORT=8000

    # Connection string for your PostgreSQL database
    DATABASE_URL="postgresql://postgres:admin@localhost:5432/postgres"

    # A strong, secret key for signing JWTs
    JWT_SECRET=your-super-secret-key
    ```

3.  **Start the Database**:
    Run the following command from the `backend` directory to start a PostgreSQL instance using Docker.
    ```bash
    docker-compose up -d
    ```

4.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

5.  **Run Database Migrations**:
    Apply the database schema to your PostgreSQL instance.
    ```bash
    pnpm db:push
    ```

6.  **Start the Backend Server**:
    ```bash
    pnpm run dev
    ```
    The backend server will start on **`http://localhost:8000`**. Keep this terminal running.

---

### Step 3: Frontend Setup

In a new terminal, set up and start the frontend application.

1.  **Navigate to the frontend directory**:
    From the project root, run:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Start the Frontend Server**:
    ```bash
    pnpm run dev
    ```
    The frontend development server will start, typically on **`http://localhost:5173`**.

---

### Step 4: Rate Limiting Configuration

The backend includes rate limiting to prevent abuse:

- **Authentication Endpoints** (`/user/signup`, `/user/login`): 5 requests per 15 minutes per IP
- **URL Shortening Endpoint** (`/shorten`): 30 requests per 1 minute per IP
- **Global Limit**: 100 requests per 15 minutes per IP


---

## API Documentation

For detailed API endpoint documentation, see:
- **Backend API Docs**: [backend/README.md](backend/README.md) - Complete API endpoints and schemas
- **Frontend Integration**: [frontend/README.md](frontend/README.md) - Service layer and utilities

### Quick API Examples

**Free Tier URL Shortening** (No auth required):
```bash
curl -X POST http://localhost:8000/shorten-free \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "deviceId": "device-unique-id"
  }'
```

**Authenticated URL Shortening**:
```bash
curl -X POST http://localhost:8000/shorten \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "code": "custom-code"
  }'
```

**Get All User URLs**:
```bash
curl -X GET http://localhost:8000/codes \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Project Details

### Database Schema

**users table**:
- `id` (UUID, primary key)
- `firstname` (varchar)
- `lastname` (varchar)
- `email` (varchar, unique)
- `password` (hashed)
- `salt` (for password hashing)
- `createdAt`, `updatedAt` (timestamps)

**urls table**:
- `id` (UUID, primary key)
- `shortCode` (varchar, unique)
- `targetURL` (text)
- `userId` (UUID, foreign key, optional for free tier)
- `deviceId` (varchar, optional for authenticated users)
- `createdAt`, `updatedAt` (timestamps)

### File Structure

```
URL_Shortener/
├── backend/
│   ├── models/           # Database schemas (Drizzle ORM)
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── middlewares/      # Auth, rate limiting
│   ├── utils/            # Hash, token utilities
│   ├── validation/       # Zod schemas
│   ├── db/              # Database connection
│   ├── index.js         # Server entry point
│   ├── package.json     # Dependencies
│   └── docker-compose.yml # PostgreSQL setup
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Route pages
    │   ├── context/      # React context (Auth, Theme)
    │   ├── services/     # API calls
    │   ├── utils/        # Helper functions (device tracking)
    │   ├── styles/       # Global CSS
    │   ├── App.jsx       # Root component
    │   └── main.jsx      # Entry point
    ├── vite.config.js    # Vite configuration
    ├── tailwind.config.js # Tailwind CSS
    ├── package.json      # Dependencies
    └── .env              # Environment variables
```

### Step 5: Free Tier Feature

Shortify includes a **free tier** that allows users to try the application without signing up:

#### Key Features
- **3 Free URL Shortens**: Every device gets 3 free attempts to shorten URLs
- **No Signup Required**: Try before committing to an account
- **Device-Based Tracking**: Free uses are tracked per device using browser fingerprinting
- **Persistent**: Free use counter persists across:
  - Browser restarts ✓
  - Device restarts ✓
  - Server reboots ✓
  - Page reloads ✓
- **Auto Prompts**: After 3 attempts, users are prompted to sign up/login for unlimited access

#### How It Works
1. User visits the home page and sees the "Try for Free" widget
2. User shortens a URL without authentication (uses `/shorten-free` endpoint)
3. Device ID is generated using browser fingerprinting + timestamp
4. Count is stored in localStorage and persists indefinitely
5. After 3 uses, user must sign up/login to continue

#### Technical Details
- Device ID: Generated using browser properties (mimeTypes, userAgent, plugins, screen resolution)
- Storage: localStorage with keys `device_id` and `free_uses`
- Backend: Supports both free tier (`/shorten-free`) and authenticated (`/shorten`) endpoints
- Enforcement: Frontend limits 3 attempts; backend validates deviceId for free tier URLs

---

### Step 6: Access the Application

Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`). You should now be able to:
1. Try 3 free URL shortens without signup
2. Register and log in for unlimited shortens
3. Manage all your shortened URLs in the dashboard

---

## Vercel Deployment

Shortify is fully optimized for deployment on Vercel. Both the frontend and backend can be hosted seamlessly. 

### Backend Deployment
1. Import the `backend` folder into a new Vercel project.
2. The `vercel.json` file is already configured to route traffic to `index.js`.
3. Set the following Environment Variables in Vercel:
   - `DATABASE_URL`: Your production PostgreSQL connection string (Supabase, Neon, etc.).
   - `JWT_SECRET`: A secure random string.
   - `CORS_ORIGIN`: The URL of your deployed frontend (e.g., `https://your-frontend.vercel.app`).

### Frontend Deployment
1. Import the `frontend` folder into a new Vercel project.
2. Vercel will automatically detect it as a Vite/React application.
3. The `vercel.json` in the frontend handles single-page application (SPA) routing, automatically preventing 404 errors on refresh.
4. Set the following Environment Variable in Vercel:
   - `VITE_BACKEND_URL`: The URL of your deployed backend (e.g., `https://your-backend.vercel.app`).
   
*Note: QR Codes and URL redrections rely directly on the deployed backend URL, making them fully functional out-of-the-box upon deployment!*

---