import express, {Request, Response} from "express";
import {connection} from "./config/db";
import 'reflect-metadata';
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")

// Import cors 
import corsOption from './config/cors'
import credentials from './middlewares/allowCookies'
const cors = require('cors')

// Import routes
import authRoute from "./routes/authRoute"
import routes from "./routes"
import {ErrorFunction} from './middlewares/error'
import authenticateUser from "./middlewares/authenticateUser";
import bodyParser from 'body-parser';
import path from "path";

// Express app and middlewares
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(credentials)
app.use(cors(corsOption))
// app.use(cors({
//     origin: 'https://dumyum.netlify.app' || 'http://localhost:5173',
//     credentials: true
//   }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle requests for images in the category directory
app.get('/uploads/category/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads', 'category', filename);
    res.sendFile(imagePath);
});

// Handle requests for images in the special directory
app.get('/uploads/special/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads', 'special', filename);
    res.sendFile(imagePath);
});

// Handle requests for images in the subCategory directory
app.get('/uploads/subCategory/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads', 'subCategory', filename);
    res.sendFile(imagePath);
});

// Connect to Database
connection();

// Server listening
dotenv.config()
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

// Auth
app.use('/api/v1/auth', authRoute)

// Admin Panel
app.use('/api/v1', routes)

// Global error handler
app.use(ErrorFunction)