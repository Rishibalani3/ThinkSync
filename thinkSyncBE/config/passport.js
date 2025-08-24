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
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return done(null, false, { message: "No user found" });

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
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          // Check if account exists by email
          if (!user && profile.emails?.[0]?.value) {
            user = await prisma.user.findUnique({
              where: { email: profile.emails[0].value },
            });
          }

          // Create user if not found
          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                displayName: profile.displayName,
                username: uniqueName.generate(),
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
            // Update tokens and avatar if user exists
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken || user.googleRefreshToken,
                details: {
                  upsert: {
                    create: { avatar: profile.photos?.[0]?.value },
                    update: { avatar: profile.photos?.[0]?.value },
                  },
                },
              },
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
  //returning the user from the session (req.user)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { details: true },
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
