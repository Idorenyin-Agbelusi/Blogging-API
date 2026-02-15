import Blog from "../models/Blog.js";
import calculateReadingTime from "../helper.js";

export const GetAllBlogs = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            searchTerm,
            sortBy,
            order
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const filter = {
            state: 'published'
        };
        if (searchTerm) {
            filter.$text = { $search: searchTerm };
        }

        const sortOptions = {};

        if (searchTerm) {
            sortOptions.score = { $meta: "textScore" };
        }

        const allowedSortFields = [
            "read_count",
            "reading_time",
            "createdAt"
        ];

        if (allowedSortFields.includes(sortBy)) {
            sortOptions[sortBy] = order === "asc" ? 1 : -1;
        }

        const totalBlogs = await Blog.countDocuments(filter);

        const blogs = await Blog.find(filter, searchTerm ? {
            score: { $meta: "textScore" }
        } : {})
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.json({
            message: "Blogs fetched successfully",
            currentPage: pageNumber,
            totalPages: Math.ceil(totalBlogs / limitNumber),
            totalBlogs,
            blogs
        });

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
            "author.id": req.user._id
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
        const blogById = await Blog
            .findByIdAndUpdate(
                req.params.id,
                { $inc: { read_count: 1 } },
                { new: true }
            )
            .populate({
                path: "author.id",
                select: "firstName lastName email"
            });
        if (!blogById) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.json({
            message: "blog fetched successfully",
            blogs: blogById
        })
    } catch (error) {
        return next(error);
    }
}

export const CreateBlog = async (req, res, next) => {
    try {
        const createdBlog = await Blog.create({
            title: req.body.title,
            description: req.body.description,
            body: req.body.body,
            author: {
                id: req.user._id,
                name: `${req.user.firstName} ${req.user.lastName}`
            },
            tags: req.body.tags
        });
        res.status(201).json({
            message: "successfully created",
            blog: createdBlog
        })
    } catch (error) {
        next(error);
    }
}

export const PublishBlog = async (req, res, next) => {
    try {
        const updatedBlog = await Blog
            .findOneAndUpdate(
                { _id: req.params.id, "author.id": req.user._id },
                { state: 'published' },
                { new: true }
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
                { _id: req.params.id, "author.id": req.user._id }
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
                { _id: req.params.id, "author.id": req.user._id },
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