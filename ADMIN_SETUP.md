# Admin Setup Guide

## Setting Up Admin Roles

The event planner system requires admin privileges to create, edit, and manage events. Here's how to set up admin roles:

### Method 1: Direct Firestore Update (Recommended for initial setup)

1. **Access Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Navigate to Firestore Database

2. **Find User Document**
   - Go to the `users` collection
   - Find the document for the user you want to make an admin
   - The document ID should match the user's Firebase Auth UID

3. **Update User Role**
   - Edit the user document
   - Change the `role` field from `"customer"` to `"admin"`
   - Save the changes

### Method 2: Using the Admin Service (Programmatic)

You can also use the `AdminService` class to promote users programmatically:

```typescript
import { AdminService } from './src/services/adminService';

// Promote a user to admin (requires an existing admin to do this)
await AdminService.promoteToAdmin(userId, adminUserId);
```

## Event Planner Features

### For Admins:
- **Create Events**: Click "Create Event" button to add new events
- **Edit Events**: Click the edit icon on any event card
- **Manage Events**: Toggle event status (active/inactive) and delete events
- **View Statistics**: See total events, active events, upcoming events, and total attendees

### For All Users:
- **Browse Events**: View all active events with filtering options
- **Join Events**: Click "Join Event" to attend events
- **Search & Filter**: Use the search bar and filters to find specific events
- **View Details**: See event information including date, time, location, price, and capacity

## Event Categories

The system includes predefined categories:
- Live Music
- DJ Night
- Special Event
- Holiday Celebration
- Themed Night
- VIP Event
- Food & Drinks
- Other

## Event Fields

Each event can include:
- **Title** (required): Event name
- **Description** (required): Event details
- **Date** (required): Event date
- **Time** (required): Event time
- **Location** (required): Event venue
- **Image URL** (optional): Event image
- **Category** (optional): Event category
- **Price** (optional): Event cost
- **Capacity** (optional): Maximum attendees
- **Tags** (optional): Custom tags for filtering

## Security Rules

Make sure your Firestore security rules allow:
- Read access to events for all authenticated users
- Write access to events for admin users only
- Read/write access to user documents for the user themselves

Example Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events: read for all, write for admins only
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Testing the System

1. **Create a Test Event**:
   - Log in as an admin user
   - Navigate to the Events page
   - Click "Create Event"
   - Fill in the required fields
   - Save the event

2. **Test User Features**:
   - Log in as a regular user
   - Browse events
   - Try joining/leaving events
   - Use search and filters

3. **Test Admin Features**:
   - Edit an existing event
   - Toggle event status
   - Delete an event
   - View event statistics

## Troubleshooting

### Common Issues:

1. **"Only admins can create events" error**:
   - Check that the user's role is set to "admin" in Firestore
   - Verify the user is properly authenticated

2. **Events not loading**:
   - Check Firestore security rules
   - Verify the events collection exists
   - Check browser console for errors

3. **Date formatting issues**:
   - Ensure the `date-fns` package is installed
   - Check that dates are properly formatted in the database

### Getting Help:

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Check Firestore security rules
4. Ensure all required packages are installed 