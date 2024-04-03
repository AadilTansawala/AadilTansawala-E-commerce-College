import { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../Assets/upload_area.svg";

const AddProduct = () => {
    const [image, setImage] = useState(null);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category: "men",
        new_price: "",
        old_price: ""
    });

    const imageHandler = (e) => {
        // Set the selected image file to the state
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        // Log the input field name and value
        console.log("Input field name:", e.target.name);
        console.log("Input field value:", e.target.value);
    
        // Update the productDetails state when other input fields change
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    
        // Log the updated productDetails state
        console.log("Updated product details:", productDetails);
    };
    

    const Add_Product = async () => {
        if (!image) {
            alert("Please select an image.");
            return;
        }

        const { name, category, new_price, old_price } = productDetails;

        if (!name || !new_price || !old_price) {
            alert("Please fill in all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('new_price', new_price);
        formData.append('old_price', old_price);
        formData.append('image', image); // Append the image file to the FormData object

        console.log(
            productDetails.name,
            productDetails.category,
            productDetails.new_price,
            productDetails.old_price,
            image
        );
        try {
            const response = await fetch('https://aadiltansawala-e-commerce-college-api.onrender.com/addproduct', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                alert("Product Added");
            } else {
                alert("Failed to add product.");
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert("An error occurred while adding the product.");
        }
    };
    

    return (
        <div className="add-product">
            <div className="add-product-itemField">
                <p>Product Title</p>
                <input value={productDetails.name} onChange={(e) => changeHandler(e)} type="text" name="name" placeholder="Type Here.." />

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
                    <img src={image ? URL.createObjectURL(image) : upload_area} className="add-product-thumbnail-img" alt="" />
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
