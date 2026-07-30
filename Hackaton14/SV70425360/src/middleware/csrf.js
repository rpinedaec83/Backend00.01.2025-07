import csrf from 'csurf';

export const csrfProtection = csrf({ cookie: false });

export function exposeCsrfToken(req, res) {
  return res.json({ csrfToken: req.csrfToken() });
}
