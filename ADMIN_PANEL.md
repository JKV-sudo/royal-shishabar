# Admin Panel Documentation

## Overview

The Royal Shisha Bar Admin Panel provides comprehensive administrative tools for managing the application. It's accessible only to users with admin privileges.

## Access

- **URL**: `/admin`
- **Access Control**: Requires admin role
- **Navigation**: Available in user menu for admin users

## Features

### 1. Dashboard
- **Real-time Statistics**: View total users, active events, revenue, and growth metrics
- **Recent Activity**: Monitor user registrations, event creations, and payments
- **Quick Actions**: Direct access to common admin tasks

### 2. Event Management
- **Event List**: View all events with status, attendees, and actions
- **Event Actions**:
  - Toggle event active/inactive status
  - Edit event details
  - Delete events
  - Create new events
- **Bulk Operations**: Update multiple events simultaneously

### 3. User Management
- **User List**: View all registered users with roles and status
- **User Actions**:
  - Update user roles (customer, staff, admin)
  - Toggle user active/inactive status
  - Delete users
  - View user activity
- **Role Management**: Promote/demote users between roles

### 4. Analytics & Reports
- **Revenue Analytics**: Track monthly revenue and growth
- **User Analytics**: Monitor user engagement and growth
- **System Metrics**: View performance and usage statistics

### 5. System Settings
- **General Settings**:
  - Site name and contact information
  - File upload limits
  - Allowed file types
- **Security Settings**:
  - Two-factor authentication
  - Email notifications
  - Maintenance mode
- **System Health**: Monitor database, storage, and API status

## Technical Implementation

### Components
- `src/pages/Admin.tsx` - Main admin panel component
- `src/services/adminService.ts` - Admin-specific API calls
- `src/components/auth/ProtectedRoute.tsx` - Access control

### Security
- Role-based access control (RBAC)
- Admin-only route protection
- Secure API endpoints
- Input validation and sanitization

### Data Management
- Real-time Firestore integration
- Batch operations for efficiency
- Error handling and logging
- Data export capabilities

## Usage Examples

### Promoting a User to Admin
```typescript
import { AdminService } from '../services/adminService';

// Promote user to admin role
await AdminService.updateUserRole(userId, 'admin');
```

### Getting Admin Statistics
```typescript
import { AdminService } from '../services/adminService';

// Get comprehensive admin stats
const stats = await AdminService.getAdminStats();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Active Events: ${stats.activeEvents}`);
```

### Bulk Event Updates
```typescript
import { AdminService } from '../services/adminService';

// Update multiple events
const updates = [
  { id: 'event1', updates: { isActive: false } },
  { id: 'event2', updates: { price: 25 } }
];
await AdminService.bulkUpdateEvents(updates);
```

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Custom date ranges, export reports
- **User Activity Tracking**: Detailed user behavior analytics
- **Content Management**: Rich text editor for event descriptions
- **Notification System**: Admin alerts and notifications
- **Backup & Restore**: Automated data backup and recovery
- **API Management**: Monitor and manage external integrations

### Performance Optimizations
- **Caching**: Implement Redis for frequently accessed data
- **Pagination**: Large dataset handling
- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Admin panel functionality without internet

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Ensure user has admin role
   - Check authentication status
   - Verify route protection

2. **Data Loading Issues**
   - Check Firestore permissions
   - Verify collection structure
   - Review error logs

3. **Performance Issues**
   - Implement pagination for large datasets
   - Use batch operations for bulk updates
   - Optimize database queries

### Support
For technical support or feature requests, contact the development team or create an issue in the project repository. 