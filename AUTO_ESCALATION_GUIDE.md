# Auto-Escalation System Documentation

## Overview

The ResolveIT Smart Grievance Management System now includes an intelligent auto-escalation system that automatically escalates unresolved complaints to higher authorities based on predefined criteria and time thresholds.

## Features

### 🤖 Automated Escalation
- **Scheduled Monitoring**: Runs every hour to check for escalation candidates
- **Smart Detection**: Identifies complaints requiring escalation based on multiple criteria
- **Automatic Assignment**: Routes escalated complaints to available admins or senior officers
- **Audit Trail**: All escalation actions are logged in complaint timeline

### 📊 Escalation Criteria

#### 1. **Unassigned Too Long**
- **Threshold**: 48 hours (2 days)
- **Condition**: Complaint created but never assigned to any officer
- **Action**: Auto-escalate to admin for immediate assignment

#### 2. **Overdue Deadline**
- **Threshold**: 24 hours after deadline
- **Condition**: Assigned complaint past its deadline
- **Action**: Escalate to ensure timely resolution

#### 3. **Stuck in Progress**
- **Threshold**: 72 hours (3 days) without update
- **Condition**: Complaint marked "IN_PROGRESS" but no timeline updates
- **Action**: Escalate to prevent complaints from being forgotten

#### 4. **Urgency-Based Escalation**
- **HIGH Priority**: 24 hours (1 day) unresolved
- **MEDIUM Priority**: 72 hours (3 days) unresolved  
- **LOW Priority**: 120 hours (5 days) unresolved
- **Action**: Escalate based on urgency to ensure SLA compliance

### 🎛️ Admin Control Panel

#### Access the Auto-Escalation Dashboard:
1. Login as Admin
2. Navigate to Admin Dashboard
3. Click "🤖 Auto-Escalation System" button

#### Features Available:
- **Real-time Statistics**: View escalation metrics and trends
- **Escalation Candidates**: See complaints pending auto-escalation
- **Manual Trigger**: Force immediate escalation check
- **Configuration View**: Review current escalation thresholds

### ⚙️ Configuration

Escalation thresholds can be configured in `application.properties`:

```properties
# Auto-Escalation Configuration
app.escalation.unassigned-threshold-hours=48
app.escalation.overdue-threshold-hours=24
app.escalation.stuck-threshold-hours=72
app.escalation.high-urgency-threshold-hours=24
app.escalation.medium-urgency-threshold-hours=72
app.escalation.low-urgency-threshold-hours=120
app.escalation.enable-auto-escalation=true
```

### 📱 Visual Indicators

#### In Complaint Table:
- **🔺 Red Triangle**: Escalated complaint indicator
- **⚠️ Warning Messages**: Time-based escalation warnings
  - "Auto-escalation in ~12h" - Yellow warning
  - "Auto-escalation in ~6h" - Red warning
  - "Auto-escalation pending" - Critical warning

#### Color-Coded Rows:
- **Yellow Background**: Escalated complaints
- **Light Red**: Overdue complaints
- **Light Yellow**: Approaching escalation threshold

### 🔄 Manual vs Automated Escalation

#### Manual Escalation (Admin):
- Immediate escalation with custom reason
- Select specific escalation target
- Set priority level (HIGH/URGENT/CRITICAL)
- Add custom comments

#### Automated Escalation (System):
- Triggered by time thresholds
- Standard escalation reasons
- Auto-assigned to available admins
- System-generated comments with timestamps

### 📈 Statistics Dashboard

Track escalation performance:
- **Total Escalated**: All-time escalation count
- **Last 24 Hours**: Recent escalation activity
- **Last Week**: Weekly escalation trends
- **Pending Escalation**: Complaints awaiting auto-escalation

### 🛠️ API Endpoints

#### For Admin Access:
- `GET /api/auto-escalation/stats` - Escalation statistics
- `GET /api/auto-escalation/candidates` - Escalation candidates
- `POST /api/auto-escalation/trigger` - Manual escalation trigger
- `GET /api/auto-escalation/config` - Configuration details

### 🔐 Security & Access Control

- **Admin Only**: All auto-escalation features require ADMIN role
- **RBAC Protected**: All endpoints secured with Spring Security
- **Audit Logging**: All escalation actions logged for accountability

### ⏰ Scheduling

- **Default Interval**: Every hour (3,600,000 ms)
- **Configurable**: Can be adjusted via `app.escalation.scheduling-interval-ms`
- **Background Processing**: Non-blocking, runs in separate thread
- **Error Handling**: Robust error handling with detailed logging

## Benefits

### 🎯 For Administrators
- **Proactive Management**: Never miss critical complaints
- **Performance Insights**: Track escalation patterns and trends
- **Workload Distribution**: Automatic assignment to available staff
- **SLA Compliance**: Ensure timely resolution of complaints

### 📊 For Organization
- **Customer Satisfaction**: Faster resolution times
- **Process Efficiency**: Reduced manual intervention
- **Quality Assurance**: Consistent escalation standards
- **Transparency**: Complete audit trail of all actions

### 🔧 For System
- **Scalability**: Handles growing complaint volumes
- **Reliability**: Automated monitoring prevents human oversight
- **Flexibility**: Configurable thresholds for different organizations
- **Integration**: Seamless integration with existing workflow

## Usage Examples

### Scenario 1: High Priority Complaint
```
Day 0: High priority complaint submitted
Day 1: Auto-escalation triggered (24h threshold)
Action: Escalated to senior admin with reason "HIGH urgency complaint unresolved for 24+ hours"
```

### Scenario 2: Unassigned Complaint
```
Day 0: Complaint submitted but not assigned
Day 2: Auto-escalation triggered (48h threshold)  
Action: Escalated with reason "Unassigned for 48+ hours"
```

### Scenario 3: Stuck Complaint
```
Day 0: Complaint assigned and marked "IN_PROGRESS"
Day 3: No updates in timeline
Day 6: Auto-escalation triggered (72h threshold)
Action: Escalated with reason "No progress update for 72+ hours"
```

## Future Enhancements

- Email notifications to escalation targets
- SMS alerts for critical escalations
- Machine learning for predictive escalation
- Escalation workload balancing
- Custom escalation rules per department
- Integration with external ticketing systems

---

*This auto-escalation system ensures no complaint falls through the cracks and maintains high service quality standards.*