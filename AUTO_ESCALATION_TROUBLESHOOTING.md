# Auto-Escalation System Troubleshooting Guide

## Issue: AxiosError when accessing auto-escalation endpoints

### Current Error
```
AxiosError
Error testing service: AxiosError
```

### Possible Causes & Solutions

#### 1. Backend Server Not Running
**Problem**: The Spring Boot backend is not running on port 8081
**Solution**: 
- Navigate to `backend` directory
- Run: `mvn spring-boot:run` or `java -jar target/resolveit-backend-1.0.0.jar`
- Verify server starts successfully on port 8081

#### 2. Authentication Issues
**Problem**: User not logged in as ADMIN or JWT token expired
**Solution**:
- Ensure you're logged in with an ADMIN account
- Check browser localStorage for valid JWT token
- Try logging out and back in

#### 3. Missing Auto-Escalation Endpoints
**Problem**: Backend doesn't have the new auto-escalation controller
**Solution**:
- Verify `AutoEscalationController.java` exists in `backend/src/main/java/com/resolveit/controller/`
- Check that `@EnableScheduling` is added to `ResolveItApplication.java`
- Rebuild the project: `mvn clean package`

#### 4. Database Connection Issues
**Problem**: Auto-escalation service can't access database
**Solution**:
- Verify MySQL database is running
- Check database connection in `application.properties`
- Ensure database schema is up to date

### Debugging Steps

1. **Test Connection First**
   - Click "🔗 Test Connection" button in the Auto-Escalation Dashboard
   - This tests basic connectivity without authentication

2. **Check Browser Console**
   ```javascript
   // Open browser dev tools > Console
   // Look for detailed error messages including:
   // - HTTP status codes (403, 404, 500)
   // - Network errors (ECONNREFUSED)
   // - Authentication errors
   ```

3. **Check Backend Logs**
   ```
   // Look for these log messages in backend console:
   === Auto-escalation health check called ===
   === Auto-escalation test endpoint called ===
   === Manual escalation trigger endpoint called ===
   ```

4. **Verify Endpoints**
   Test manually with curl or Postman:
   ```bash
   # Health check (no auth required)
   curl http://localhost:8081/api/auto-escalation/health
   
   # Test endpoint (requires ADMIN auth)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8081/api/auto-escalation/test
   ```

### Expected Behavior

When working correctly:
- ✅ "🔗 Test Connection" should show "Connection successful"
- ✅ "🔍 Test Service" should show escalation statistics
- ✅ Dashboard should load statistics, candidates, and configuration
- ✅ Manual escalation trigger should work without errors

### Current Implementation Status

#### ✅ Completed Components:
- AutoEscalationController.java with all endpoints
- AutoEscalationService.java with scheduling logic
- AutoEscalationDashboard.js frontend component
- Enhanced API service with escalation methods
- Comprehensive error handling and logging

#### 🔍 Troubleshooting Features Added:
- Health check endpoint (`/api/auto-escalation/health`)
- Enhanced error messages with specific status codes
- Connection test functionality
- Detailed console logging
- Step-by-step testing approach

### Next Steps

1. **Start Backend Server**: Ensure Spring Boot app is running
2. **Test Connection**: Use the "Test Connection" button
3. **Check Authentication**: Verify you're logged in as ADMIN
4. **Test Service**: Use the "Test Service" button
5. **Review Logs**: Check both frontend console and backend logs

If issues persist, check that all auto-escalation files are properly saved and the project has been rebuilt with `mvn clean package`.