export const ensureAuth = (req, res, next) => {
  // console.log("ensureAuth middleware called");
  // console.log("req.isAuthenticated():", req.isAuthenticated());
  // console.log("req.user:", req.user);
  // console.log("req.session:", req.session);

  if (req.isAuthenticated()) {
    // console.log("User is authenticated, proceeding...");
    return next();
  }
  // console.log("User is not authenticated, sending 401");
  res.status(401).json({ error: "Unauthorized. Please log in." });
};
