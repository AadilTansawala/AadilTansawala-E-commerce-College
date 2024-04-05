import { useState } from "react";
import "./ProductEditForm.css";

// eslint-disable-next-line react/prop-types
const ProductEditForm = ({ product, onClose }) => {
  const [image, setImage] = useState(null);
  const [editedProduct, setEditedProduct] = useState({ ...product });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id", editedProduct.id);
      formData.append("name", editedProduct.name);
      formData.append("category", editedProduct.category);
      formData.append("new_price", editedProduct.new_price);
      formData.append("old_price", editedProduct.old_price);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "https://aadiltansawala-e-commerce-college-api.onrender.com/updateproduct",
        {
          method: "PUT",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Response from update product API:", data);
      onClose(); // Close the form after submitting
    } catch (error) {
      console.error("Error updating product:", error);
      // Handle error here (e.g., show error message)
    }
  };

  return (
    <div className="add-product">
      <div className="add-product-itemField">
        <p>Product Title</p>
        <input
          value={editedProduct.name}
          onChange={handleChange}
          type="text"
          name="name"
          placeholder="Type Here.."
        />
      </div>

      <div className="add-product-price">
        <div className="add-product-itemField">
          <p>Price</p>
          <input
            value={editedProduct.old_price}
            onChange={handleChange}
            type="text"
            name="old_price"
            placeholder="Type Here.."
          />
        </div>
        <div className="add-product-itemField">
          <p>Offer Price</p>
          <input
            value={editedProduct.new_price}
            onChange={handleChange}
            type="text"
            name="new_price"
            placeholder="Type Here.."
          />
        </div>
      </div>

      <div className="add-product-itemField">
        <p>Product Category</p>
        <select
          value={editedProduct.category}
          onChange={handleChange}
          name="category"
          className="add-product-selector"
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      {/* Input field for selecting image */}
      <div className="add-product-itemField">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : editedProduct.imageUrl}
            className="add-product-thumbnail-img"
            alt=""
          />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>
      {/* Button to add product */}
      <button onClick={handleSubmit} className="add-product-button">
        Save
      </button>
      <button onClick={onClose} className="add-product-button">
        Cancel
      </button>
    </div>
  );
};

export default ProductEditForm;
