# ResolveIT - Smart Grievance and Feedback Management System

## Overview
ResolveIT is a full-stack web application for managing institutional grievances and complaints. It provides a transparent and efficient platform for users to submit, track, and manage complaints either anonymously or via verified login, while admins can review, resolve, or escalate them.

## Project Architecture

### Tech Stack
- **Frontend**: React with Axios and React Router
- **Backend**: Spring Boot (RESTful APIs, Spring Security, JPA/Hibernate)
- **Database**: MySQL
- **Build Tools**: Maven (backend), npm (frontend)

### Directory Structure
```
.
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/resolveit/
│   │   ├── config/            # Security & JWT configuration
│   │   ├── controller/        # REST controllers
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # JPA repositories
│   │   ├── service/           # Business logic
│   │   └── dto/               # Data transfer objects
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml               # Maven dependencies
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   ├── context/          # Auth context
│   │   └── pages/            # Page components
│   └── package.json
└── uploads/                   # File upload directory
```

## Features
- User authentication with JWT (Spring Security)
- Anonymous and verified complaint submission
- Role-based access control (User/Admin)
- Complaint tracking with status updates
- File upload support for evidence
- Admin dashboard with filters and status management
- Real-time complaint tracking

## Recent Changes
- Initial project structure created (October 22, 2025)

## Running Locally
1. Backend: Navigate to `backend/` and run `mvn spring-boot:run`
2. Frontend: Navigate to `frontend/` and run `npm start`
3. Database: Ensure MySQL server is running on port 3306

## User Preferences
- Project intended for local development
- MySQL database required (not PostgreSQL)
- Strict adherence to Spring Boot + React + MySQL stack
