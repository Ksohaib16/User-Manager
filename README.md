# User Management System with Admin Panel 👥

A backend system for managing users, profiles, and notifications with real-time capabilities.

## Features ✨

-   User signup/login (email + password)
-   Profile management (name, bio, availability slots)
-   Notifications system with critical/normal priority
-   Admin privileges for special operations
-   Real-time notifications using WebSocket
-   Redis-based queue for offline users
-   Workers for Scheduled Jobs

## Tech Stack 💻

-   **Backend**: Node.js, Express
-   **Database**: MongoDB
-   **Queue**: Redis + Bull
-   **Auth**: JWT Tokens
-   **Real-time**: WebSocket

## Project Structure 📂

```
backend/
├── worker/
│   └── notificationQueue.js
│
├── routes/
│   ├── authRoute.js
│   ├── profileRoute.js
│   └── notificationRoute.js
│
├── config/
│   └── db.js
│
├── docs/
│   └── architecture.png
│
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   └── notificationController.js
│
├── helper/
│   └── checkAvailability.js
│
├── models/
│   ├── user.js
│   └── profile.js
│   └── notification.js
│
├── ws/
│   └── websocket.js
│
├── models/
│   ├── User.js
│   ├── Profile.js
│   └── Notification.js
│
├── validator.js
└── index.js
```

## Setup Guide 🛠️

### Prerequisites

-   Node.js & npm
-   MongoDB
-   Redis Server

### Environment Variables

Create `.env` file in root directory:

```env
MONGO_URL=mongodb://localhost:27017/user-management
JWT_SECRET=your_jwt_secret_here
ADMIN_SECRET=super_secret_admin_code
REDIS_URL=redis://localhost:6379
```

**Environment Variables Description:**

-   `MONGO_URL`: MongoDB connection URL
-   `JWT_SECRET`: Secret key for JWT tokens
-   `ADMIN_SECRET`: Special code to create admin users
-   `REDIS_URL`: Redis server connection URL

### Installation

```bash
npm install
```

### Running the System

Start server and worker in separate terminals:

**Terminal 1 (Main Server):**

```bash
node index.js
```

**Terminal 2 (Notification Worker):**

```bash
node worker/notificationQueue.js
```

## API Endpoints 📡

### Authentication Routes 🔐

#### 1. User Signup

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "message": "User created successfully",
    "user": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k",
        "email": "user@example.com",
        "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Admin Signup

```http
POST /api/auth/signup-admin
```

**Headers:**

```
admin: your_admin_secret
```

**Request Body:**

```json
{
    "email": "admin@company.com",
    "password": "admin123"
}
```

**Response:**

```json
{
    "message": "User created successfully",
    "user": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k",
        "email": "admin@company.com",
        "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. User Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k",
        "email": "user@example.com",
        "role": "user"
    }
}
```

### Profile Management 👤

```http
PATCH /api/profile
```

_Requires Auth Token_

**Request Body:**

```json
{
    "name": "Demo1",
    "number": "9876543210",
    "bio": "Project Head",
    "availability": {
        "startTime": "09:00",
        "endTime": "10:00"
    }
}
```

**Note:** Times are converted to UTC before saving in DB

**Response:**

```json
{
    "message": "Profile updated successfully",
    "profile": {
        "userId": "65a1b2c3d4e5f6g7h8i9j0k",
        "name": "Demo1",
        "availability": {
            "startTime": "03:30",
            "endTime": "4:30"
        }
    }
}
```

### Notifications 🔔

```http
POST /api/notification
```

_Requires Auth Token_

**Request Body:**

1. Critical Notification (Admin Only)

```json
{
    "recipients": ["65a1b2c3d4e5f6g7h8i9j0k", "65b2c3d4e5f6g7h8i9j0k1l"],
    "content": "Server maintenance at 2 AM",
    "isCritical": true
}
```

2. Critical Notification (Admin Only)

```json
{
    "recipients": ["65a1b2c3d4e5f6g7h8i9j0k", "65b2c3d4e5f6g7h8i9j0k1l"],
    "content": "New feature update!",
    "isCritical": false
}
```

**Response Types:**

1. Critical Notification (Admin Only):

```json
{
    "success": true,
    "message": "Notification delivered to Online and Queued for Offline",
    "data": {
        "content": "Server maintenance at 2 AM",
        "status": "delivered Instantly"
    }
}
```

2. Normal Notification (Available Users):

```json
{
    "success": true,
    "message": "Notification delivered to Available Users",
    "data": {
        "content": "New feature update!",
        "status": "delivered"
    }
}
```

3. Normal Notification (Unavailable Users):

```json
{
    "success": true,
    "message": "Notification queued for unavailable users",
    "data": {
        "content": "Weekly meeting reminder",
        "status": "queued"
    }
}
```

4. Error Case:

```json
{
    "success": false,
    "message": "Failed to process notification",
    "error": "Receiver not found"
}
```

### WebSocket Connection 🔌

```javascript
const ws = new WebSocket('ws://localhost:3000?token=eyJhbGci...');

ws.onmessage = (event) => {
    console.log('Received:', JSON.parse(event.data));
};
```

## System Architecture 🏗️

![System Architecture](docs/architecture.png)

## Hosting 🚀

-   Hosted on **Render** (free tier)
-   Worker process runs as separate background service
-   Live URL: [your-render-app.onrender.com](https://your-render-app.onrender.com)

## Future Improvements 🔮

-   Add Push Notifications/SMS or Email
-   Implement notification history
-   Dashboard for monitoring queues
