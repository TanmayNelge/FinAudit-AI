const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // 1. Extract the token from the secure cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No authentication token provided.' });
  }

  try {
    // 2. Verify the token against your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the decoded userId to the request object for downstream routes to use
    req.userId = decoded.userId;
    
    // 4. Pass control to the next function (the actual route handler)
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({ error: 'Access Denied: Invalid or expired token.' });
  }
};

module.exports = { requireAuth };