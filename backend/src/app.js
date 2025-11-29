import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// Routes 
import userRegisterRouter from './routes/user.routes.js';
import freelancerRouter from './routes/freelancer.routes.js';
import clientRouter from './routes/client.routes.js';

app.use('/api/v1/users', userRegisterRouter)
app.use('/api/v1/freelancer', freelancerRouter)
app.use('/api/v1/client', clientRouter)


export {app};