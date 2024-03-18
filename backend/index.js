const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");


// Add the following middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    next();
});


app.use(express.json());


// Database Connection with MongoDB
mongoose.connect("mongodb+srv://aadil:07070707@cluster0.x4wrsel.mongodb.net/E-COMMERCE");

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
    // Add other properties of the product schema here
});

// Create a model based on the product schema
const Product = mongoose.model("Product", productSchema);


app.post('/addproduct', async (req, res) => {
    try {
        // Fetch all products from the database
        let products = await Product.find({});

        // Initialize a variable to hold the new ID
        let id;

        // Check if there are existing products
        if (products.length > 0) {
            // Get the last product from the array
            let lastProduct = products[products.length - 1];

            // Increment the last product's ID by one to generate a new ID
            id = lastProduct.id + 1;
        } else {
            // If there are no existing products, start with ID 1
            id = 1;
        }

        // Create a new product instance using the Product model
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        console.log(product);
        // Save the product to the database
        await product.save();
        console.log("Saved");

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            name: req.body.name,
        });

    } catch (error) {
        // If an error occurs, handle it and send an error response
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, error: "An error occurred while adding the product" });
    }
});

//Creating API for deleting Products

app.post('/removeproduct', async (req, res) => {
    try {
        // Find and delete the product with the specified ID
        await Product.findOneAndDelete({ id: req.body.id });

        // Log a message to indicate that the product has been removed
        console.log("Product Removed");

        // Send a success response with the name of the deleted product
        res.json({
            success: true,
            name: req.body.name
        });
    } catch (error) {
        // If an error occurs, handle it and send an error response
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, error: "An error occurred while removing the product" });
    }
});

// Creating API for getting all products

app.get('/allproducts', async (req, res) => {
    try {
        // Fetch all products from the database
        let products = await Product.find({});

        // Log a message to indicate that all products have been fetched
        console.log("All Products Fetched");

        // Send the fetched products as a response
        res.json(products);
    } catch (error) {
        // If an error occurs, handle it and send an error response
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, error: "An error occurred while fetching products" });
    }
});


// Schema Creation for User Model


const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // Add other properties of the User schema here
});

// Create a model based on the user schema
const Users = mongoose.model("Users", userSchema);

//Creating Endpoints for registering the user
// This route handles user sign up
app.post('/signup', async (req, res) => {
    try {
        // Check if the user with the provided email already exists
        let check = await Users.findOne({ email: req.body.email });

        // If user with the provided email already exists
        if (check) {
            return res.status(400).json({ success: false, errors: "Existing user found with the same email address" });
        }

        // Create a new user object with the provided data
        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        // Save the new user to the database
        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart
        });
        await user.save();

        // Prepare data for JWT token
        const data = {
            user: {
                id: user.id
            }
        };

        // Sign JWT token with the user data and a secret key
        const token = jwt.sign(data, 'secret_ecom');

        // Respond with success and token
        res.json({ success: true, token });
    } catch (error) {
        // If an error occurs during the process, respond with an error message
        console.error(error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});


// Creating endpoint for user login
app.post('/login', async (req, res) => {
    try {
        // Find user by email in the database
        let user = await Users.findOne({ email: req.body.email });

        // If user exists
        if (user) {
            // Compare passwords
            const passCompare = req.body.password === user.password;

            if (passCompare) {
                // Prepare data for JWT token
                const data = {
                    user: {
                        id: user.id
                    }
                };

                // Sign JWT token with user data and a secret key
                const token = jwt.sign(data, 'secret_ecom');
                
                // Respond with success and token
                res.json({ success: true, token });
            } else {
                // Respond with error message for wrong password
                res.json({ success: false, errors: "Wrong Password" });
            }
        } else {
            // Respond with error message for wrong email
            res.json({ success: false, errors: "Wrong Email Id" });
        }
    } catch (error) {
        // If an error occurs during the process, respond with an error message
        console.error(error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});


// Creating endpoint to fetch data for new collection
app.get('/newcollections', async (req, res) => {
    try {
        // Retrieve all products from the database
        let products = await Product.find({});

        // Extract the latest products to form the new collection (assuming products are sorted by creation date)
        let newCollection = products.slice(1).slice(-8);

        // Log a message indicating that the new collection has been fetched
        console.log("New Collection Fetched");

        // Send the new collection as the response
        res.send(newCollection);
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error fetching new collection:", error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});

// Creating endpoint to fetch popular products in the women's section
app.get('/popularinwomen', async (req, res) => {
    try {
        // Retrieve all products in the women's section from the database
        let products = await Product.find({ category: "women" });

        // Extract the popular products in the women's section (e.g., top 4 products)
        let popularInWomen = products.slice(0, 4);

        // Log a message indicating that the popular products in the women's section have been fetched
        console.log("Popular in women fetched");

        // Send the popular products in the women's section as the response
        res.send(popularInWomen);
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error fetching popular products in women's section:", error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});

// Middleware to fetch user data from JWT token
const fetchUser = async (req, res, next) => {
    // Extract token from request header
    const token = req.header('auth-token');

    // If token doesn't exist, send 401 Unauthorized response
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    } else {
        try {
            // Verify the token and extract user data
            const data = jwt.verify(token, 'secret_ecom');

            // Set the user data in the request object
            req.user = data.user;

            // Call the next middleware in the chain
            next();
        } catch (error) {
            // If an error occurs during token verification, send 500 Internal Server Error response
            console.error('Error verifying token:', error);
            return res.status(500).send({ errors: "Internal server error" });
        }
    }
};


// Creating endpoint to add products to cart data
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        console.log("Added", req.body.itemId);
        // Find the user data based on the user ID extracted from the JWT token
        let userData = await Users.findOne({ _id: req.user.id });

        // Increment the quantity of the specified item in the user's cart data
        userData.cartData[req.body.itemId] += 1;

        // Update the user's cart data in the database
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

        // Send success response
        res.send("Added");
    } catch (error) {
        // If an error occurs during the process, respond with an error message
        console.error("Error adding product to cart:", error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});


// Creating endpoint to remove products from cart data
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        // Log the itemId to be removed
        console.log("Removing item from cart:", req.body.itemId);

        // Find the user data based on the user ID extracted from the JWT token
        let userData = await Users.findOne({ _id: req.user.id });

        // Decrement the quantity of the specified item in the user's cart data
        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
        }

        // Update the user's cart data in the database
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

        // Send success response
        res.send("Item removed from cart");
    } catch (error) {
        // If an error occurs during the process, respond with an error message
        console.error("Error removing product from cart:", error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});

// Creating endpoint to get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        // Log message indicating that cart data is being fetched
        console.log("GetCart");

        // Find the user data based on the user ID extracted from the JWT token
        let userData = await Users.findOne({ _id: req.user.id });

        // Send the user's cart data as the response
        res.json(userData.cartData);
    } catch (error) {
        // If an error occurs during the process, respond with an error message
        console.error("Error getting cart data:", error);
        res.status(500).json({ success: false, errors: "Internal server error" });
    }
});



app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});

module.exports = app;
in this