import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import router  from './routes/users.route.js';
import db from './config/db.js';
import httpStatusText from './utils/httpStatusText.js';

dotenv.config();
const app = express();
app.use(express.json());




app.use('/api/users', router);


// global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({status: err.statusText||httpStatusText.ERROR, message: err.message});
});



app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port ' + (process.env.PORT));
});