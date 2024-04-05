import React, { createContext, useState, useEffect } from "react";
const SERVER = "https://aadiltansawala-e-commerce-college-api.onrender.com/";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {
    // State for cart items
    const [cartItems, setCartItems] = useState(getDefaultCart());
    // State for all products
    const [all_product, setAll_product] = useState([]);

    // Fetch all products and cart data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all products from the server
                const response = await fetch(`${SERVER}allproducts`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
    
                // Fetch image data for each product
                const productsWithImages = await Promise.all(data.map(async (product) => {
                    try {
                        const imageResponse = await fetch(`${SERVER}images/${product._id}`);
                        if (!imageResponse.ok) {
                            throw new Error(`Failed to fetch image for product: ${product.name}`);
                        }
                        const imageData = await imageResponse.blob(); // Convert response to blob
                        const imageUrl = URL.createObjectURL(imageData); // Create image URL from blob
                        return { ...product, imageUrl }; // Add imageUrl to product object
                    } catch (error) {
                        console.error(error); // Log any errors that occur during image fetching
                        return { ...product, imageUrl: null }; // Set imageUrl to null for failed requests
                    }
                }));
    
                setAll_product(productsWithImages);
    
                // Check if auth-token exists in localStorage
                if (localStorage.getItem('auth-token')) {
                    // Construct the request to get cart data
                    const cartResponse = await fetch(`${SERVER}getcart`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'auth-token': localStorage.getItem('auth-token'), // Include auth-token from localStorage
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({}), // Empty body as we're fetching previous cart details
                    });
                    const cartData = await cartResponse.json();
                    console.log(cartData); // Log the response data
                    // Update state with fetched cart items
                    setCartItems(cartData);
                }
            } catch (error) {
                // Handle any errors that occur during the fetch
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData(); // Call the fetchData function
    
    }, []);
    


    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))

        // Check if auth-token exists in localStorage
        if (localStorage.getItem('auth-token')) {
            // Construct the request to add item to cart
            fetch(`${SERVER}addtocart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`, // Include auth-token from localStorage
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }), // Include the item ID in the request body
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data); // Log the response data
                })
                .catch((error) => {
                    console.error('Error adding item to cart:', error); // Log any errors that occur during the process
                });
        }

    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: 0 }))

         // Check if auth-token exists in localStorage
         if (localStorage.getItem('auth-token')) {
            // Construct the request to add item to cart
            fetch(`${SERVER}removefromcart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem('auth-token')}`, // Include auth-token from localStorage
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId }), // Include the item ID in the request body
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data); // Log the response data
                })
                .catch((error) => {
                    console.error('Error adding item to cart:', error); // Log any errors that occur during the process
                });
        }

    }

    const updateCart = (itemId, quantity) => {
        // Update the quantity of the specified item in the cart locally
        setCartItems(prev => ({ ...prev, [itemId]: quantity }));
    
        // Check if auth-token exists in localStorage
        if (localStorage.getItem('auth-token')) {
            // Construct the request to update item quantity in cart
            fetch(`${SERVER}updatecart`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'), // Include auth-token from localStorage
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId: itemId, quantity: quantity }), // Include the item ID and quantity in the request body
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Log the response data
                })
                .catch(error => {
                    console.error('Error updating item quantity in cart:', error); // Log any errors that occur during the process
                });
        }
    }
    

    const getTotalCartAmount = () => {
        let totalAmount = 0;

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find((Product) => Product.id === Number(item));
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }

        return totalAmount;
    }


    const getTotalCartItems = () => {
        let totalItems = 0;
    
        // Loop through each item in the cartItems object
        for (const item in cartItems) {
            // Convert the quantity of the item to an integer
            const quantity = parseInt(cartItems[item]);
    
            // Check if the quantity of the item is greater than 0
            if (!isNaN(quantity) && quantity > 0) {
                // Increment the totalItems by the quantity of the current item
                totalItems += quantity;
            }
        }
    
        return totalItems;
    }
    

    const contextValue = {all_product, cartItems, addToCart, removeFromCart, updateCart , getTotalCartAmount, getTotalCartItems };
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;