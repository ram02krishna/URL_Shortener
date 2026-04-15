# Shortify - A Full-Stack URL Shortener

Shortify is a sleek, full-stack URL shortening platform built for speed, security, and simplicity. Developed with a modern React frontend and a robust Node.js/Express backend, it offers a seamless way to create, manage, and track shortened links. Whether you're a casual user looking for a quick shorten or a power user needing detailed analytics, Shortify provides a polished, responsive experience on any device.

## Key Features

- ** Instant Shortening**: Transform long URLs into concise, manageable links in seconds.
- ** Advanced Analytics**: Gain deep insights with detailed click tracking, including IP addresses, browser info, OS, and device types.
- ** Password-Protected Links**: Add an extra layer of security by requiring a password for specific shortened URLs.
- ** Link Expiration**: Set custom expiration dates for your links to ensure they are only accessible when needed.
- ** OTP Verification**: Secure user onboarding and password recovery via Email OTP (One-Time Password) verification.
- ** Free-to-Try Tier**: Shorten up to 3 URLs instantly without an account—perfect for quick, anonymous shares.
- ** Robust Security**: JWT-based authentication, salted password hashing, and centralized Zod-powered validation.
- ** Responsive Dashboard**: A unified interface to monitor, copy, delete, and view analytics for your entire URL portfolio.
- ** Adaptive Theming**: Seamlessly switch between Light, Dark, and System modes for optimal readability.
- ** High Performance**: Powered by a PostgreSQL backend and Drizzle ORM for lightning-fast redirection and data retrieval.

## Tech Stack

| Category          | Technology                                       |
| ----------------- | ------------------------------------------------ |
| **Frontend**      | React, Vite, Tailwind CSS, React Router, Axios   |
| **Backend**       | Node.js, Express.js, PostgreSQL, Drizzle ORM     |
| **Authentication**| JSON Web Tokens (JWT) + Email OTP                |
| **Validation**    | Zod (Centralized Middleware)                     |
| **Deployment**    | Docker, Docker Compose, Vercel (Serverless)      |

## Project Structure

The project is organized into two main directories:

- **`/frontend`**: Contains the React application, including all components, pages, services, and styles.
- **`/backend`**: Contains the Node.js server, including API routes, database models, and business logic.

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

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create Environment File**:
    Create a `.env` file in the `backend` directory:
    ```
    PORT=8000
    DATABASE_URL="postgresql://postgres:admin@localhost:5432/postgres"
    JWT_SECRET=your-super-secret-key
    CORS_ORIGIN=http://localhost:5173
    # Optional: Email configuration for OTP
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    ```

3.  **Start the Database**:
    ```bash
    docker-compose up -d
    ```

4.  **Install & Migrate**:
    ```bash
    pnpm install
    pnpm db:push
    ```

5.  **Start Server**:
    ```bash
    pnpm run dev
    ```

---

### Step 3: Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install & Start**:
    ```bash
    pnpm install
    pnpm run dev
    ```
    The app will be available at **`http://localhost:5173`**.

---

## API Documentation

### Quick API Examples

**Authenticated URL Shortening with Expiration & Password**:
```bash
curl -X POST http://localhost:8000/shorten \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "code": "my-secret-link",
    "expiresAt": "2026-12-31T23:59:59Z",
    "password": "securepassword123"
  }'
```

**View URL Analytics**:
```bash
curl -X GET http://localhost:8000/<url-id>/analytics \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Verify Email OTP**:
```bash
curl -X POST http://localhost:8000/user/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

---

## Database Schema

Shortify uses a relational schema managed by Drizzle ORM:

- **`users`**: Stores user profiles, hashed passwords, and verification status.
- **`urls`**: Stores shortened links, target URLs, expiration dates, and optional password protection.
- **`url_clicks`**: Stores detailed analytics for every click (IP, Browser, OS, Device, Timestamp).

---

## Deployment

Shortify is optimized for **Vercel**. 
- Backend runs as serverless functions.
- Frontend is a static SPA with client-side routing.
- Database can be hosted on any PostgreSQL provider (Neon, Supabase, etc.).
