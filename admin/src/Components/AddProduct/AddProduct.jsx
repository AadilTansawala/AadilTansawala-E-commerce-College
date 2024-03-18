import { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../Assets/upload_area.svg";
import SERVER from "../../config";

const AddProduct = () => {
    const [image, setImage] = useState(null); // Initialize image state with null
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "", // Initialize image property with an empty string
        category: "men",
        new_price: "",
        old_price: ""
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
        console.log(image);// Update image state with the selected file
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const Add_Product = async () => {
        console.log(productDetails); // Logging before state update

        let responseData;

        let product = productDetails;
        let formData = new FormData();
        formData.append('product', image);

        try {
            await fetch(`${SERVER}/upload`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            }).then((resp) => resp.json()).then((data) => { responseData = data })

            if (responseData.success) {
                // Update productDetails with the image URL
                product.image = responseData.imageUrl;
                console.log(product);
                // Send a POST request to add the product
                const addProductResponse = await fetch(`${SERVER}/addproduct`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });

                // Parse the response JSON data for adding the product
                const addProductData = await addProductResponse.json();

                // Display success or failure message based on response
                addProductData.success ? alert("Product Added") : alert("Failed");
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };



    return (
        <div className="add-product">
            <div className="add-product-itemField">
                <p>Product Title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder="Type Here.." />
            </div>

            <div className="add-product-price">
                <div className="add-product-itemField">
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder="Type Here.." />
                </div>
                <div className="add-product-itemField">
                    <p>Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder="Type Here.." />
                </div>
            </div>

            <div className="add-product-itemField">
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler} name="category" className="add-product-selector">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kid">Kid</option>
                </select>
            </div>

            <div className="add-product-itemField">
                <label htmlFor="file-input">
                    <img src={image ? URL.createObjectURL(image) : upload_area} className="add-product-thumbnail-img" alt="" />
                </label>
                <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
            </div>

            <button onClick={() => { Add_Product() }} className="add-product-button">
                ADD
            </button>
        </div>
    );
}

export default AddProduct;
