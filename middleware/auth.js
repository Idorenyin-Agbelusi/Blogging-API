import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    async (token, done) => {
        try {
            const user = await User.findOne({ _id: token.sub })
            if (!user) {
                return done(null, false);
            }
            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;
            return done(null, userWithoutPassword);
        } catch (err) {
            return done(err, false);
        }

    }));

    passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (email, password, done) => {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: "User not found" });
            }

            const validate =await user.isValidPassword(password);
            if (!validate) {
                return done(null, false, { message: "Invalid credential" });
            }

            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;
            return done(null, userWithoutPassword, { message: "Logged in successfully" });
        }
    )
)

passport.use(
    'signup',
    new LocalStrategy(
        {
            usernameField: 'email',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const user = await User.create({ email, password, firstName: req.body.firstName, lastName: req.body.lastName });
                const userWithoutPassword = user.toObject();
                delete userWithoutPassword.password;
                return done(null, userWithoutPassword);
            } catch (error) {
                return done(error);
            }
        }
    )
)
