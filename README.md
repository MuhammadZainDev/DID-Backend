# Daily Islamic Dua - Backend

This is the backend server for the Daily Islamic Dua mobile application. It provides API endpoints for user authentication, dua management, and other features.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- Nodemailer
- bcryptjs

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=DailyIslamicDuaDB

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

4. Set up the database:
```bash
# Create the database
psql -U postgres
CREATE DATABASE DailyIslamicDuaDB;
\q

# Run migrations
psql -U postgres -d DailyIslamicDuaDB -f src/db/migrations/001_create_users_table.sql
psql -U postgres -d DailyIslamicDuaDB -f src/db/migrations/002_add_reset_token_columns.sql
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password

### Response Formats

Success Response:
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Error Response:
```json
{
  "error": "Error message"
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Security

- Passwords are hashed using bcrypt
- JWT is used for authentication
- Email verification for password reset
- Rate limiting on sensitive endpoints
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 