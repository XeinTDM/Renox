# Permissions System Documentation

## Overview

The Renox cheat loader now includes a comprehensive role-based permissions system that allows cheat developers and resellers to manage their distribution platform with different levels of access control.

## User Roles

### 1. User (Default)
- **Description**: Standard end-user with basic access
- **Permissions**:
  - `cheat:view` - Can view available cheats
  - `cheat:launch` - Can launch cheats
  - `license:view` - Can view own licenses
  - `license:add` - Can add licenses to account

### 2. Reseller
- **Description**: Reseller with management capabilities
- **Permissions**:
  - All User permissions
  - `cheat:manage` - Can manage cheat status and settings
  - `user:view` - Can view user accounts
  - `license:manage` - Can create and manage licenses
  - `sales:view` - Can view sales data

### 3. Developer
- **Description**: Cheat developer with full cheat management
- **Permissions**:
  - All Reseller permissions
  - `cheat:create` - Can create new cheats
  - `cheat:delete` - Can delete cheats
  - `reseller:manage` - Can manage reseller accounts
  - `system:settings` - Can modify system settings

### 4. Admin
- **Description**: Full system administrator
- **Permissions**: All available permissions

## Permission Structure

Each permission follows the format: `resource:action`

### Resources
- `cheat` - Cheat management
- `license` - License management
- `user` - User management
- `role` - Role management
- `system` - System administration
- `sales` - Sales and analytics

### Actions
- `view` - Read access
- `create` - Create new items
- `manage` - Full management access
- `delete` - Delete items
- `add` - Add items
- `admin` - Administrative access
- `settings` - Settings management

## Implementation Details

### Files Structure

```
src/lib/
├── types/
│   └── permissions.ts          # Permission definitions and types
├── stores/
│   ├── userStore.ts           # Enhanced user store with permissions
│   └── managementStore.ts     # Admin management data
├── components/
│   └── PermissionGuard.svelte # Permission-based component rendering
└── utils/
    └── routeGuard.ts          # Route protection utilities
```

### Key Components

#### PermissionGuard Component
```svelte
<PermissionGuard permission="cheat:manage">
  <Button>Manage Cheats</Button>
</PermissionGuard>
```

#### Route Protection
```typescript
import { protectRoute } from '$lib/utils/routeGuard';

// Protect admin routes
protectRoute({
  permission: 'system:admin',
  redirectTo: '/',
  message: 'Admin access required'
});
```

#### User Store Integration
```typescript
import { user } from '$lib/stores/userStore';

// Check permissions
if (user.hasPermission('cheat:manage')) {
  // User can manage cheats
}
```

## Admin Features

### Admin Dashboard (`/admin`)
- **Overview**: System statistics and quick actions
- **User Management**: Manage user accounts and roles
- **Cheat Management**: Add, edit, and configure cheats
- **License Management**: Generate and manage licenses
- **Role Management**: View and manage user roles
- **System Settings**: Configure platform settings

### Management Capabilities

#### For Resellers:
- View user accounts
- Manage cheat status
- Generate licenses
- View sales analytics

#### For Developers:
- All reseller capabilities
- Create and delete cheats
- Manage reseller accounts
- Configure system settings

#### For Admins:
- Full system access
- Manage all users and roles
- Complete system administration

## Security Features

### Permission Validation
- All routes and components check permissions before rendering
- Automatic redirection for unauthorized access
- Toast notifications for access denied scenarios

### Role-Based UI
- Navigation items show/hide based on user role
- Admin panel only visible to authorized users
- Contextual actions based on permissions

### Data Protection
- User data includes permission information
- License validation includes permission checks
- System settings protected by role requirements

## Usage Examples

### Adding Permission Checks to Components
```svelte
<script>
  import { PermissionGuard } from '$lib/components';
</script>

<PermissionGuard permission="cheat:manage">
  <div>Admin-only content</div>
</PermissionGuard>
```

### Protecting Routes
```typescript
// In page load function
import { protectRoute } from '$lib/utils/routeGuard';

export function load() {
  protectRoute({
    permission: 'user:manage',
    redirectTo: '/'
  });
}
```

### Checking Permissions in Scripts
```typescript
import { user } from '$lib/stores/userStore';

$: canManageCheats = user.hasPermission('cheat:manage');
$: isAdmin = user.permissions.role === 'admin';
```

## Development Notes

### Adding New Permissions
1. Add permission to `PERMISSIONS` object in `permissions.ts`
2. Update role definitions in `ROLES` object
3. Use permission in components with `PermissionGuard`
4. Add route protection where needed

### Testing Permissions
- Development mode automatically assigns admin role
- Use different user accounts to test role restrictions
- Check permission guards render correctly
- Verify route protection works as expected

## Future Enhancements

- **Permission Groups**: Group related permissions
- **Custom Roles**: Allow admins to create custom roles
- **Permission Inheritance**: Hierarchical permission system
- **Audit Logging**: Track permission usage and changes
- **Temporary Permissions**: Time-limited permission grants
- **Permission Analytics**: Usage statistics and insights
