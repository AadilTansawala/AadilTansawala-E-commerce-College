import React, { createContext, useState, useEffect } from "react";
import { SERVER } from "../config";

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
        // Fetch all products from the server
        fetch(`${SERVER}allproducts`)
            .then((response) => response.json())
            .then((data) => {
                // Update state with fetched products
                setAll_product(data);

                // Check if auth-token exists in localStorage
                if (localStorage.getItem('auth-token')) {
                    // Construct the request to get cart data
                    fetch(`${SERVER}getcart`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/form-data',
                            'auth-token': `${localStorage.getItem('auth-token')}`, // Include auth-token from localStorage
                            'Content-Type': 'application/json',
                        },
                        body: "" // Nothing to be included in body as we're fetching previous cart details
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(data); // Log the response data
                            // Update state with fetched cart items
                            setCartItems(data);
                        })
                        .catch((error) => {
                            console.error('Error getting cart data:', error); // Log any errors that occur during the process
                        });
                }
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch
                console.error('Error fetching all products:', error);
            });
    }, []); // Empty dependency array ensures the effect runs only once after the initial render


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
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))

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

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItems += cartItems[item];
            }
        }

        return totalItems;
    }

    const contextValue = {all_product, cartItems, addToCart, removeFromCart, getTotalCartAmount, getTotalCartItems };
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;