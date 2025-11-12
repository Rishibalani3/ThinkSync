import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  uniqueNamesGenerator,
  names,
  adjectives,
  colors,
  starWars,
} from "unique-names-generator";
import { log } from "../utils/Logger.js";
//it should consist only 10 characters
const uniqueName = {
  generate: () => {
    return uniqueNamesGenerator({
      dictionaries: [colors, names, adjectives, starWars],
      separator: "-",
      style: "lowerCase",
      length: 2,
    });
  },
};

const prisma = new PrismaClient();

export default function setupPassport() {
  // Local login strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({ 
            where: { email },
            include: { details: true }
          });
          if (!user) return done(null, false, { message: "No user found" });

          // Check if user is banned
          if (user.details?.isBanned) {
            return done(null, false, { message: "Your account has been banned. Please contact support." });
          }

          // Check if user is suspended
          if (user.details?.isSuspended) {
            const suspendedUntil = user.details?.suspendedUntil;
            if (suspendedUntil && new Date(suspendedUntil) > new Date()) {
              return done(null, false, { 
                message: `Your account is suspended until ${new Date(suspendedUntil).toLocaleDateString()}. Please contact support.` 
              });
            }
          }

          if (!user.password) {
            return done(null, false, { message: "Account uses Google login" });
          }

          const match = await bcrypt.compare(password, user.password);
          if (!match) return done(null, false, { message: "Wrong password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? "https://api.thinksync.me/api/v1/auth/google/callback"
            : "http://localhost:3000/api/v1/auth/google/callback",
        accessType: process.env.NODE_ENV === "production" ? "offline" : "", // Requesting offline access for refresh token (not return null now)
        prompt: "consent", //it always asks for consent from user like you want to log in with google for this app..
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          log("Google OAuth callback received:");
          log("Access Token:", accessToken ? "Present" : "Missing");
          log("Refresh Token:", refreshToken ? "Present" : "Missing");
          log("Profile ID:", profile.id);

          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          // duplicate email check
          if (!user && profile.emails?.[0]?.value) {
            user = await prisma.user.findUnique({
              where: { email: profile.emails[0].value },
            });
          }

          // Check if existing user is banned or suspended
          if (user) {
            if (user.details?.isBanned) {
              return done(null, false, { message: "Your account has been banned. Please contact support." });
            }
            if (user.details?.isSuspended) {
              const suspendedUntil = user.details?.suspendedUntil;
              if (suspendedUntil && new Date(suspendedUntil) > new Date()) {
                return done(null, false, { 
                  message: `Your account is suspended until ${new Date(suspendedUntil).toLocaleDateString()}. Please contact support.` 
                });
              }
            }
          }

          // Create user if not found
          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                displayName: profile.displayName,
                username: uniqueName.generate(), // intially username will be random from unique-names-generator function
                email: profile.emails?.[0]?.value,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken || null,
                details: {
                  create: {
                    avatar: profile.photos?.[0]?.value,
                  },
                },
              },
              include: { details: true },
            });
          } else {
            // Updating existing tokens if users exists  (this will also update the avatar if user changed in email id)
            const updateData = {
              googleAccessToken: accessToken,
              details: {
                upsert: {
                  create: { avatar: profile.photos?.[0]?.value },
                  update: { avatar: profile.photos?.[0]?.value },
                },
              },
            };

            if (refreshToken) {
              updateData.googleRefreshToken = refreshToken;
              log("Refresh token received and updated");
            } else {
              log("No refresh token received, keeping existing one");
            }

            user = await prisma.user.update({
              where: { id: user.id },
              data: updateData,
              include: { details: true },
            });
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        omit: {
          password: true,
          googleAccessToken: true,
          googleRefreshToken: true,
          googleId: true,
        },
        include: { details: true },
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
