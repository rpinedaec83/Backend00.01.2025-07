export function requireAuthSession(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'unauthenticated' });
  req.user = req.session.user;
  next();
}
