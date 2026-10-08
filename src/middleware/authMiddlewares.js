// module.exports = (allowedRoles = []) => (req, res, next) => {
//   if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
//   if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
//   next()
// }

// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user info to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE START ===')
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    console.log('Authorization header:', authHeader)
    
    if (!authHeader) {
      console.log('ERROR: No authorization header')
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      })
    }

    // Extract token (format: "Bearer TOKEN")
    const parts = authHeader.split(' ')
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('ERROR: Invalid authorization format')
      return res.status(401).json({ 
        message: 'Access denied. Invalid token format. Use: Bearer TOKEN' 
      })
    }
    
    const token = parts[1]
    console.log('Token extracted:', token.substring(0, 20) + '...')

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    console.log('Token decoded:', decoded)
    
    // Attach user info to request
    req.user = decoded
    
    console.log('AUTH MIDDLEWARE: Calling next()')
    console.log('=== AUTH MIDDLEWARE END ===')
    
    // Call next() to continue to next middleware
    next()
    
  } catch (error) {
    console.log('AUTH MIDDLEWARE ERROR:', error.message)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      })
    }
    
    return res.status(500).json({ 
      message: 'Token verification failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = authMiddleware