const jwt = require('jsonwebtoken');

function getTokenFromRequest(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// Requires a valid logged-in user. Rejects with 401 if missing/invalid.
function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'You need to sign in to do that.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

// Attaches req.userId if a valid token is present, but doesn't block the request otherwise.
function attachUserIfPresent(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
  } catch (err) {
    // Invalid token is treated the same as no token for optional auth.
  }
  next();
}

module.exports = { requireAuth, attachUserIfPresent };
