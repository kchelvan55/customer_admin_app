
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductPageMode } from '../types';
import Button from './Button';
import Icon from './Icon';

interface ProductListItemProps {
  product: Product;
  productPageMode: ProductPageMode;
  showImage: boolean;

  // Order Mode Specific
  isPendingOrderQuantityForThisItem: boolean;
  orderCartQuantity: number; 
  onInitiateOrderQuantityEntry: (productId: string, currentQuantity?: number) => void;
  onConfirmOrderQuantity: (productId: string, quantity: number) => void;
  onCancelOrderQuantityEntry: () => void;
  onRemoveFromOrderCart: (productId: string) => void;
  
  // Template Mode Specific
  isPendingTemplateQuantityForThisItem: boolean;
  templateDraftQuantity: number;
  onInitiateTemplateQuantityEntry: (productId: string, currentQuantity?: number) => void;
  onConfirmTemplateQuantity: (productId: string, quantity: number) => void;
  onCancelTemplateQuantityEntry: () => void;
  onRemoveFromTemplateDraft: (productId: string) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ 
  product, 
  productPageMode,
  showImage,
  isPendingOrderQuantityForThisItem,
  orderCartQuantity,
  onInitiateOrderQuantityEntry,
  onConfirmOrderQuantity,
  onCancelOrderQuantityEntry,
  onRemoveFromOrderCart,
  isPendingTemplateQuantityForThisItem,
  templateDraftQuantity,
  onInitiateTemplateQuantityEntry,
  onConfirmTemplateQuantity,
  onCancelTemplateQuantityEntry,
  onRemoveFromTemplateDraft,
}) => {
  const [internalQuantityString, setInternalQuantityString] = useState<string>('');
  const quantityInputRef = useRef<HTMLInputElement>(null);

  const isPendingQuantityForThisItem = productPageMode === 'ORDER' ? isPendingOrderQuantityForThisItem : isPendingTemplateQuantityForThisItem;
  const currentModeQuantityInCollection = productPageMode === 'ORDER' ? orderCartQuantity : templateDraftQuantity;
  const isInCollection = currentModeQuantityInCollection > 0;

  useEffect(() => {
    if (isPendingQuantityForThisItem) {
      setInternalQuantityString(isInCollection ? String(currentModeQuantityInCollection) : ''); 
      setTimeout(() => quantityInputRef.current?.focus(), 0); 
    } else {
      setInternalQuantityString(''); // Clear if not pending for this item
    }
  }, [isPendingQuantityForThisItem, isInCollection, currentModeQuantityInCollection, product.id, productPageMode]);

  const handleConfirmClick = () => {
    const numQuantity = parseInt(internalQuantityString, 10);
    const finalQuantity = isNaN(numQuantity) || numQuantity <= 0 ? 1 : numQuantity;
    if (productPageMode === 'ORDER') {
      onConfirmOrderQuantity(product.id, finalQuantity);
    } else {
      onConfirmTemplateQuantity(product.id, finalQuantity);
    }
    setInternalQuantityString(''); 
  };
  
  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalQuantityString(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmClick();
    }
  };

  const handleCancelClick = () => {
    if (productPageMode === 'ORDER') {
      onCancelOrderQuantityEntry();
    } else {
      onCancelTemplateQuantityEntry();
    }
    setInternalQuantityString('');
  };

  const cardMinHeight = showImage ? 'min-h-[4.5rem]' : 'min-h-[3.5rem]';

  const renderOrderModeControls = () => {
    if (isPendingOrderQuantityForThisItem) {
      return renderQuantityInputControls();
    }
    if (orderCartQuantity > 0) {
      return (
        <>
          <span className="text-sm text-neutral-darker mr-1">Qty: {orderCartQuantity}</span>
          <Button 
            onClick={() => onInitiateOrderQuantityEntry(product.id, orderCartQuantity)} 
            size="sm" variant="ghost" className="p-1 sm:p-1.5 text-primary hover:text-primary-dark" title="Edit quantity"
          >
            <Icon name="edit" className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button 
            onClick={() => onRemoveFromOrderCart(product.id)} 
            size="sm" variant="ghost" className="p-1 sm:p-1.5 text-red-500 hover:text-red-600" title="Remove from cart"
          >
            <Icon name="trash" className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </>
      );
    }
    return (
      <Button 
        onClick={() => onInitiateOrderQuantityEntry(product.id)} 
        size="sm" variant="primary" className="py-1 px-1.5 sm:py-1.5 sm:px-2" title="Add to cart"
      >
        <Icon name="shoppingCart" className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">To Cart</span>
      </Button>
    );
  };

  const renderTemplateModeControls = () => {
    if (isPendingTemplateQuantityForThisItem) {
      return renderQuantityInputControls();
    }
    if (templateDraftQuantity > 0) {
      return (
        <>
          <span className="text-sm text-neutral-darker mr-1">Qty: {templateDraftQuantity}</span>
          <Button 
            onClick={() => onInitiateTemplateQuantityEntry(product.id, templateDraftQuantity)} 
            size="sm" variant="ghost" className="p-1 sm:p-1.5 text-secondary hover:text-secondary-dark" title="Edit draft quantity"
          >
            <Icon name="edit" className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button 
            onClick={() => onRemoveFromTemplateDraft(product.id)} 
            size="sm" variant="ghost" className="p-1 sm:p-1.5 text-red-500 hover:text-red-600" title="Remove from draft"
          >
            <Icon name="trash" className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </>
      );
    }
    // Simplified "To Draft": directly add with quantity 1
    return (
      <Button 
        onClick={() => onConfirmTemplateQuantity(product.id, 1)} 
        size="sm" variant="secondary" className="py-1 px-1.5 sm:py-1.5 sm:px-2" title="Add to draft template"
      >
        <Icon name="plus" className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">To Draft</span>
      </Button>
    );
  };

  const renderQuantityInputControls = () => (
    <>
      <input
        ref={quantityInputRef}
        type="number"
        value={internalQuantityString}
        onChange={handleQuantityInputChange}
        onKeyDown={handleKeyDown}
        min="1"
        placeholder="Qty"
        className="w-12 sm:w-14 text-center border border-neutral-DEFAULT rounded-md py-1 text-sm bg-neutral-darker text-white placeholder-neutral-400 focus:ring-1 focus:ring-primary focus:border-primary"
        aria-label={`Quantity for ${product.name}`}
      />
      <Button 
          onClick={handleConfirmClick} 
          size="sm" 
          variant={productPageMode === 'ORDER' ? 'primary' : 'secondary'}
          className="p-1 sm:p-1.5"
          title="Confirm quantity"
      >
          <Icon name="checkCircle" className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
      <Button 
          onClick={handleCancelClick} 
          size="sm" 
          variant="ghost"
          className="p-1 sm:p-1.5 text-red-500"
          title="Cancel"
      >
          <Icon name="xCircle" className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden flex items-center p-2 sm:p-3 mb-3 ${cardMinHeight}`}>
      {showImage && (
        <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
        />
      )}
      <div className={`flex-grow min-w-0 ${showImage ? 'ml-2 sm:ml-3' : ''}`}>
        <h3 className="text-sm sm:text-base font-semibold text-neutral-darker mb-0.5 truncate" title={product.name}>{product.name}</h3>
        <p className="text-xs text-neutral-dark mb-1">{product.uom}</p>
      </div>
      <div className="flex-shrink-0 ml-auto flex items-center space-x-1 min-w-[110px] sm:min-w-[150px] justify-end"> {/* Increased min-w slightly for Qty display */}
        {productPageMode === 'ORDER' ? renderOrderModeControls() : renderTemplateModeControls()}
      </div>
    </div>
  );
};

export default ProductListItem;
