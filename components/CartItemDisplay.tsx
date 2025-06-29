
import React from 'react';
import { ProductInCart } from '../types';
import Button from './Button';
import Icon from './Icon';

interface CartItemDisplayProps {
  item: ProductInCart;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const CartItemDisplay: React.FC<CartItemDisplayProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity >= 1) {
      onUpdateQuantity(item.id, newQuantity);
    } else if (newQuantity <= 0) { // Ensure removing if quantity becomes 0 or less
        onRemoveItem(item.id);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      // Do nothing on empty string, let user type or use +/-
      // Optionally, treat as 1 or remove based on desired UX. Current design will handle 0 on blur/ +/- click.
      return; 
    }
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity)) {
      if (newQuantity <= 0) {
        onRemoveItem(item.id);
      } else {
        onUpdateQuantity(item.id, newQuantity);
      }
    }
  };
  
  const handleInputBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') { // If input is empty on blur, remove item
        onUpdateQuantity(item.id, 1); // Or default to 1
    } else {
        const newQuantity = parseInt(value, 10);
        if (isNaN(newQuantity) || newQuantity <= 0) {
             onUpdateQuantity(item.id, 1); // Or remove: onRemoveItem(item.id)
        }
    }
  };


  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow mb-3">
      <div className="flex-grow min-w-0 mr-2">
        <h4 className="text-md font-semibold text-neutral-darker truncate" title={item.name}>{item.name}</h4>
        <p className="text-sm text-neutral-dark">{item.uom}</p>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        <Button size="sm" variant="ghost" onClick={() => handleQuantityChange(-1)} className="p-1" disabled={item.quantity <=1}>
          <Icon name="minus" className="w-4 h-4" />
        </Button>
        <input
          type="number"
          value={item.quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur} // Handle blur to ensure quantity is valid
          min="1"
          className="w-12 text-center border border-neutral-DEFAULT rounded-md py-0.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-neutral-darker text-white placeholder-neutral-400"
          aria-label={`Quantity for ${item.name}`}
        />
        <Button size="sm" variant="ghost" onClick={() => handleQuantityChange(1)} className="p-1">
          <Icon name="plus" className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="danger" onClick={() => onRemoveItem(item.id)} className="p-1 ml-1"> {/* Added ml-1 for slight spacing */}
          <Icon name="trash" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItemDisplay;
