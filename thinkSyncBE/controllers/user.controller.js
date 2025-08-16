export const me = (req, res) => {
  // ensureAuth middleware already checks authentication
  res.json(req.user);
};
