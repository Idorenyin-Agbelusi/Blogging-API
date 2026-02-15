import Blog from "../models/Blog.js";
import calculateReadingTime from "../helper.js";

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
        const { page = 1, limit = 20, state } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const filter = {
            authorId: req.user._id
        };

        if (state) {
            filter.state = state;
        }

        const blogs = await Blog
            .find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalBlogs = await Blog.countDocuments(filter);

        res.json({
            message: "User's blogs fetched successfully",
            currentPage: pageNumber,
            totalPages: Math.ceil(totalBlogs / limitNumber),
            totalBlogs,
            blogs
        });
    } catch (error) {
        next(error);
    }
}

export const GetBlogsById = async (req, res, next) => {
    try {
        const blog = await Blog
            .findByIdAndUpdate(
                req.params.id,
                { $inc: { read_count: 1 } },
                { returnDocument: "after"}
            )
            .populate({
                path: "authorId",
                select: "firstName lastName email"
            });
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
        const updatedBlog = await Blog
            .findOneAndUpdate(
                { _id: req.params.id, authorId: req.user._id },
                { state: 'published' },
                { returnDocument: "after"}
            );

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found or you are not authorized' })
        }

        return res.json({
            message: "blog post published successfully",
            blog: updatedBlog
        })
    } catch (error) {
        return next(error);
    }
}

export const DeleteBlog = async (req, res, next) => {
    try {
        const deletedBlog = await Blog
            .findOneAndDelete(
                { _id: req.params.id, authorId: req.user._id }
            );

        if (!deletedBlog) {
            res.status(404).json({ message: "Blog not found or you are unauthorized" });
        }

        res.json({
            message: "Blog deleted successfully"
        })
    } catch (error) {
        return next(error);
    }
}

export const EditBlog = async (req, res, next) => {
    try {
        const allowedUpdates = ["title", "body", "tags", "description"];

        const updates = {};

        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (updates.body) {
            updates.reading_time = calculateReadingTime(updates.body);
        }

        const editedBlog = await Blog
            .findOneAndUpdate(
                { _id: req.params.id, authorId: req.user._id },
                { $set: updates },
                {
                    returnDocument: "after",
                    runValidators: true
                }
            )

        if (!editedBlog) {
            return res.status(404).json({ message: "Blog not found or you are not authorized" })
        }

        return res.json({
            message: "Blog edited successfully",
            blog: editedBlog
        });
    } catch (error) {
        return next(error);
    }

}