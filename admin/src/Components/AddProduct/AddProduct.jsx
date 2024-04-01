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
        const selectedFile = e.target.files[0]; // Get the selected file
        console.log("Selected file:", selectedFile); // Log the selected file to check if it's captured correctly
        setImage(selectedFile); // Update the image state with the selected file
    };
    

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const Add_Product = async () => {
        try {
            let formData = new FormData();
            formData.append('product', image);
            formData.append('name', productDetails.name);
            formData.append('category', productDetails.category);
            formData.append('new_price', productDetails.new_price);
            formData.append('old_price', productDetails.old_price);

            console.log('FormData:', formData); // Log FormData object


            const uploadResponse = await fetch(`${SERVER}upload`, {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (uploadData.success) {
                setProductDetails({ // Update productDetails with the received image URL
                    ...productDetails,
                    image: uploadData.imageUrl
                });

                const addProductResponse = await fetch(`${SERVER}addproduct`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productDetails),
                });

                const addProductData = await addProductResponse.json();

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
            {/* Input fields for product details */}
            <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder="Product Title" />
            <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder="Price" />
            <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder="Offer Price" />
            <select value={productDetails.category} onChange={changeHandler} name="category" className="add-product-selector">
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kid">Kid</option>
            </select>

            {/* File input for image upload */}
            <label htmlFor="file-input">
                <img src={image ? URL.createObjectURL(image) : upload_area} className="add-product-thumbnail-img" alt="" />
            </label>
            <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />

            {/* Button to trigger product addition */}
            <button onClick={Add_Product} className="add-product-button">
                ADD
            </button>
        </div>
    );
}

export default AddProduct;
