import { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_Icon from "../../Assets/cross_icon.png";
import ProductEditForm from "../ProductEditForm/ProductEditForm"; // Assuming you have a ProductEditForm component

const ListProduct = () => {
  const SERVER = "https://aadiltansawala-e-commerce-college-api.onrender.com/";
  const [allproducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchInfo = async () => {
    try {
      const response = await fetch(`${SERVER}allproducts`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();

      // Fetch image data for each product
      const productsWithImages = await Promise.all(
        data.map(async (product) => {
          const imageResponse = await fetch(`${SERVER}images/${product._id}`);
          if (!imageResponse.ok) {
            throw new Error(
              `Failed to fetch image for product: ${product.name}`
            );
          }
          const imageData = await imageResponse.blob(); // Convert response to blob
          const imageUrl = URL.createObjectURL(imageData); // Create image URL from blob
          return { ...product, imageUrl }; // Add imageUrl to product object
        })
      );

      setAllProducts(productsWithImages);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Handle the error (e.g., show a message to the user)
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    try {
      await fetch(`${SERVER}removeproduct`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      await fetchInfo();
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  // Function to handle selecting a product for editing
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
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
        {allproducts.map((product, index) => {
          return (
            <>
              <div
                key={index}
                className="list-product-format-main list-product-format"
                onClick={() => handleEditProduct(product)} // Call handleEditProduct when product is clicked
              >
                <img
                  className="list-product-product-icon"
                  src={product.imageUrl}
                  alt={product.name}
                />

                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <img
                  onClick={() => {
                    remove_product(product.id);
                  }}
                  src={cross_Icon}
                  alt=""
                  className="list-product-remove-icon"
                />
              </div>
              <hr />
            </>
          );
        })}
      </div>
      {/* Render ProductEditForm when a product is selected for editing */}
      {selectedProduct && (
        <ProductEditForm
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)} // Close the form when onClose is called
        />
      )}
    </div>
  );
};

export default ListProduct;
