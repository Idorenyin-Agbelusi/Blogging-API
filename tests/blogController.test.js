import {jest} from '@jest/globals'

jest.unstable_mockModule("../models/Blog.js", () => ({
  default: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn()
  }
}));

jest.unstable_mockModule("../helper.js", () => ({
  default: jest.fn()
}));

const blog = (await import("../models/Blog.js")).default;
const calculateReadingTime =
  (await import("../helper.js")).default;
const {
  GetAllBlogs,
  GetAllBlogsByUser,
  GetBlogsById,
  CreateBlog,
  PublishBlog,
  DeleteBlog,
  EditBlog
} = await import("../controllers/blogController.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Blog Controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================
  // GET ALL BLOGS
  // ================================
  describe("GetAllBlogs", () => {
    it("should fetch blogs successfully", async () => {
      const req = {
        query: { page: 1, limit: 10 }
      };
      const res = mockResponse();
      const next = jest.fn();

      blog.countDocuments.mockResolvedValue(2);
      blog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: "Blog 1" }])
      });

      await GetAllBlogs(req, res, next);

      expect(blog.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Blogs fetched successfully",
          totalBlogs: 2,
          totalPages: 1
        })
      );
    });

    it("should call next on error", async () => {
      const req = { query: {} };
      const res = mockResponse();
      const next = jest.fn();

      blog.countDocuments.mockRejectedValue(new Error("DB error"));

      await GetAllBlogs(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ================================
  // GET BLOGS BY USER
  // ================================
  describe("GetAllBlogsByUser", () => {
    it("should fetch user blogs", async () => {
      const req = {
        query: {},
        user: { _id: "user123" }
      };
      const res = mockResponse();
      const next = jest.fn();

      blog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: "User Blog" }])
      });

      blog.countDocuments.mockResolvedValue(1);

      await GetAllBlogsByUser(req, res, next);

      expect(blog.find).toHaveBeenCalledWith(
        expect.objectContaining({ "author.id": "user123" })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalBlogs: 1,
          totalPages: 1
        })
      );
    });
  });

  // ================================
  // GET BLOG BY ID
  // ================================
  describe("GetBlogsById", () => {
    it("should return blog if found", async () => {
      const req = { params: { id: "blog1" } };
      const res = mockResponse();
      const next = jest.fn();

      blog.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ title: "Test Blog" })
      });

      await GetBlogsById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "blog fetched successfully"
        })
      );
    });

    it("should return 404 if blog not found", async () => {
      const req = { params: { id: "blog1" } };
      const res = mockResponse();
      const next = jest.fn();

      blog.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await GetBlogsById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ================================
  // CREATE BLOG
  // ================================
  describe("CreateBlog", () => {
    it("should create blog successfully", async () => {
      const req = {
        body: {
          title: "New Blog",
          description: "Desc",
          body: "Content",
          tags: ["tech"]
        },
        user: {
          _id: "user1",
          firstName: "John",
          lastName: "Doe"
        }
      };

      const res = mockResponse();
      const next = jest.fn();

      blog.create.mockResolvedValue({ title: "New Blog" });

      await CreateBlog(req, res, next);

      expect(blog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ================================
  // PUBLISH BLOG
  // ================================
  describe("PublishBlog", () => {
    it("should publish blog if authorized", async () => {
      const req = {
        params: { id: "blog1" },
        user: { _id: "user1" }
      };
      const res = mockResponse();
      const next = jest.fn();

      blog.findOneAndUpdate.mockResolvedValue({ state: "published" });

      await PublishBlog(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "blog post published successfully"
        })
      );
    });

    it("should return 404 if not authorized", async () => {
      const req = {
        params: { id: "blog1" },
        user: { _id: "user1" }
      };
      const res = mockResponse();
      const next = jest.fn();

      blog.findOneAndUpdate.mockResolvedValue(null);

      await PublishBlog(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ================================
  // DELETE BLOG
  // ================================
  describe("DeleteBlog", () => {
    it("should delete blog", async () => {
      const req = {
        params: { id: "blog1" },
        user: { _id: "user1" }
      };
      const res = mockResponse();
      const next = jest.fn();

      blog.findOneAndDelete.mockResolvedValue({});

      await DeleteBlog(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: "Blog deleted successfully"
      });
    });

    it("should return 404 if not found", async () => {
      const req = {
        params: { id: "blog1" },
        user: { _id: "user1" }
      };
      const res = mockResponse();
      const next = jest.fn();

      blog.findOneAndDelete.mockResolvedValue(null);

      await DeleteBlog(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ================================
  // EDIT BLOG
  // ================================
  describe("EditBlog", () => {
    it("should edit blog successfully", async () => {
      const req = {
        params: { id: "blog1" },
        user: { _id: "user1" },
        body: { body: "Updated content" }
      };

      const res = mockResponse();
      const next = jest.fn();

      calculateReadingTime.mockReturnValue(3);

      blog.findOneAndUpdate.mockResolvedValue({ title: "Updated" });

      await EditBlog(req, res, next);

      expect(calculateReadingTime).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Blog edited successfully"
        })
      );
    });

    it("should return 404 if not authorized", async () => {
      const req = {
        params: { id: "blog1" },
        user: { _id: "user1" },
        body: { title: "Update" }
      };

      const res = mockResponse();
      const next = jest.fn();

      blog.findOneAndUpdate.mockResolvedValue(null);

      await EditBlog(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

});
