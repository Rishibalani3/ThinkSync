# ThinkSync Backend

## Stateful Sessions (cookie-based) + OAuth

- Use sessions (via express-session + a persistent store like Redis/Mongo) for logged-in state.
- Store only a session ID in the cookie (HTTP-only, Secure).
- Handle both local email/password and OAuth logins in the same session flow.
- Use Passport.js — it supports local strategy for email/password and ready-made strategies for Google and Facebook.
