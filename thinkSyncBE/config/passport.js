import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
const prisma = new PrismaClient();

export default function setupPassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return done(null, false, { message: "No user found" });

          const match = await bcrypt.compare(password, user.password);
          if (!match) return done(null, false, { message: "Wrong password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: false,
        scope: ["profile", "email"],
        accessType: "offline",
        prompt: "consent",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value,
                image: profile.photos?.[0]?.value,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                facebookId: null,
              },
            });
          }
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  // Serialize user to store in session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user on each request
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
