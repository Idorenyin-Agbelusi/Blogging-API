import express from "express"
import passport from "passport"

import { 
    GetAllBlogs, 
    CreateBlog, 
    PublishBlog,
    GetAllBlogsByUser,
    GetBlogsById,
    DeleteBlog,
    EditBlog
} from '../controllers/blogController.js';

const blogRouter = express.Router();

blogRouter.get("/", GetAllBlogs);
blogRouter.post("/", passport.authenticate('jwt', {session: false}), CreateBlog);
blogRouter.post("/publish/:id", passport.authenticate('jwt', {session: false}), PublishBlog);
blogRouter.get("/by_user", passport.authenticate('jwt', {session: false}), GetAllBlogsByUser);
blogRouter.get("/:id", GetBlogsById);
blogRouter.post("/:id", passport.authenticate('jwt', {session: false}), EditBlog);
blogRouter.post("/delete/:id", passport.authenticate('jwt', {session: false}), DeleteBlog);

export default blogRouter;