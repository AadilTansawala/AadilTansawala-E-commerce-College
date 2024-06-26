const port = 4000;
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const stripe = require('stripe')('sk_test_51P3AuhSITsOuMQMHIaqB58dsUbefe4ncOIslhqDfx3wY6i2YtohyV0wLFsB38EAPSoIOaFgj8mDx1nCAPFnqmKXa00PcFf8Bph');
const cors = require("cors");
const os = require('os');
const fs = require('fs');

// Update the base URL of your API
const BASE_URL = 'https://aadiltansawala-e-commerce-college-api.onrender.com/';

// Increase the request size limit
app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: false 
}));

app.use(bodyParser.json({
    limit: '50mb'
}));



// Enable CORS for all routes
app.use(cors());


// Add your routes here
// For example:
app.options(['/allproducts', '/removeproduct', '/product/:id' , '/updateproduct', '/upload', '/addproduct', '/images' ,'/images/:productId'], cors());


// Database Connection with MongoDB0

const connectWithRetry = () => {
    mongoose.connect('mongodb+srv://aadil:07070707@cluster0.x4wrsel.mongodb.net/E-COMMERCE', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to MongoDB Atlas');
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB Atlas:', err.message);
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
        });
};

connectWithRetry();


// Define the destination directory for storing uploaded images
const uploadDir = path.join(__dirname, 'upload/images');
console.log("Destination directory:", uploadDir); // Add this line to log the destination directory

// Image Storage Engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Route for handling file uploads and adding products
app.post("/upload", upload.single('image'), async (req, res) => {
    try {
        // Validate the request body to ensure all required fields are present
        const { name, category, new_price, old_price } = req.body;
        if (!name || !category || !new_price || !old_price || !req.file) {
            return res.status(400).json({ success: false, error: "Missing required fields or image" });
        }

        // Read the uploaded image file
        const image = {
            data: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype
        };

        // Create a new product instance with image data
        const product = new Product({
            name: name,
            image: image,
            category: category,
            new_price: new_price,
            old_price: old_price,
        });

        // Save the product to the database
        await product.save();

        // If file upload is successful, return a JSON response with success status and image URL
        res.json({
            success: true,
            message: "Image uploaded and product added successfully",
            imageUrl: `https://${req.hostname}/images/${product._id}` // Use product ID as image URL
        });
    } catch (error) {
        // If an error occurs, handle it and send an error response
        console.error("Error uploading image and adding product:", error);
        res.status(500).json({ success: false, error: "An error occurred while uploading image and adding product" });
    }
});





// Serve images from the database
app.get('/images/:productId', async (req, res) => {
    try {
        // Fetch the product by ID from the database
        const product = await Product.findById(req.params.productId);

        // If product not found or image data missing, send 404 Not Found
        if (!product || !product.image) {
            return res.status(404).send('Image not found');
        }

        // Set appropriate content type for the image
        res.contentType(product.image.contentType);

        // Send the image data
        res.send(product.image.data);
    } catch (error) {
        // If an error occurs, handle it and send an error response
        console.error("Error fetching image:", error);
        res.status(500).send('Internal Server Error');
    }
});






// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


// Schema for Creating Products with image data
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
        data: {
            type: Buffer, // Store image data as a Buffer
            required: true,
        },
        contentType: {
            type: String, // Store image content type
            required: true,
        },
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

// Function to read the contents of the uploaded image file and return a promise
const readImageFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};


// Creating API for adding Products
app.post('/addproduct', upload.single('image'), async (req, res) => {
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

        const { name, category, new_price, old_price } = req.body;

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }
        console.log(req.file);

        // Read the uploaded image file
        const image = {
            data: await readImageFile(req.file.path),
            contentType: req.file.mimetype
        };

        // Create a new product instance using the Product model
        const product = new Product({
            id: id,
            name: name,
            category: category,
            new_price: new_price,
            old_price: old_price,
            image: image // Store the image buffer in the database
        });

        // Save the product to the database
        await product.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            name: name,
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


// API endpoint to fetch product by ID
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to update product
app.put('/updateproduct', upload.single('image'), async (req, res) => {
    try {
        const { name, category, new_price, old_price } = req.body;
        let image_content;

        // Check if an image was included in the request
        if (req.file) {
            // If an image was included, read the image file and create image_content
            image_content = {
                data: await readImageFile(req.file.path),
                contentType: req.file.mimetype
            };
        } else {
            // If no image was included, check if the existing image URL is provided in the request body
            if (req.body.image) {
                // Use the existing image content from the database
                image_content = req.body.image;
            } else {
                // If no image URL is provided, set image_content to null or an appropriate default value
                image_content = null; // or some default image content
            }
        }

        const updatedProduct = {
            name: name,
            category: category,
            new_price: new_price,
            old_price: old_price,
            image: image_content 
        };

        // Update the product in the database using findByIdAndUpdate
        await Product.findByIdAndUpdate(req.body._id, updatedProduct);

        // Send a success response
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        // Handle errors and send an error response
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
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
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

app.post('/signup', async (req, res) => {
    try {
        // Validate email
        if (!validateEmail(req.body.email)) {
            return res.status(400).json({ success: false, errors: "Invalid email address" });
        }

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

        // Set the quantity of the specified item in the user's cart data to 0
        userData.cartData[req.body.itemId] = 0;

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


// Creating endpoint to update products from cart data
app.post('/updatecart', fetchUser, async (req, res) => {
    try {
        // Extract item ID and quantity from request body
        const { itemId, quantity } = req.body;

        // Find the user data based on the user ID extracted from the JWT token
        let userData = await Users.findOne({ _id: req.user.id });

        // Convert quantity to a number
        const parsedQuantity = parseInt(quantity);

        // Update the quantity of the specified item in the user's cart data
        userData.cartData[itemId] = isNaN(parsedQuantity) || parsedQuantity <= 0 ? 0 : parsedQuantity;

        // Update the user's cart data in the database
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

        // Send success response
        res.send("Cart updated successfully");
    } catch (error) {
        // If an error occurs during the process, respond with an error message
        console.error("Error updating cart:", error);
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

app.post('/create-payment-intent', async (req, res) => {
    const { cartItems, totalAmount } = req.body;

    try {
        // Calculate the total amount in cents
        const amount = totalAmount * 100;

       // Create a Stripe Checkout session
       const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: await Promise.all(cartItems.map(async item => {
            try {
                // Fetch the image for the current product
                const imageResponse = await fetch(`${BASE_URL}images/${item._id}`);
                
                // Check if the request was successful
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image for product: ${item.name}`);
                }
    
                // Get the image URL
                const imageUrl = await imageResponse.text();
    
                // Construct the product data object
                const productData = {
                    name: item.name,
                    images: [`${BASE_URL}images/${item._id}`], // Pass image URL as an array
                };
    
                return {
                    price_data: {
                        currency: 'inr',
                        product_data: productData,
                        unit_amount: item.new_price * 100,
                    },
                    quantity: item.quantity,
                };
            } catch (error) {
                console.error(error);
                // If image fetch fails, create line item without image
                return {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: item.new_price * 100,
                    },
                    quantity: item.quantity,
                };
            }
        })),
        mode: 'payment',
        success_url: 'https://aadil-tansawala-e-commerce-college-frontend.vercel.app/',
        cancel_url: 'https://aadil-tansawala-e-commerce-college-frontend.vercel.app/mens',
    });
    

    // Send the session ID back to the client
    res.json({ sessionId: session.id });
} catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Route handler for the root path
app.get("/", (req, res) => {
    res.send("Server is running.");
});


app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});