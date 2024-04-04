import React, { useState , useEffect} from 'react'
import './NewCollections.css'
import Item from '../Item/Item'
const NewCollections = () => {

    const SERVER = "https://aadiltansawala-e-commerce-college-api.onrender.com/";
    const [new_collection , setNew_collection] = useState([]);

     // Fetch new products when the component mounts
     useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all products from the server
                const response = await fetch(`${SERVER}newcollections`);
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
    
                setNew_collection(productsWithImages);
    
                
                }
            catch (error) {
                // Handle any errors that occur during the fetch
                console.error('Error fetching data:', error);
            }
        
    
        fetchData(); // Call the fetchData function
    
    };

    fetchData(); // Call the fetchData function
}, []);
     // Empty dependency array ensures the effect runs only once after the initial render

    return (
        <div className='new-collections'>
            <h1>NEW COLLECTIONS</h1>
            <hr />
            <div className="new-collections-item">
                {new_collection.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.imageUrl} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    )
}

export default NewCollections
