# Shortify Backend

This directory contains the backend for the Shortify URL shortener application. It is built with Node.js and Express and provides a RESTful API for user authentication and URL management.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies-used)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Free Tier Implementation](#free-tier-implementation)
- [Rate Limiting](#rate-limiting)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)

## Features

- **RESTful API**: Clean, structured endpoints for user and URL management.
- **JWT Authentication**: Secure, stateless user sessions using HTTP headers.
- **Database ORM Integration**: Type-safe queries using Drizzle ORM and PostgreSQL.
- **Device Validations**: Validates incoming `deviceId` hashes for free tier limits.
- **Middleware Protections**: Employs `express-rate-limit` for DDoS prevention and abuse tracking.
- **Serverless Ready**: Pre-configured to deploy seamlessly on Vercel as serverless functions.

## Backend Architecture

- **Framework**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod
- **Rate Limiting**: `express-rate-limit`
- **ID Generation**: `nanoid`

## API Endpoints

All endpoints are accessible under the `/` prefix.

### Authentication

- `POST /user/signup`: Creates a new user account.
  - **Request Body**:
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "password": "yourpassword"
    }
    ```
  - **Response**:
    ```json
    {
      "data": {
        "userId": "some-uuid"
      }
    }
    ```

- `POST /user/login`: Authenticates a user and returns a JWT.
  - **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "yourpassword"
    }
    ```
  - **Response**:
    ```json
    {
      "token": "your-jwt"
    }
    ```

### URL Management

- `POST /shorten-free`: Creates a new short URL for free tier users (no authentication).
  - **Request Body**:
    ```json
    {
      "url": "https://example.com/a-very-long-url",
      "code": "custom-code", // Optional
      "deviceId": "device-identifier"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "some-uuid",
      "shortCode": "custom-code",
      "targetURL": "https://example.com/a-very-long-url"
    }
    ```
  - **Notes**: 
    - No authentication required
    - `deviceId` is required and should be unique per device
    - Free tier is limited to 3 shortens per device (enforced on frontend)

- `POST /shorten`: Creates a new short URL for authenticated users.
  - **Headers**: `Authorization: Bearer <your-jwt>`
  - **Request Body**:
    ```json
    {
      "url": "https://example.com/a-very-long-url",
      "code": "custom-code" // Optional
    }
    ```
  - **Response**:
    ```json
    {
      "id": "some-uuid",
      "shortCode": "custom-code",
      "targetURL": "https://example.com/a-very-long-url"
    }
    ```

- `GET /codes`: Retrieves all short codes for the authenticated user.
  - **Headers**: `Authorization: Bearer <your-jwt>`
  - **Response**:
    ```json
    {
      "codes": [
        {
          "id": "some-uuid",
          "shortCode": "custom-code",
          "targetURL": "https://example.com/a-very-long-url",
          "userId": "user-uuid"
        }
      ]
    }
    ```

- `DELETE /:id`: Deletes a short URL by its ID.
  - **Headers**: `Authorization: Bearer <your-jwt>`
  - **Response**:
    ```json
    {
      "deleted": true
    }
    ```

- `GET /:shortCode`: Redirects to the original URL.

## Rate Limiting

The API implements a three-tier rate limiting strategy to prevent abuse:

- **Global Limiter**: 100 requests per 15 minutes per IP (all routes)
- **Authentication Limiter**: 5 requests per 15 minutes per IP (`/user` routes - signup, login)
- **URL Limiter**: 30 requests per 1 minute per IP (URL shortening endpoints)

When a rate limit is exceeded, the API returns a `429 Too Many Requests` response with the following headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in the current window
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL

### Installation

1.  **Clone the repository** and navigate to the `backend` directory.
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Set up environment variables**: Create a `.env` file and add the following:
    ```
    PORT=8000
    DATABASE_URL="postgresql://postgres:admin@localhost:5432/postgres"
    JWT_SECRET=your-super-secret-key
    ```
4.  **Start the database**:
    ```bash
    docker-compose up -d
    ```
5.  **Apply database migrations**:
    ```bash
    pnpm db:push
    ```

### Available Commands

- **Start the development server**:
  ```bash
  pnpm run dev
  ```
- **Manage the database**:
  - `docker-compose up -d`: Start the database.
  - `docker-compose down`: Stop the database.
  - `pnpm db:push`: Apply migrations.
  - `pnpm db:studio`: Open the database studio.

The server will be available at `http://localhost:8000`.

## Free Tier (Backend Architecture)

The backend exposes a specific endpoint (`/shorten-free`) that bypasses standard JWT authentication but requires a valid `deviceId` payload.

### Backend Validation Flow:
1. **Public Endpoint**: `/shorten-free` accepts requests without Authorization headers.
2. **Schema Validation**: Requires a valid URL and a `deviceId` string.
3. **Database Insertion**: URLs are saved with `deviceId` populated and `userId` set to `null`.
4. **Rate Enforcement**: Shortening is strictly throttled to 30 requests per minute per IP via Express middleware.

*Note: The actual count limitation (e.g., maximum 3 free URLs) is enforced by the client-side local storage logic. The backend's primary job is to ensure the payload is correctly structured and to protect the endpoint from rapid automation abuse via IP rate limiting.*

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found (e.g., invalid short code)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

Example error response:
```json
{
  "error": "Invalid email or password"
}
```

---

## Database Schema

The database schema is defined with Drizzle ORM and consists of two main tables:

### `users`

| Column      | Type      | Constraints |
|-------------|-----------|-------------|
| `id`        | `uuid`    | Primary Key |
| `firstname` | `varchar` |             |
| `lastname`  | `varchar` |             |
| `email`     | `varchar` | Unique      |
| `password`  | `varchar` |             |
| `salt`      | `varchar` |             |

### `urls`

| Column      | Type      | Constraints               |
|-------------|-----------|---------------------------|
| `id`        | `uuid`    | Primary Key               |
| `shortCode` | `varchar` | Unique                    |
| `targetURL` | `varchar` |                           |
| `userId`    | `uuid`    | Foreign Key to `users.id` |

---

## Vercel Deployment

This backend is pre-configured to be deployed natively as Serverless Functions on Vercel.

### Steps to Deploy
1. Import the `backend` folder into Vercel.
2. Vercel will process the included `vercel.json`, treating `index.js` as the serverless entry point.
3. Add the following **Environment Variables** in your Vercel Project Settings:
   - `DATABASE_URL`: Your production Postgres database connection string.
   - `JWT_SECRET`: A secure random string for user authentication.
   - `CORS_ORIGIN`: Your deployed frontend's URL (e.g., `https://your-frontend.vercel.app`).

Once deployed, the backend handles short code resolution and QR redirects perfectly without additional configuration.