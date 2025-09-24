# Options Travel Services

A complete visa application management system with React/Next.js frontend and Node.js/Express backend.

## Features

- **Authentication**: JWT-based auth with access & refresh tokens
- **Role-Based Access Control**: Admin, Manager, Employee, Customer roles
- **Visa Management**: Complete visa application processing system
- **Responsive UI**: Built with TailwindCSS
- **Protected Routes**: Frontend and backend route protection
- **User Management**: CRUD operations with role-based permissions

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React + Next.js
- TailwindCSS for styling
- Axios for API calls
- Context API for state management

## Project Structure

```
project-root/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── middleware/# Auth & role-based middleware
│   │   ├── models/    # MongoDB models
│   │   ├── routes/    # API routes
│   │   ├── controllers/# Route controllers
│   │   └── server.js  # Main server file
│   └── package.json
├── frontend/          # Next.js React app
│   ├── components/    # Reusable UI components
│   ├── pages/         # Next.js pages
│   ├── context/       # React context
│   ├── lib/           # Utility functions
│   └── styles/        # CSS styles
└── package.json       # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Configure environment:**
   - Copy `backend/.env` and update MongoDB URI and JWT secrets
   - Ensure MongoDB is running

3. **Seed default admin user:**
   ```bash
   npm run seed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API on http://localhost:5000
   - Frontend on http://localhost:3000

### Default Login
- **Email**: admin@example.com
- **Password**: admin123

## Role Permissions

| Role     | Dashboard | Roles | Users | Status | Settings |
|----------|-----------|-------|-------|--------|----------|
| Admin    | ✅ Full   | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Manager  | ✅ Full   | 👁️ View | ✅ Add/Edit | ✅ Edit | ❌ None |
| Employee | ❌ None   | ❌ None | 👥 Customers | ❌ None | ❌ None |
| Customer | ✅ View   | ❌ None | ❌ None | ❌ None | ❌ None |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - Get users (role-filtered)
- `POST /api/users` - Create user (role-restricted)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Roles
- `GET /api/roles` - Get role definitions

### Status
- `GET /api/status` - Get status options
- `PUT /api/status/:id` - Update user status

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based route protection
- Input validation and sanitization
- CORS configuration
- Secure HTTP headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Options Travel Services
Trusted Visa Assistance for Global Travel Needs