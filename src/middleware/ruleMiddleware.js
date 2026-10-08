// module.exports = (allowedRoles = []) => (req, res, next) => {
//   if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
//   if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
//   next()
// }

// middlewares/roleMiddleware.js

/**
 * Role-based Authorization Middleware
 * Checks if authenticated user has required role
 * Must be used AFTER authMiddleware
 * 
 * @param {Array<string>} allowedRoles - Array of allowed roles (e.g., ["ADMIN", "MANAGER"])
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/admin-only', authMiddleware, roleMiddleware(["ADMIN"]), handler)
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      console.log('=== ROLE MIDDLEWARE START ===')
      console.log('req.user:', req.user)
      console.log('User role:', req.user?.role)
      console.log('Allowed roles:', allowedRoles)
      
      // Check if user exists (should be set by authMiddleware)
      if (!req.user) {
        console.log('ERROR: No user object - authMiddleware may not have run')
        return res.status(401).json({ 
          message: 'User not authenticated.' 
        })
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        console.log('ERROR: Role not allowed')
        return res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
        })
      }

      console.log('ROLE MIDDLEWARE: Authorization successful')
      console.log('ROLE MIDDLEWARE: Calling next()')
      console.log('=== ROLE MIDDLEWARE END ===')
      
      // Call next() to continue to next middleware
      next()
      
    } catch (error) {
      console.log('ROLE MIDDLEWARE ERROR:', error.message)
      return res.status(500).json({ 
        message: 'Authorization check failed.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = roleMiddleware