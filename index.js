import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter  from './routes/users.route.js';
import authRouter from './routes/auth.route.js'
import studentsRouter from './routes/students.route.js'
import groupsRouter from './routes/groups.route.js'
import groupScheduleRouter from './routes/groupSchedule.route.js';
import attendanceRouter from './routes/attendance.route.js';
import memorizationRouter from './routes/memorization.route.js'
import teachersRouter from './routes/teachers.route.js'
import parentRouter from './routes/parents.route.js'

import httpStatusText from './utils/httpStatusText.js';


dotenv.config();
const app = express();
app.use(express.json());


app.use('/api/users', usersRouter);
app.use("/api/auth", authRouter);
app.use('/api/students', studentsRouter)
app.use('/api/groups', groupsRouter)
app.use('/api/group-schedules', groupScheduleRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/memorization', memorizationRouter);
app.use('/api/teachers/my-groups', teachersRouter);
app.use('/api/parents/my-childern', parentRouter)


// global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({status: err.statusText||httpStatusText.ERROR, msg: err.message});
});

const PORT  = process.env.PORT;
console.log("before listening")
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});