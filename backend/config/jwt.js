// Centralized JWT configuration to ensure consistent secret across all routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

console.log('[JWT Config] Secret loaded, length:', JWT_SECRET.length)

export default JWT_SECRET
