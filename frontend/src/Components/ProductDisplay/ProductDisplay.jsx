import React, { useContext } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dull_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'

const ProductDisplay = (props) => {
    const {product} = props;
    const {addToCart} = useContext(ShopContext);

  return (
    <div className='product-dislay'>
      <div className="product-dislay-left">
        <div className="product-dislay-img-list">
            <img src={product.imageUrl} alt="" />
            <img src={product.imageUrl} alt="" />
            <img src={product.imageUrl} alt="" />
            <img src={product.imageUrl} alt="" />
        </div>
        <div className="product-dislay-img">
            <img className="product-dislay-main-img" src={product.imageUrl} alt=""  />
        </div>
      </div>
      <div className="product-dislay-right">
        <h1>{product.name}</h1>
        <div className="product-dislay-right-stars">
            <img src={star_icon} alt="" />
            <img src={star_icon} alt="" />
            <img src={star_icon} alt="" />
            <img src={star_icon} alt="" />
            <img src={star_dull_icon} alt="" />
            <p>(122)</p>
        </div>
        <div className="product-dislay-right-prices">
            <div className="product-dislay-right-price-old">${product.old_price}</div>
            <div className="product-dislay-right-price-new">${product.new_price}</div>
        </div>
        <div className="product-dislay-right-description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem impedit magni iure nostrum pariatur quos omnis, sed corrupti provident in quisquam non nulla maiores fugiat.
        </div>
        <div className="product-dislay-right-size">
            <h1>Select Size</h1>
            <div className="product-dislay-right-sizes">
                <div>S</div>
                <div>M</div>
                <div>L</div>
                <div>XL</div>
                <div>XXL</div>
            </div>
        </div>
        <button onClick={()=>{addToCart(product.id)}}>ADD TO CART</button>
        <p className="product-dislay-right-category"><span>Category : </span>Women , T-Shirt , Crop Top</p>
        <p className="product-dislay-right-category"><span>Tags : </span>Modern , Latest</p>
      </div>
    </div>
  )
}

export default ProductDisplay
