import mongoose from 'mongoose';
import { Goal } from './src/models/goal.model.js';
import { LearningStep } from './src/models/learningStep.model.js';
import { UserActiveStep } from './src/models/userActiveStep.model.js';
import { Action } from './src/models/action.model.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/resync").then(async () => {
    const goals = await Goal.find().sort({createdAt: -1}).limit(2);
    console.log("Recent Goals:");
    console.log(goals);
    
    for (const g of goals) {
        const steps = await LearningStep.find({goal: g._id});
        console.log(`Steps for goal ${g._id}:`, steps.length);
        const activeSteps = await UserActiveStep.find({goal: g._id});
        console.log(`ActiveSteps for goal ${g._id}:`, activeSteps.length);
    }
    process.exit(0);
}).catch(console.error);
