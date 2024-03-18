import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'
import { SERVER } from '../../config'


const Popular = () => {

    const [popular_products , setPopular_products] = useState([]);

     // Fetch popular women products when the component mounts
     useEffect(() => {
        // Fetch popular women products from the server
        fetch(`${SERVER}popularinwomen`)
            .then((response) => response.json())
            .then((data) => {
                // Update state with fetched products
                setPopular_products(data);
            })
            .catch((error) => {
                // Handle any errors that occur during the fetch
                console.error('Error fetching all products:', error);
            });
    }, []); // Empty dependency array ensures the effect runs only once after the initial render

    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popular_products.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    )
}

export default Popular
