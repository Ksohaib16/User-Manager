# User Management System

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with:
    - `JWT_SECRET=your_secret`
    - `MONGO_URL=mongodb_url`
    - `REDIS_URL=redis_url`
    - `ADMIN_SECRET=admin-secret`
4. Start server: `node index.js`

## API Endpoints

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | /api/auth/signup   | User registration  |
| POST   | /api/notifications | Send notifications |

## Example Requests

**Send Notification:**

```json
POST /api/notifications
Headers: { "Authorization": "Bearer <JWT_TOKEN>" }
Body: {
  "recipients": ["64a1b2c3d4e5f6a7b8c9d0e1"],
  "content": "Urgent meeting!",
  "isCritical": true
}
```
