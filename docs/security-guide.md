# Security Guide

This document outlines the security measures and best practices implemented in cn-registry.

## Authentication & Authorization

### Authentication System
- **Provider**: Better Auth (session-based)
- **Session Storage**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in CSRF token validation
- **Configuration**: `apps/server/src/lib/auth.ts`

### User Roles
Three distinct roles with increasing privileges:

1. **User** (`user`)
   - Browse components and tools
   - Star and comment on items
   - Create projects (private)

2. **Creator** (`creator`)  
   - All user privileges
   - Create and edit own components/tools
   - Suggest new items for review
   - Manage own profile

3. **Admin** (`admin`)
   - All creator privileges
   - Access admin panel (`/admin/*`)
   - Manage all components, tools, users
   - System-wide configuration

### Role Assignment
```bash
# Promote user to admin
bun scripts/make-admin.ts user@example.com

# Via admin panel (admin users only)
/admin/users -> Update Role
```

## Access Control Implementation

### Frontend Protection

#### Route-Level Protection
- **Admin Routes**: `apps/web/src/app/admin/layout.tsx`
  - Session validation on mount
  - Auto-redirect non-admin users
  - Loading states during auth check

```tsx
// Admin layout protection
useEffect(() => {
  if (!sessionLoading && (!session?.user || session.user.role !== "admin")) {
    toast.error("Admin access required");
    router.push("/");
  }
}, [session, sessionLoading, router]);
```

#### Component-Level Protection
- **Project Editing**: Role-based access control
- **Profile Management**: User-specific access
- **Content Creation**: Creator+ role required

### Backend Protection

#### tRPC Procedures
Three security levels available:

```typescript
// Public access
publicProcedure

// Requires authentication  
protectedProcedure

// Requires admin role
adminProcedure
```

#### Context-Based Security
Authentication context provides:
- `ctx.session` - Current session data
- `ctx.user` - Authenticated user (in protected procedures)
- Automatic role verification

## Security Best Practices

### Data Validation
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Drizzle ORM with prepared statements
- **XSS Prevention**: React's built-in escaping + Content Security Policy

### Environment Security
- **Secrets Management**: Environment variables only
- **Database Credentials**: Secure connection strings
- **API Keys**: Never committed to repository

### Session Security
- **HttpOnly Cookies**: Prevent XSS access
- **Secure Transmission**: HTTPS in production
- **Session Expiration**: Configurable timeouts
- **CSRF Tokens**: Automatic protection

## Admin Panel Security

### Access Verification
All admin pages implement double protection:

1. **Frontend Check**: Layout-level role verification
2. **Backend Check**: `adminProcedure` on all endpoints

### Sensitive Operations
Admin actions require additional verification:
- User role changes
- Account suspension
- System configuration
- Data deletion

### Audit Trail
Admin actions are logged for accountability:
- User management changes
- Content modifications
- System configuration updates

## Data Protection

### User Data
- **Profile Information**: User-controlled privacy
- **Email Privacy**: Not exposed in public APIs  
- **Secure Updates**: Authenticated modification only

### Content Security
- **Creator Ownership**: Users can only edit own content
- **Admin Override**: Admins can moderate any content
- **Soft Deletion**: Preserve data integrity

### Database Security
- **Access Control**: Role-based database permissions
- **Connection Security**: Encrypted connections
- **Backup Security**: Encrypted backups

## Security Headers

### Content Security Policy
```typescript
// Recommended CSP headers
'Content-Security-Policy': `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
`
```

### Additional Headers
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing
- **Referrer-Policy**: Control referrer information
- **Permissions-Policy**: Restrict browser features

## Vulnerability Prevention

### Common Attack Vectors

#### SQL Injection
- **Prevention**: Drizzle ORM with parameterized queries
- **Validation**: Zod schema validation on all inputs

#### XSS (Cross-Site Scripting)
- **Prevention**: React's automatic escaping
- **Validation**: Sanitize user-generated content
- **CSP Headers**: Restrict script execution

#### CSRF (Cross-Site Request Forgery)
- **Prevention**: Better Auth's built-in CSRF protection
- **Tokens**: Automatic token validation

#### Authentication Bypass
- **Prevention**: Multi-layer access checks
- **Session Validation**: Consistent session verification
- **Role Verification**: Context-aware authorization

### Security Monitoring

#### Error Handling
- **Generic Messages**: Don't expose system details
- **Logging**: Secure logging without sensitive data
- **Rate Limiting**: Prevent abuse and DoS

#### Audit Logging
- **Admin Actions**: Track all administrative changes
- **Authentication Events**: Log login/logout attempts
- **Data Changes**: Track content modifications

## Incident Response

### Security Issues
1. **Immediate**: Disable affected functionality
2. **Assessment**: Evaluate scope and impact
3. **Mitigation**: Apply security patches
4. **Communication**: Notify affected users
5. **Prevention**: Update security measures

### Reporting
- **Internal**: Security team notification
- **External**: Responsible disclosure process
- **Users**: Transparent communication when appropriate

## Security Checklist

### Before Deployment
- [ ] All environment variables secured
- [ ] Security headers configured
- [ ] Admin access properly restricted
- [ ] Authentication flows tested
- [ ] Input validation comprehensive
- [ ] Database access restricted
- [ ] Error handling secure
- [ ] Audit logging enabled

### Regular Maintenance
- [ ] Security dependency updates
- [ ] Access control review
- [ ] Audit log analysis
- [ ] Session management review
- [ ] Security header validation
- [ ] Vulnerability scanning