# ResolveIT - Smart Grievance and Feedback Management System

## Overview
ResolveIT is a complete, production-ready full-stack web application for managing institutional grievances and complaints. It provides a transparent and efficient platform for users to submit, track, and manage complaints either anonymously or via verified login, while admins can review, resolve, or escalate them.

## Project Status
✅ **COMPLETE** - All features implemented and ready for local deployment (October 22, 2025)

## Project Architecture

### Tech Stack
- **Frontend**: React 18.2 with Axios and React Router
- **Backend**: Spring Boot 3.1.5 (RESTful APIs, Spring Security, JPA/Hibernate)
- **Database**: MySQL 8.0+
- **Build Tools**: Maven (backend), npm (frontend)

### Directory Structure
```
.
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/resolveit/
│   │   ├── config/            # Security & JWT configuration
│   │   ├── controller/        # REST controllers
│   │   ├── entity/            # JPA entities (User, Complaint)
│   │   ├── repository/        # JPA repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # JWT utils, filters, UserDetails
│   │   └── dto/               # Data transfer objects
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml               # Maven dependencies
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar)
│   │   ├── services/         # API service layer (Axios)
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Page components (Home, Login, Signup, etc.)
│   │   ├── App.js            # Main app with routing
│   │   └── index.js          # Entry point
│   └── package.json
├── uploads/                   # File upload directory
├── database_schema.sql       # MySQL database schema
├── README.md                 # Complete setup guide
├── SETUP_INSTRUCTIONS.md     # Quick start guide
├── PROJECT_SUMMARY.md        # Feature overview
└── REPLIT_NOTE.md           # Replit limitations
```

## Features Implemented

### Authentication & Security
- ✅ JWT token-based authentication with Spring Security
- ✅ BCrypt password hashing
- ✅ Role-based access control (USER/ADMIN)
- ✅ Protected API endpoints
- ✅ CORS configuration

### Complaint Management
- ✅ Anonymous complaint submission (no account required)
- ✅ Verified complaint submission (with tracking)
- ✅ File upload support (images/documents, max 10MB)
- ✅ Status tracking: PENDING → IN_PROGRESS → RESOLVED
- ✅ Category-based classification
- ✅ Urgency levels (LOW, MEDIUM, HIGH)

### User Features
- ✅ User registration and login
- ✅ Submit complaints (anonymous or verified)
- ✅ Track own complaints
- ✅ View status updates
- ✅ See admin comments

### Admin Features
- ✅ Admin dashboard with complete complaint list
- ✅ Filter by status, category, and urgency
- ✅ Update complaint status
- ✅ Add comments to complaints
- ✅ View all complaint details
- ✅ Comprehensive complaint management

## Running Locally

### Prerequisites
- JDK 17 or higher
- Maven 3.6+
- Node.js 16+
- MySQL 8.0+

### Quick Start
1. **Database**: `mysql -u root -p < database_schema.sql`
2. **Backend**: `cd backend && mvn spring-boot:run` (runs on port 8080)
3. **Frontend**: `cd frontend && npm install && npm start` (runs on port 3000)

### Default Test Accounts
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `testuser`, password: `user123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Complaints (Anonymous)
- `POST /api/complaints/anonymous` - Submit anonymous complaint

### Complaints (Authenticated)
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints/my` - Get user's complaints

### Admin Endpoints
- `GET /api/complaints/admin/all` - Get all complaints
- `GET /api/complaints/admin/{id}` - Get complaint by ID
- `PUT /api/complaints/admin/{id}/status` - Update status
- `POST /api/complaints/admin/{id}/comment` - Add comment
- `GET /api/complaints/admin/filter` - Filter complaints

## Important Notes

### Replit Limitations
⚠️ This project **cannot run on Replit** because:
- Spring Boot/Java backend requires JDK 17+ (not available)
- MySQL database is required (Replit only has PostgreSQL)
- Project is specifically designed for local development

### User Preferences
- Project intended for **local development only**
- MySQL database required (not PostgreSQL)
- Strict adherence to Spring Boot + React + MySQL stack

## Documentation
- `README.md` - Comprehensive setup and usage guide
- `SETUP_INSTRUCTIONS.md` - Quick setup reference
- `PROJECT_SUMMARY.md` - Complete feature list
- `REPLIT_NOTE.md` - Why this runs locally
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
- `database_schema.sql` - Database setup script

## Recent Changes
- October 22, 2025: Complete project implementation
  - Spring Boot backend with JWT authentication
  - React frontend with all pages and components
  - MySQL database schema with sample data
  - Complete REST API implementation
  - Admin and user dashboards
  - File upload functionality
  - Comprehensive documentation
