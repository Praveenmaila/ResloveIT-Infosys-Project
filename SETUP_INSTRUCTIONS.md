# Quick Setup Instructions

## Important Note
This application is designed to run **locally on your machine**, not on Replit, because:
- Spring Boot/Java development requires JDK 17+
- MySQL database is required (not available on Replit)
- The project uses Maven for build management

## Quick Start (Local Machine)

### Step 1: Database Setup
```bash
# Start MySQL server on your machine
# Run the database schema
mysql -u root -p < database_schema.sql
```

### Step 2: Update Database Credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3: Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will run on http://localhost:8080

### Step 4: Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend will run on http://localhost:3000

### Step 5: Test the Application
Login with default admin credentials:
- Username: `admin`
- Password: `admin123`

## Project Features Checklist
- ✅ JWT Authentication with Spring Security
- ✅ Role-based access control (USER/ADMIN)
- ✅ Anonymous complaint submission
- ✅ Verified user complaint submission with tracking
- ✅ File upload support (MultipartFile)
- ✅ Admin dashboard with filters
- ✅ Complaint status management (PENDING → IN_PROGRESS → RESOLVED)
- ✅ Comments system for admins
- ✅ MySQL database integration with JPA/Hibernate
- ✅ React frontend with React Router
- ✅ Axios API service layer
- ✅ Authentication context for state management

## File Structure Overview
```
backend/
  - Spring Boot REST API
  - JWT security
  - MySQL database
  - File upload handling

frontend/
  - React application
  - Component-based architecture
  - Protected routes
  - API integration

database_schema.sql
  - MySQL database schema
  - Sample users
```

## API Testing with Postman/curl

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Submit Anonymous Complaint
```bash
curl -X POST http://localhost:8080/api/complaints/anonymous \
  -F "category=Infrastructure" \
  -F "description=Test complaint" \
  -F "urgency=HIGH"
```

## Troubleshooting
- Ensure MySQL is running before starting backend
- Verify JDK 17+ is installed: `java -version`
- Check Maven is installed: `mvn -version`
- Check Node.js is installed: `node -version`
