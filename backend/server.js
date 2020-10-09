import express from 'express';
import colors from 'colors'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

import productRoutes from './routes/productRoutes.js'

dotenv.config();

connectDB();

const app = express();

app.get('/',(req, res) => {
    res.send('Api is running...')
});

app.use('/api/products', productRoutes)

//Handles routes not found 404
app.use(notFound)

//Error handling middleware
app.use(errorHandler)


const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';

app.listen(5000, console.log(`server running in ${NODE_ENV} mode on port: ${PORT}`.yellow.bold));