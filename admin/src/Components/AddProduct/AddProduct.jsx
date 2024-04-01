import { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../Assets/upload_area.svg";


const AddProduct = () => {
    const SERVER = "https://aadil-tansawala-e-commerce-college-api.vercel.app/";

    const [image, setImage] = useState(null);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
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
        try {
            let formData = new FormData();
            formData.append('product', image);
    
            console.log("FormData:", formData);
    
            const uploadResponse = await fetch(`${SERVER}upload`, {
                method: 'POST',
                body: formData,
            });
    
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }
    
            const uploadData = await uploadResponse.json();
    
            if (uploadData.success) {
                productDetails.image = uploadData.imageUrl;
    
                const addProductResponse = await fetch(`${SERVER}addproduct`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productDetails),
                });
    
                if (!addProductResponse.ok) {
                    throw new Error('Failed to add product');
                }
    
                const addProductData = await addProductResponse.json();
    
                addProductData.success ? alert("Product Added") : alert("Failed to add product");
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error('Error adding product:', error.message);
            alert('Error adding product: ' + error.message);
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

            <button onClick={() => {Add_Product()}} className="add-product-button">
                ADD
            </button>
        </div>
    );
}

export default AddProduct;
