# ResolveIT - Smart Grievance and Feedback Management System

ResolveIT is a full-stack web application designed to improve transparency and efficiency in handling institutional grievances. It provides a platform for users to submit, track, and manage complaints either anonymously or via verified login, while administrators can review, resolve, or escalate them.

## 🎯 Features

- **User Authentication**: JWT-based authentication with Spring Security
- **Role-Based Access Control**: Separate functionalities for Users and Admins
- **Anonymous Complaints**: Submit complaints without creating an account
- **Verified Complaints**: Track complaints with user accounts
- **File Upload**: Support for attaching evidence (images/documents)
- **Real-time Tracking**: Monitor complaint status (Pending → In Progress → Resolved)
- **Admin Dashboard**: Comprehensive complaint management with filters
- **Comments System**: Admins can add comments to complaints

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.1.5**: RESTful API framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database ORM
- **Hibernate**: Object-relational mapping
- **JWT (jjwt 0.11.5)**: Token-based authentication
- **MySQL 8.0+**: Relational database
- **Maven**: Build and dependency management

### Frontend
- **React 18.2**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **CSS3**: Styling

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Java Development Kit (JDK) 17** or higher
- **Maven 3.6+** for building the backend
- **Node.js 16+** and npm for the frontend
- **MySQL 8.0+** database server

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resolveit
```

### 2. Database Setup

1. Start your MySQL server
2. Run the database schema script:

```bash
mysql -u root -p < database_schema.sql
```

This creates:
- `resolveit_db` database
- Required tables (users, user_roles, complaints, complaint_comments)
- Sample users:
  - **Admin**: username: `admin`, password: `admin123`
  - **User**: username: `testuser`, password: `user123`

3. Update database credentials in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resolveit_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Build the project:

```bash
mvn clean install
```

3. Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### 4. Frontend Setup

1. Navigate to the frontend directory (in a new terminal):

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will open automatically at `http://localhost:3000`

## 📁 Project Structure

```
resolveit/
├── backend/                          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/resolveit/
│   │   │   │   ├── config/          # Security & CORS configuration
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── repository/      # Data access layer
│   │   │   │   ├── security/        # JWT & authentication
│   │   │   │   └── service/         # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   └── pom.xml                      # Maven dependencies
├── frontend/                         # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── context/                 # Auth context
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API service layer
│   │   ├── App.js                   # Main app component
│   │   └── index.js                 # Entry point
│   └── package.json                 # npm dependencies
├── uploads/                          # File upload directory
├── database_schema.sql              # MySQL schema
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Complaints (Anonymous)
- `POST /api/complaints/anonymous` - Submit anonymous complaint

### Complaints (Authenticated)
- `POST /api/complaints` - Submit complaint (requires auth)
- `GET /api/complaints/my` - Get user's complaints (requires auth)

### Admin Endpoints
- `GET /api/complaints/admin/all` - Get all complaints
- `GET /api/complaints/admin/{id}` - Get complaint by ID
- `PUT /api/complaints/admin/{id}/status` - Update complaint status
- `POST /api/complaints/admin/{id}/comment` - Add comment
- `GET /api/complaints/admin/filter` - Filter complaints

## 👤 User Roles

### User Role
- Submit complaints (anonymous or verified)
- Track own complaints
- View complaint status and admin comments

### Admin Role
- View all complaints
- Filter complaints by status, category, urgency
- Update complaint status
- Add comments to complaints
- Access full complaint history

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **Role-Based Access**: Method-level security with Spring Security
- **CORS Configuration**: Configured for frontend-backend communication
- **File Upload Validation**: Max 10MB file size limit

## 📝 Usage

### For Users

1. **Create Account**: Sign up with username, email, and password
2. **Submit Complaint**: Fill out the complaint form with category, description, and urgency
3. **Track Complaints**: View status updates in "My Complaints"
4. **Anonymous Option**: Submit without login (cannot track later)

### For Admins

1. **Login**: Use admin credentials
2. **View Dashboard**: See all complaints with filters
3. **Update Status**: Change complaint status to Pending/In Progress/Resolved
4. **Add Comments**: Provide updates to users
5. **Filter & Search**: Find specific complaints by status, category, or urgency

## 🧪 Testing

### Default Test Accounts

**Admin Account**
- Username: `admin`
- Password: `admin123`
- Role: ADMIN

**User Account**
- Username: `testuser`
- Password: `user123`
- Role: USER

## 🎨 Customization

### Adding New Categories

Edit the category options in:
- `frontend/src/pages/AnonymousComplaint.js`
- `frontend/src/pages/SubmitComplaint.js`
- `frontend/src/pages/AdminDashboard.js`

### Changing JWT Secret

Update in `backend/src/main/resources/application.properties`:

```properties
jwt.secret=your-new-secret-key-here
jwt.expiration=86400000
```

## 🐛 Troubleshooting

### Backend won't start
- Verify MySQL is running
- Check database credentials in `application.properties`
- Ensure port 8080 is available

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check CORS settings in `SecurityConfig.java`
- Ensure proxy is set in `frontend/package.json`

### File upload fails
- Check `uploads/` directory exists and is writable
- Verify file size is under 10MB
- Check `file.upload-dir` in `application.properties`

## 📄 License

This project is created for educational purposes.

## 👥 Contributors

ResolveIT Development Team

## 📞 Support

For issues and questions, please create an issue in the repository.
