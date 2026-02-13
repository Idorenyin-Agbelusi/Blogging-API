import express from 'express';
import dotenv from 'dotenv';
import { connectToMongoDb } from './db.js';
import './middleware/auth.js';
import authRouter from './routes/authRoute.js';

dotenv.config();
const app = express();
connectToMongoDb();
app.use(express.urlencoded({extended:false}));
app.use('/auth', authRouter);

app.listen(process.env.PORT, ()=>{
    console.log(`Server listening on port ${process.env.PORT}`);    
})