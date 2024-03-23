import { useEffect, useState } from "react";
import "./ListProduct.css"
import cross_Icon from "../../Assets/cross_icon.png"



const ListProduct = () => {

    const SERVER = "http://localhost:4000/";
    const [allproducts, setAllProducts] = useState([]);

    const fetchInfo = async () => {
        try {
            const response = await fetch(`${SERVER}allproducts`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setAllProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            // Handle the error (e.g., show a message to the user)
        }
    };
    

    useEffect(() => {
        fetchInfo();
    }, [])

    const remove_product = async (id) => {
        try {
            await fetch(`${SERVER}removeproduct`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });
            await fetchInfo();
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };


    return (
        <div className="list-product">
            <h1>All Products List</h1>
            <div className="list-product-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>NewPrice</p>
                <p>Category</p>
                <p>Remove</p>
            </div>

            <div className="list-product-all-products">
                <hr />
                {allproducts.map((product,index)=>{
                    return <>
                     <div key={index} className="list-product-format-main list-product-format">
                        <img className="list-product-product-icon" src={product.image} alt="" />
                        <p>{product.name}</p>
                        <p>${product.old_price}</p>
                        <p>${product.new_price}</p>
                        <p>{product.category}</p>
                        <img onClick={() =>{remove_product(product.id)}} src={cross_Icon} alt="" className="list-product-remove-icon" />
                    </div>
                    <hr />
                    </>
            })}
                </div> 
        </div>
    );
}

export default ListProduct;
