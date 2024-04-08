import React, { useState , useContext } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import CartItem from '../CartItem/CartItem';// Import the CartItem component
import remove_icon from '../Assets/cart_cross_icon.png';
import { loadStripe } from '@stripe/stripe-js';
const SERVER = "https://aadiltansawala-e-commerce-college-api.onrender.com/";

const stripePromise = loadStripe('pk_test_51P3AuhSITsOuMQMHEsHrtfJZdOqluOLsDsKfOiQ7wBtXrLayeuAZ3Bu8Wu03UwP3CvJfPCWvLYNW9BryMfbshrRX00TqbSwGot');


const CartItems = () => {
    const { all_product, cartItems, removeFromCart, updateCart, getTotalCartAmount } = useContext(ShopContext);
    const [paymentStatus, setPaymentStatus] = useState(null);

    const handlePayment = async () => {
        const stripe = await stripePromise;
    
        // Filter cart items to include only those with quantity > 0
        const filteredCartItems = Object.entries(cartItems).reduce((acc, [key, value]) => {
            if (value > 0) {
                acc[key] = value;
            }
            return acc;
        }, {});
    
        console.log(filteredCartItems, getTotalCartAmount());
    
        // Fetch product details for each item in the cart
        const getProductDetailsForCart = async () => {
            try {
                const productDetails = await Promise.all(Object.entries(filteredCartItems).map(async ([productId, quantity]) => {
                    const product = all_product.find(product => parseInt(product.id) === parseInt(productId)); // Convert both ids to integers
                    if (product) {
                        return {
                            _id: product._id,
                            id: productId,
                            quantity:parseInt(quantity),
                            name: product.name,
                            imageUrl: product.imageUrl.replace(/^blob:/, ''),
                            new_price: product.new_price,
                        };
                    }
                    return null;
                }));
                console.log('Product details fetched successfully:', productDetails);
                return productDetails.filter(product => product !== null);
            } catch (error) {
                console.error('Error fetching product details:', error);
                return []; // Return an empty array in case of error
            }
        };
        
    
        const cartItemsWithProductDetails = await getProductDetailsForCart();
        console.log(cartItemsWithProductDetails);
    
        // Fetch the client secret from the server
        const response = await fetch(`${SERVER}create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cartItems: cartItemsWithProductDetails, totalAmount: getTotalCartAmount() }),
        });
        try {
            // Send the session ID back to the client
            const { sessionId, error } = await response.json();
        
            // If an error is returned from the server, handle it
            if (error) {
                console.error('Error creating payment intent:', error);
                // Handle the error here (e.g., display an error message to the user)
            } else {
                // Redirect to Stripe checkout page
                const { error } = await stripe.redirectToCheckout({
                    sessionId: sessionId,
                });
        
                if (error) {
                    console.error('Error redirecting to checkout:', error);
                    // Handle the error here (e.g., display an error message to the user)
                } else {
                    setPaymentStatus('processing'); // Set payment status to processing while waiting for payment result
                }
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            // Handle parsing error here (e.g., display an error message to the user)
        }
    }
        
    
    return (
        <div className='cart-Items'>
            <div className="CartItems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="CartItems-format CartItems-format-main">
                                <img src={e.imageUrl} alt="" className="CartIcon-product-icon" />
                                <p>{e.name}</p>
                                <p>${e.new_price}</p>
                                {/* Replace button with CartItem component */}
                                <CartItem itemId={e.id} initialQuantity={cartItems[e.id]} updateCart={updateCart} />
                                <p>${e.new_price * cartItems[e.id]}</p>
                                <img className='CartItems-remove-icon' src={remove_icon} onClick={() => { removeFromCart(e.id) }} alt="" />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="CartItems-down">
                <div className="CartItems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="CartItems-total-item">
                            <p>SubTotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="CartItems-total-item">
                            <p>Shipping Fee</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="CartItems-total-item">
                            <h3>Total</h3>
                            <h3>${getTotalCartAmount()}</h3>
                        </div>
                    </div>
                    <button onClick={handlePayment}>PROCEED TO CHECKOUT</button>
                </div>
                <div className="CartItems-promoCode">
                    <p>If you have a promo code, enter it here</p>
                    <div className="CartItems-promobox">
                        <input type="text" placeholder='Promo Code' />
                        <button onClick={handlePayment}>Proceed to Payment</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItems;
