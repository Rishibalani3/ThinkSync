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
        callbackURL: "/api/v1/auth/google/callback",
        accessType: "offline", // Requesting offline access for refresh token (not return null now)
        prompt: "consent", //it always asks for consent from user like you want to log in with google for this app..
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          //debubbiing
          // console.log('Google OAuth callback received:');
          // console.log('Access Token:', accessToken ? 'Present' : 'Missing');
          // console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
          // console.log('Profile ID:', profile.id);

          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          // duplicate email check
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
              console.log("Updating refresh token for existing user");
            } else {
              console.log("No refresh token received, keeping existing one");
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
  //returning the user from the session (req.user)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        //excluding sensitive data
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
