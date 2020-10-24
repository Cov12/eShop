import path from 'path'
import express from "express";
import colors from "colors";
import morgan from 'morgan'
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";


dotenv.config();

connectDB();



const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api is running...");
});

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'))
}

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);



app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

//Uploads images to static folder
const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

//Handles routes not found 404
app.use(notFound);

//Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "production";



app.listen(
  5000,
  console.log(`server running in ${NODE_ENV} mode on port: ${PORT}`.yellow.bold)
);
