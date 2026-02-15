import mongoose from "mongoose";
import calculateReadingTime from "../helper.js";

const blogSchema = new mongoose.Schema(
    {
        title: {type:String, required: true, unique: true},
        description : String,
        authorId: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
        state: {type:String, enum: ["draft", "published"], default: "draft"},
        read_count: {type:Number, default: 0, min: 0},
        reading_time: Number,
        tags: String,
        body: {type: String, required: true}
    },
    { timestamps: true }
);

blogSchema.pre(
    'save',
    function(){
        this.reading_time = calculateReadingTime(this.body);
    }
)

export default mongoose.model("Blog", blogSchema);