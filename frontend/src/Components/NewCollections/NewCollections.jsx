import React, { useState , useEffect} from 'react'
import './NewCollections.css'
import Item from '../Item/Item'
const NewCollections = () => {

    const SERVER = "https://aadil-tansawala-e-commerce-college-api.vercel.app/";
    const [new_collection , setNew_collection] = useState([]);

     // Fetch new products when the component mounts
     useEffect(() => {
        // Fetch new products from the server
        fetch(`${SERVER}newcollections`)
            .then((response) => response.json())
            .then((data) => {
                // Update state with fetched products
                setNew_collection(data);
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch
                console.error('Error fetching all products:', error);
            });
    }, []); // Empty dependency array ensures the effect runs only once after the initial render

    return (
        <div className='new-collections'>
            <h1>NEW COLLECTIONS</h1>
            <hr />
            <div className="new-collections-item">
                {new_collection.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    )
}

export default NewCollections
