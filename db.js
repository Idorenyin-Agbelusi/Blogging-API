import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}`;

function connectToMongoDb(){
    mongoose.connect(MONGODB_URI);

    mongoose.connection.on('connected', ()=>{
        console.log("Connected to MongoDb Successfully");        
    })

    mongoose.connection.on('error', (err) => {
        console.log("Error connecting to MongoDb", err);        
    })
}

export {connectToMongoDb}