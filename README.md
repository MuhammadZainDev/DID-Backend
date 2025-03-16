# DuaonAI - Backend

This is the backend server for the DuaonAI mobile application. It provides API endpoints for Islamic duas (supplications), user authentication, and favorite management.

## 📋 Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features
- User authentication (signup, login, password reset)
- Browse duas by categories and subcategories
- Save favorite duas
- AI-generated duas using Google's Gemini AI
- Contact form functionality

## 🛠️ Technologies

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Email**: Nodemailer
- **Password Encryption**: bcryptjs
- **AI Integration**: Google Generative AI (Gemini)

## 📝 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- Gmail account (for email functionality)
- Google Gemini API key (for AI-generated duas)

## 🚀 Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd DuaonAI-Backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment variables**:

Create a `.env` file in the root directory by copying from the example:
```bash
cp .env.example .env
```

Then edit the `.env` file with your actual configurations:
```env
# Server Configuration
PORT=5000
NODE_ENV=development # Change to 'production' for production

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=DuaonAIDB

# JWT Configuration
# Generate a strong random secret using:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secure_key

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000
```

> **Important Notes:**
> - For EMAIL_PASS, use an App Password from Google. Get it from: https://myaccount.google.com/apppasswords
> - For GEMINI_API_KEY, create one at: https://aistudio.google.com/app/apikey
> - Generate a strong JWT_SECRET for production - don't use the example value

4. **Set up the database**:

First, create the database:
```bash
psql -U postgres
CREATE DATABASE DuaonAIDB;
\q
```

5. **Import database schema and data**:

The simplest way to set up the database is using the comprehensive setup file:
```bash
psql -U postgres -d DuaonAIDB -f database_setup.sql
```

> **Note:** The database_setup.sql file will create ALL required tables and insert sample data in a single step.

6. **Start the server**:

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 💾 Database Setup

### One-Step Setup (Recommended)
The `database_setup.sql` file contains everything needed to set up your database:
- Creates all tables (users, categories, subcategories, duas, favorites)
- Sets up relationships between tables
- Adds sample data

To use this approach:
```bash
psql -U postgres -d DuaonAIDB -f database_setup.sql
```

### Alternative: Using Individual Migration Files
If you prefer to run migrations individually (not recommended for initial setup):

```bash
psql -U postgres -d DuaonAIDB -f src/db/migrations/001_create_users_table.sql
psql -U postgres -d DuaonAIDB -f src/db/migrations/002_add_reset_token_columns.sql
psql -U postgres -d DuaonAIDB -f src/db/migrations/003_create_favorites_table.sql
```

> **Important:** The individual migration files do NOT create all required tables. You must use database_setup.sql for a complete setup.

## 📁 Project Structure

```
DuaonAI-Backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── db.js           # Database configuration
│   │   └── emailConfig.js  # Email configuration
│   ├── db/                 # Database scripts
│   │   └── migrations/     # Migration files
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── index.js            # Application entry point
├── .env                    # Environment variables
├── .env.example            # Example environment variables
└── database_setup.sql      # Complete database setup script
```

## 📚 Database Schema

The application uses the following database tables:

1. **users** - Store user account information
   - `id`, `name`, `email`, `password`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`

2. **categories** - Main categories of duas
   - `id`, `name`, `description`, `icon`, `created_at`, `updated_at`

3. **subcategories** - Subcategories of duas within main categories
   - `id`, `category_id`, `name`, `description`, `icon`, `created_at`, `updated_at`

4. **duas** - Individual dua entries
   - `id`, `subcategory_id`, `name`, `arabic_text`, `translation`, `transliteration`, `urdu_translation`, `reference`, `benefit`, `favorited`, `created_at`, `updated_at`

5. **favorites** - User's favorite duas
   - `id`, `user_id`, `dua_id`, `subcategory_id`, `created_at`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category

### Subcategories
- `GET /api/subcategories` - Get all subcategories
- `GET /api/subcategories/category/:categoryId` - Get subcategories by category ID
- `GET /api/subcategories/:id` - Get a single subcategory

### Duas
- `GET /api/duas` - Get all duas
- `GET /api/duas/subcategory/:subcategoryId` - Get duas by subcategory ID
- `GET /api/duas/:id` - Get a single dua

### Favorites
- `POST /api/favorites` - Add a dua to favorites
- `DELETE /api/favorites/:duaId` - Remove a dua from favorites
- `GET /api/favorites` - Get all user favorites
- `GET /api/favorites/check/:duaId` - Check if a dua is in favorites

### AI-Generated Duas
- `POST /api/gemini/dua` - Generate dua information using Google's Gemini AI

### Contact
- `POST /api/contact` - Send contact form email

### Health Check
- `GET /health` - Simple endpoint to check if the API is running

## 🔄 Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## 🔒 Security

The application implements several security measures:

- **Password Encryption**: All passwords are hashed using bcrypt
- **JWT Authentication**: Securely authenticate users with JSON Web Tokens
- **Rate Limiting**: Prevents brute-force and DOS attacks
- **CORS Protection**: Restricts which domains can access the API
- **Helmet**: Sets HTTP headers for protection against common attacks
- **Input Validation**: All user inputs are validated before processing
- **Email Verification**: Used for secure password reset
- **Database Security**: 
  - Parameterized queries prevent SQL injection
  - In production, SSL connection is used

### Production Security Checklist

Before deploying to production, ensure:

1. Set `NODE_ENV=production` in your environment
2. Generate a strong random JWT_SECRET key
3. Set up the `ALLOWED_ORIGINS` with your frontend domain(s)
4. Use SSL/TLS for database connections
5. Implement proper logging with sensitive data redacted
6. Set up monitoring for detecting unusual activity

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details 