import React, { useContext } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext'
import dropdown_icon from '../Components/Assets/dropdown_icon.png'
import Item from '../Components/Item/Item'

const ShopCategory = (props) => {
    const {all_product} = useContext(ShopContext);
    return (
        <div className='Shop-category'>
            <img className='shop-category-banner' src={props.banner} alt="" />
            <div className="shop-category-indexSort">
                <p>
                    <span>Showing 1-12 </span>
                    Out of 36 Products
                </p>
                <div className="shop-category-sort">
                    Sort by <img src={dropdown_icon} alt="" />
                </div>
            </div>
            <div className="shop-category-products">
                {all_product.map((item, i) => {
                    if (props.category === item.category) {
                        return <Item key={i} id={item.id} name={item.name} image={item.imageUrl} new_price={item.new_price} old_price={item.old_price} />
                    }
                    else {
                        return null;
                    }
                })}
            </div>
            <div className="shop-category-loadmore">
                Explore More
            </div>
        </div >
    )
}

export default ShopCategory