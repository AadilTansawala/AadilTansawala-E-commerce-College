const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

// Add middleware to parse JSON bodies
app.use(express.json());

// Database Connection with MongoDB
mongoose.connect("mongodb+srv://aadil:07070707@cluster0.x4wrsel.mongodb.net/E-COMMERCE");

// Enable CORS with specific options
app.use(cors({
    origin: "https://aadil-tansawala-e-commerce-college-admin.vercel.app", // Allow requests from this origin
    methods: "GET,POST,PUT,DELETE", // Allow specific HTTP methods
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// API Creation
app.get("/", (req, res) => {
    res.send("Express app is Running ");
});

// Image Storage Engine
// Configure Multer to use the /tmp directory for storing uploads
const storage = multer.diskStorage({
    destination: '/tmp', // Use /tmp directory for temporary storage
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Creating Upload Endpoints for images
// Serve static files (images) from the 'upload/images' directory
app.use('/images', express.static('upload/images'));

// Route for handling file uploads
app.post("/upload", upload.single('product'), (req, res) => {
    // If file upload is successful, return a JSON response with success status and image URL
    res.json({
        success: 1,
        imageUrl: `http://${req.hostname}:${port}/images/${req.file.filename}`
    });
});

// Schema for Creating Products
const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    }
});

// Create a model based on the product schema
const Product = mongoose.model("Product", productSchema);

// Add product
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            name: req.body.name,
        });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, error: "An error occurred while adding the product" });
    }
});

// Remove product
app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        console.log("Product Removed");
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, error: "An error occurred while removing the product" });
    }
});

// Get all products
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All Products Fetched");
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, error: "An error occurred while fetching products" });
    }
});

// Server listening
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});

module.exports = app;
