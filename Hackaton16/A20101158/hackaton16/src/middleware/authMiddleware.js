
export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    
    return next();
  }

  
  console.warn("Intento de acceso sin autenticación detectado.");
  res.redirect('/login.html');
};
