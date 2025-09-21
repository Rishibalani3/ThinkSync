import { rateLimit } from "express-rate-limit";

// rate limiter for password reset
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15MiN
  max: 5, // limiting each IP to 5 requests
  message: { error: "Too many password reset requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export default forgotPasswordLimiter;
