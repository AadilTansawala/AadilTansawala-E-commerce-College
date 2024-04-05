import React, { useState } from 'react';
import "./CartItem.css"

function CartItem({ itemId, initialQuantity, updateCart }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (event) => {
    setQuantity(event.target.value);
  };

  const handleButtonClick = () => {
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Update the quantity using updateCart function
    updateCart(itemId, quantity);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <>
      {isEditing ? (
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      ) : (
        <button className="CartItems-quantity" onClick={handleButtonClick}>
          {quantity}
        </button>
      )}
    </>
  );
}

export default CartItem;
