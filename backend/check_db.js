import mongoose from 'mongoose';
import { Goal } from './src/models/goal.model.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/resync").then(async () => {
    const goals = await Goal.find().sort({createdAt: -1}).limit(2);
    console.log(JSON.stringify(goals, null, 2));
    process.exit(0);
}).catch(console.error);
