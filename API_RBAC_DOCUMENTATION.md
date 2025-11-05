# ResolveIT Smart RBAC API Documentation

## Role-Based Access Control (RBAC) Implementation

This document describes the role-based access control system implemented in the ResolveIT Smart Grievance and Feedback Management System.

### Roles

The system supports three main roles:

1. **USER** - Regular users who can submit complaints
2. **OFFICER** - Officers who handle and process complaints
3. **ADMIN** - Administrators with full system access

### Role Permissions Matrix

| Feature | USER | OFFICER | ADMIN |
|---------|------|---------|-------|
| Submit Complaint | ✅ | ❌ | ❌ |
| Edit / Withdraw Complaint | ✅ (own only) | ❌ | ✅ (any) |
| Assign Complaint | ❌ | ✅ (to officers) | ✅ (to officers) |
| Unassign Complaint | ❌ | ❌ | ✅ |
| Set / Update Deadline | ❌ | ✅ (assigned) | ✅ (any) |
| Mark Completed | ❌ | ✅ | ❌ |
| Mark Resolved (Final) | ❌ | ❌ | ✅ |
| View Public Updates | ✅ | ✅ | ✅ |
| Access Internal Notes | ❌ | ✅ | ✅ |

### API Endpoints

#### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/signup/officer (ADMIN only)
POST /api/auth/signup/admin (ADMIN only)
```

#### Complaint Management Endpoints

```http
# Submission (No auth required for anonymous)
POST /api/complaints/submit/anonymous
POST /api/complaints/submit (USER only)

# Complaint Management
PUT /api/complaints/edit/{id} (USER own complaints, ADMIN any)
PUT /api/complaints/assign/{id} (OFFICER, ADMIN)
PUT /api/complaints/unassign/{id} (ADMIN only)
PUT /api/complaints/deadline/{id} (OFFICER assigned, ADMIN any)
PUT /api/complaints/complete/{id} (OFFICER only)
PUT /api/complaints/resolve/{id} (ADMIN only)

# Information Retrieval
GET /api/complaints/public (All users)
GET /api/complaints/my (USER)
GET /api/complaints/assigned (OFFICER)
GET /api/complaints/admin/all (ADMIN)
GET /api/complaints/{id} (Authenticated users)
GET /api/complaints/{id}/timeline (Public timeline for all, internal for OFFICER/ADMIN)
GET /api/complaints/filter (OFFICER, ADMIN)

# Internal Notes
POST /api/complaints/notes/{id} (OFFICER, ADMIN)
GET /api/complaints/notes/{id} (OFFICER, ADMIN)
```

### Implementation Details

#### Security Annotations

The system uses Spring Security's `@PreAuthorize` annotations for method-level security:

```java
@PreAuthorize("hasAuthority('ADMIN')")
@PreAuthorize("hasAuthority('OFFICER') or hasAuthority('ADMIN')")
@PreAuthorize("hasAuthority('USER')")
```

#### Role Validation

- **Ownership Validation**: Users can only edit their own complaints
- **Assignment Validation**: Officers can only assign to other officers
- **Deadline Management**: Officers can only update deadlines for assigned complaints
- **Status Management**: Proper workflow enforcement based on roles

#### Complaint Status Flow

```
NEW → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → COMPLETED → RESOLVED → CLOSED
                                    ↓
                                ESCALATED
```

### Security Features

1. **JWT Token Authentication**: All endpoints (except anonymous submission) require valid JWT tokens
2. **Role-based Authorization**: Each endpoint validates user roles before execution
3. **Ownership Checks**: Additional validation for user-specific resources
4. **Input Validation**: Request validation using Jakarta validation annotations
5. **Cross-Origin Resource Sharing**: Configured CORS for frontend integration

### Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input or business rule violations
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions for the requested operation
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

### Usage Examples

#### User Registration
```json
POST /api/auth/signup
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "roles": ["USER"]
}
```

#### Submit Complaint (Authenticated User)
```json
POST /api/complaints/submit
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

category=Technical
description=System login issue
urgency=High
anonymous=false
file=<optional-file>
```

#### Assign Complaint (Officer/Admin)
```json
PUT /api/complaints/assign/123
Authorization: Bearer <jwt-token>
{
    "assignToUserId": 456,
    "deadline": "2024-12-31T23:59:59",
    "comment": "Assigning to technical team"
}
```

### Database Schema

The system uses the following key entities:
- `users`: User information with roles
- `complaints`: Complaint details with status and assignments
- `complaint_timeline`: Audit trail of complaint changes
- `user_roles`: User role mappings

### Future Enhancements

1. **Role Hierarchy**: Implement hierarchical permissions
2. **Department-based Access**: Add department-level access controls
3. **Dynamic Permissions**: Runtime permission modifications
4. **Audit Logging**: Enhanced logging for security events
5. **Multi-tenancy**: Support for multiple organizations