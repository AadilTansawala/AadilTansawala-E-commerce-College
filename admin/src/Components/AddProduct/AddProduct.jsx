import { useState, useEffect } from "react";
import upload_area from "../../Assets/upload_area.svg";

const AddProduct = () => {
    const [image, setImage] = useState(null);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "", // Initialize image property with an empty string
        category: "men",
        new_price: "",
        old_price: ""
    });

    const imageHandler = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
                setImage(reader.result);
                // Set the base64 encoded image data to the productDetails state
                setProductDetails({ ...productDetails, image: reader.result });
            };
        }
    };
    

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const Add_Product = async () => {
        try {
            // Ensure that the image is selected
            if (!image) {
                alert("Please select an image.");
                return;
            }
    
            // Send a POST request to add the product
            const addProductResponse = await fetch('https://aadiltansawala-e-commerce-college-api.onrender.com/addproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productDetails),
            });
    
            // Parse the response JSON data for adding the product
            const addProductData = await addProductResponse.json();
    
            // Display success or failure message based on response
            addProductData.success ? alert("Product Added") : alert("Failed");
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };
    

    useEffect(() => {
        console.log("Updated product details:", productDetails);
    }, [productDetails]); // Log the updated product details whenever productDetails changes

    return (
        <div className="add-product">
            {/* Input fields for product details */}
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

            {/* Input field for selecting image */}
            <div className="add-product-itemField">
                <label htmlFor="file-input">
                    <img src={image ? image : upload_area} className="add-product-thumbnail-img" alt="" />
                </label>
                <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
            </div>

            {/* Button to add product */}
            <button onClick={Add_Product} className="add-product-button">
                ADD
            </button>
        </div>
    );
}

export default AddProduct;
