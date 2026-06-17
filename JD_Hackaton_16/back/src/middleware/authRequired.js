module.exports = function authRequired(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
};