export const ensureAuth = (req, res, next) => {
  // Debug logging (temporary - remove after fixing cookie issues)
  console.log("ensureAuth - isAuthenticated:", req.isAuthenticated());
  console.log("ensureAuth - sessionID:", req.sessionID);
  console.log("ensureAuth - user:", req.user ? "present" : "missing");
  console.log("ensureAuth - cookies:", req.cookies);
  console.log("ensureAuth - session:", req.session ? "present" : "missing");

  if (req.isAuthenticated()) {
    return next();
  }
  
  // Provide more detailed error for debugging
  const errorDetails = {
    error: "Unauthorized. Please log in.",
    debug: {
      hasSession: !!req.session,
      sessionID: req.sessionID,
      hasCookies: !!req.cookies,
      cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
      cookieHeader: req.headers.cookie || "no cookie header",
    },
  };
  
  res.status(401).json(errorDetails);
};
