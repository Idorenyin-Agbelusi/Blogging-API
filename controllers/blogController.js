import Blog from "../models/Blog.js";

export const GetAllBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find({ state: 'published' });
        res.json({
            message: 'blogs fetched successfully',
            blogs: blogs
        })
    } catch (error) {
        next(error);
    }
}

export const GetAllBlogsByUser = async (req, res, next) => {
    try {
        const blogs = await Blog.find({ authorId: req.user._id });
        res.json({
            message: "user's blogs fetched successfully",
            blogs: blogs
        })
    } catch (error) {
        next(error);
    }
}

export const GetBlogsById = async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { read_count: 1 } },
            { new: true }
        );
        if (!blog) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.json({
            message: "blog fetched successfully",
            blogs: blog
        })
    } catch (error) {
        return next(error);
    }
}

export const CreateBlog = async (req, res, next) => {
    try {
        const blog = await Blog.create({
            title: req.body.title,
            description: req.body.description,
            state: 'draft',
            body: req.body.body,
            timestamp: new Date(),
            authorId: req.user._id,
            tags: req.body.tags
        });
        res.json({
            message: "successfully created",
            blog: blog
        })
    } catch (error) {
        next(error);
    }
}

export const PublishBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            const err = new Error(`Blog with id ${req.params.id} not found`)
            return next(err);
        }
        
        if (blog.authorId.toString() !== req.user._id.toString()) {
            const err = new Error(`Login as author to modify your blog post`)
            return next(err);
        }

        blog.state = 'published';
        await blog.save();
        return res.json({
            message: "blog post published successfully",
            blog: blog
        })
    } catch (error) {
        return next(error);
    }
}