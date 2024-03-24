"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
require("reflect-metadata");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// Import cors 
const cors_1 = __importDefault(require("./config/cors"));
// import credentials from './middlewares/allowCookies'
const cors = require('cors');
// Import routes
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middlewares/error");
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
// Express app and middlewares
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cookieParser());
// app.use(credentials)
app.use(cors(cors_1.default));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Handle requests for images in the category directory
app.get('/uploads/category/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path_1.default.join(__dirname, '../uploads', 'category', filename);
    res.sendFile(imagePath);
});
// Handle requests for images in the special directory
app.get('/uploads/special/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path_1.default.join(__dirname, '../uploads', 'special', filename);
    res.sendFile(imagePath);
});
// Handle requests for images in the subCategory directory
app.get('/uploads/subCategory/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path_1.default.join(__dirname, '../uploads', 'subCategory', filename);
    res.sendFile(imagePath);
});
// Connect to Database
(0, db_1.connection)();
// Server listening
dotenv.config();
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
// Auth
app.use('/api/v1/auth', authRoute_1.default);
// Admin Panel
app.use('/api/v1', routes_1.default);
// Global error handler
app.use(error_1.ErrorFunction);
