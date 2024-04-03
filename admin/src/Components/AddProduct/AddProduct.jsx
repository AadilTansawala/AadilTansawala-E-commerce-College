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
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
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
        formData.append('image', image);
    
        // Log the Content-Type header
        console.log("Content-Type:", formData.getHeaders()['content-type']);
    
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

            <button onClick={Add_Product} className="add-product-button">
                ADD
            </button>
        </div>
    );
}

export default AddProduct;
