import express from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
const authRouter = express.Router();

authRouter.post(
   "/login",
    async (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
            try {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    const error = new Error(info.message);
                    return next(error);
                }

                req.login(user, { session: false },
                    async (error) => {
                        if (error) {
                            return next(error);
                        }
                        const token = jwt.sign(
                            { sub: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        res.json({token})
                    })
            } catch(error){
                return next(error)
            }
        })(req, res, next)
    }
)

authRouter.post(
    "/signup",
    passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
        res.json({
            message: "Signup successful",
            user: req.user
        });
    }
)

export default authRouter;
