import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'


const Popular = () => {

    const SERVER = "https://aadiltansawala-e-commerce-college-api.onrender.com/";
    const [popular_products , setPopular_products] = useState([]);

     // Fetch popular women products when the component mounts
     useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all products from the server
                const response = await fetch(`${SERVER}popularinwomen`);
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
    
                setPopular_products(productsWithImages);
    
                
                }
            catch (error) {
                // Handle any errors that occur during the fetch
                console.error('Error fetching data:', error);
            }
        
        };

        fetchData(); // Call the fetchData function

        // Make sure to clean up any ongoing tasks if the component unmounts
        return () => {};
    }, []); // Empty dependency array ensures the effect runs only once after the initial render


    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popular_products.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.imageUrl} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    )
}

export default Popular
