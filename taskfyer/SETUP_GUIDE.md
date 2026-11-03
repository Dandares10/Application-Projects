# Taskfyer - MERN Stack Task Manager Application

## Complete Setup Guide

### Project Overview
**Taskfyer** is a full-stack task management application built by The Code Dealer using:
- **Frontend:** Next.js 14 (React 18), TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Authentication
- **Features:** User authentication (register/login), email verification, password reset, task CRUD operations, task filtering, radial chart analytics, responsive sidebar navigation

---

## Folder Structure

```
taskfyer/
├── backend/                          # Node.js + Express API Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth/
│   │   │   │   ├── adminController.js      # Admin: delete user, get all users
│   │   │   │   └── userController.js       # Auth: register, login, logout, verify email, forgot/reset/change password
│   │   │   └── task/
│   │   │       └── taskController.js       # Task CRUD: create, read, update, delete, delete all
│   │   ├── db/
│   │   │   └── connect.js                  # MongoDB connection setup
│   │   ├── helpers/
│   │   │   ├── errorhandler.js             # Global error handling middleware
│   │   │   ├── generateToken.js            # JWT token generation
│   │   │   ├── hashToken.js                # SHA256 token hashing
│   │   │   └── sendEmail.js                # Nodemailer email service with Handlebars templates
│   │   ├── middleware/
│   │   │   └── authMiddleware.js           # Protect, admin, creator, verified middleware
│   │   ├── models/
│   │   │   ├── auth/
│   │   │   │   ├── Token.js                # Token model (verification & reset tokens)
│   │   │   │   └── UserModel.js            # User model with bcrypt password hashing
│   │   │   └── tasks/
│   │   │       └── TaskModel.js            # Task model schema
│   │   ├── routes/
│   │   │   ├── tasksRoutes.js              # Task API routes
│   │   │   └── userRoutes.js               # User/Auth API routes
│   │   └── views/
│   │       ├── emailVerification.handlebars # Email verification template
│   │       └── forgotPassword.handlebars    # Password reset email template
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                         # Main server entry point
│   └── .env.example                      # Environment variables template
│
├── client/                               # Next.js Frontend Application
│   ├── app/
│   │   ├── Components/
│   │   │   ├── auth/
│   │   │   │   ├── ChangePasswordForm/
│   │   │   │   │   └── ChangePasswordForm.tsx
│   │   │   │   ├── ForgotPasswordForm/
│   │   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   │   ├── LoginForm/
│   │   │   │   │   └── LoginForm.tsx
│   │   │   │   └── RegisterForm/
│   │   │   │       └── RegisterForm.tsx
│   │   │   ├── Filters/
│   │   │   │   └── Filters.tsx           # Priority filter tabs (All/Low/Medium/High)
│   │   │   ├── Header/
│   │   │   │   └── Header.tsx            # Top header with user greeting
│   │   │   ├── MiniSidebar/
│   │   │   │   └── MiniSidebar.tsx       # Left navigation sidebar
│   │   │   ├── Modal/
│   │   │   │   └── Modal.tsx             # Add/Edit task modal form
│   │   │   ├── Profile/
│   │   │   │   ├── Profile.tsx           # User profile card in sidebar
│   │   │   │   └── ProfileModal.tsx      # Edit profile modal
│   │   │   ├── RadialChart/
│   │   │   │   └── RadialChart.tsx       # Tasks completion chart (Recharts)
│   │   │   ├── Sidebar/
│   │   │   │   └── Sidebar.tsx           # Right sidebar with profile + chart
│   │   │   └── TaskItem/
│   │   │       └── TaskItem.tsx          # Individual task card component
│   │   ├── completed/
│   │   │   └── page.tsx                  # Completed tasks page
│   │   ├── forgot-password/
│   │   │   └── page.tsx                  # Forgot password page
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   ├── overdue/
│   │   │   └── page.tsx                  # Overdue tasks page
│   │   ├── pending/
│   │   │   └── page.tsx                  # Pending tasks page
│   │   ├── register/
│   │   │   └── page.tsx                  # Register page
│   │   ├── reset-password/
│   │   │   └── [resetToken]/
│   │   │       └── page.tsx              # Reset password page
│   │   ├── verify-email/
│   │   │   └── [verificationToken]/
│   │   │       └── page.tsx              # Email verification page
│   │   ├── favicon.ico
│   │   ├── globals.css                   # Global styles + Tailwind directives
│   │   ├── layout.tsx                    # Root layout with providers
│   │   └── page.tsx                      # Home/All tasks page
│   ├── components/
│   │   └── ui/
│   │       ├── card.tsx                  # shadcn/ui Card component
│   │       └── chart.tsx                 # shadcn/ui Chart component
│   ├── context/
│   │   ├── taskContext.js                # Task state management (React Context)
│   │   └── userContext.js                # User/auth state management (React Context)
│   ├── hooks/
│   │   ├── useDetectOutside.tsx          # Click outside detection hook
│   │   └── useUserRedirect.tsx           # Auth redirect hook
│   ├── lib/
│   │   └── utils.ts                      # Tailwind cn() utility
│   ├── providers/
│   │   ├── GTMInitialiser.tsx            # Google Tag Manager initializer
│   │   ├── MainContentLayout.tsx         # Main content wrapper
│   │   ├── MainLayout.tsx                # Layout with modal overlays
│   │   ├── SidebarProvider.tsx           # Sidebar conditional renderer
│   │   └── UserProvider.tsx              # Context providers wrapper
│   ├── public/
│   │   ├── icons/
│   │   │   ├── IconCheck.tsx
│   │   │   ├── IconDeleteAll.tsx
│   │   │   ├── IconFileCheck.tsx
│   │   │   ├── IconGrid.tsx
│   │   │   └── IconStopwatch.tsx
│   │   ├── flurry.png                    # Auth page background
│   │   ├── glass-bg.png                  # Auth page glass effect bg
│   │   ├── logo.png                      # App logo
│   │   ├── next.svg
│   │   └── vercel.svg
│   ├── utils/
│   │   ├── Icons.tsx                     # Font Awesome icon components
│   │   ├── animations.tsx                # Framer Motion variants
│   │   ├── types.ts                      # TypeScript type definitions
│   │   └── utilities.tsx                 # Format time, filter/ overdue tasks
│   ├── components.json                   # shadcn/ui config
│   ├── next.config.mjs                   # Next.js config
│   ├── package.json
│   ├── postcss.config.mjs                # PostCSS config
│   ├── tailwind.config.ts                # Tailwind CSS config
│   └── tsconfig.json                     # TypeScript config
│
└── SETUP_GUIDE.md                        # This file
```

---

## Step-by-Step Installation

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas account** or local MongoDB - [Get free cluster](https://www.mongodb.com/atlas)
- **Outlook email account** (for email verification/password reset features)

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install

# Create .env file from the example
cp .env.example .env

# Edit .env with your credentials
```

#### Backend .env Configuration:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskfyer?retryWrites=true&w=majority
JWT_SECRET=any_random_string_here_minimum_32_characters_long
CLIENT_URL=http://localhost:3000
PORT=8000
USER_EMAIL=your_outlook@outlook.com
EMAIL_PASS=your_outlook_app_password
```

#### Getting MongoDB URI:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Click "Connect" > "Drivers" > "Node.js"
4. Copy the connection string and replace `<password>` with your database password

#### Getting Outlook App Password:
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Enable Two-Factor Authentication
3. Go to "Advanced security options" > "App passwords"
4. Create a new app password and use it in EMAIL_PASS

#### Start the Backend Server:
```bash
npm start
# Server will run on http://localhost:8000
```

---

### 2. Frontend Setup

```bash
# Open a new terminal, navigate to client folder
cd client

# Install all dependencies
npm install

# Start the development server
npm run dev
# App will run on http://localhost:3000
```

---

## Backend API Routes Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/register` | Register new user | No |
| POST | `/api/v1/login` | Login user | No |
| GET | `/api/v1/logout` | Logout user | No |
| GET | `/api/v1/user` | Get current user | Yes |
| PATCH | `/api/v1/user` | Update user profile | Yes |
| GET | `/api/v1/login-status` | Check login status | No |
| POST | `/api/v1/verify-email` | Send verification email | Yes |
| POST | `/api/v1/verify-user/:token` | Verify email | No |
| POST | `/api/v1/forgot-password` | Send reset password email | No |
| POST | `/api/v1/reset-password/:token` | Reset password | No |
| PATCH | `/api/v1/change-password` | Change password | Yes |
| GET | `/api/v1/admin/users` | Get all users (admin/creator only) | Yes |
| DELETE | `/api/v1/admin/users/:id` | Delete user (admin only) | Yes |
| POST | `/api/v1/task/create` | Create new task | Yes |
| GET | `/api/v1/tasks` | Get all user tasks | Yes |
| GET | `/api/v1/task/:id` | Get single task | Yes |
| PATCH | `/api/v1/task/:id` | Update task | Yes |
| DELETE | `/api/v1/task/:id` | Delete task | Yes |

---

## Frontend Routes/Pages

| Route | Description |
|-------|-------------|
| `/` | Home - All Tasks |
| `/completed` | Completed Tasks |
| `/pending` | Pending Tasks |
| `/overdue` | Overdue Tasks |
| `/login` | Login Page |
| `/register` | Register Page |
| `/forgot-password` | Forgot Password |
| `/reset-password/[token]` | Reset Password |
| `/verify-email/[token]` | Verify Email |

---

## Key Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `mongoose` | MongoDB ODM |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT token generation/verification |
| `cookie-parser` | Cookie parsing |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variables |
| `nodemailer` | Email sending |
| `express-handlebars` | Email templates |
| `nodemon` | Auto-restart during development |

### Frontend
| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react` / `react-dom` | UI library |
| `typescript` | Type safety |
| `tailwindcss` | Utility-first CSS |
| `axios` | HTTP requests |
| `framer-motion` | Animations |
| `recharts` | Charts/visualization |
| `react-hot-toast` | Toast notifications |
| `moment` | Date formatting |
| `lucide-react` | Icons |

---

## Important Notes

1. **Server URL in Frontend:** The frontend contexts (`taskContext.js` and `userContext.js`) have the production server URL hardcoded (`https://taskfyer.onrender.com`). **Change this to `http://localhost:8000` for local development.**

2. **SameSite Cookie:** The backend sets cookies with `sameSite: "none"` which requires HTTPS in production. For local development, you may need to adjust this.

3. **Image Domains:** The `next.config.mjs` allows images from `localhost` and `avatars.githubusercontent.com`. Add your image host if using external photos.

4. **Google Tag Manager:** The app includes GTM tracking (ID: GTM-NGW9WFTP). Remove or update in `providers/GTMInitialiser.tsx` if not needed.

---

## Features Implemented

- [x] User Registration & Login with JWT
- [x] Password hashing with bcrypt
- [x] Cookie-based authentication
- [x] Email verification system
- [x] Forgot password / Reset password
- [x] Change password while logged in
- [x] Create, Read, Update, Delete tasks
- [x] Task priority levels (Low, Medium, High)
- [x] Task completion status
- [x] Due date tracking with overdue detection
- [x] Filter tasks by priority
- [x] View tasks by status (All, Completed, Pending, Overdue)
- [x] Radial chart showing completion stats
- [x] User profile management
- [x] Responsive sidebar navigation
- [x] Toast notifications
- [x] Framer Motion animations
- [x] Admin role management

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check your MONGO_URI in .env, ensure IP whitelist includes your address |
| Emails not sending | Verify Outlook credentials, enable app passwords in Microsoft account |
| CORS errors | Ensure CLIENT_URL matches your frontend URL exactly |
| Cookies not persisting | Check sameSite and secure settings in backend |
| 401 Unauthorized | Token may be expired; try logging out and back in |
