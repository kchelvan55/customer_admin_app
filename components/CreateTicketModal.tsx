import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import { Order, Product, ProductInCart, TicketIssue, IssueType } from '../types';
import { ISSUE_TYPES, MOCK_PRODUCTS } from '../constants'; // Import MOCK_PRODUCTS

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSaveTicket: (orderId: string, issues: TicketIssue[]) => void;
  products: Product[]; // Full product list from App.tsx (MOCK_PRODUCTS)
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ 
    isOpen, 
    onClose, 
    order, 
    onSaveTicket,
    products // This is MOCK_PRODUCTS passed from App.tsx
}) => {
  const [currentIssuesForTicket, setCurrentIssuesForTicket] = useState<TicketIssue[]>([]);
  const [isAddingNewIssue, setIsAddingNewIssue] = useState<boolean>(false);

  // Form state for a new issue
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | ''>('');
  const [issueDescription, setIssueDescription] = useState<string>(''); // Only for "Order Delay"
  const [selectedProductsForIssue, setSelectedProductsForIssue] = useState<string[]>([]); // For multi-select (ordered items)
  const [selectedSingleProductForIssue, setSelectedSingleProductForIssue] = useState<string>(''); // For single-select (Incorrect Quantity)
  const [quantityReceived, setQuantityReceived] = useState<string>('');

  // New states for "Incorrect item"
  const [searchReceivedItemQuery, setSearchReceivedItemQuery] = useState<string>('');
  const [selectedReceivedInsteadItems, setSelectedReceivedInsteadItems] = useState<string[]>([]);

  // New state for "Damaged item"
  const [damagedItemPhotos, setDamagedItemPhotos] = useState<File[]>([]);
  const damagedPhotoInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!isOpen) {
      setCurrentIssuesForTicket([]);
      setIsAddingNewIssue(false);
      resetIssueForm();
    } else if (isOpen && order) {
        setCurrentIssuesForTicket([]);
        setIsAddingNewIssue(false);
        resetIssueForm();
    }
  }, [isOpen, order]);

  const resetIssueForm = () => {
    setSelectedIssueType('');
    setIssueDescription('');
    setSelectedProductsForIssue([]);
    setSelectedSingleProductForIssue('');
    setQuantityReceived('');
    setSearchReceivedItemQuery('');
    setSelectedReceivedInsteadItems([]);
    setDamagedItemPhotos([]);
    if (damagedPhotoInputRef.current) {
        damagedPhotoInputRef.current.value = "";
    }
  };

  const handleAddIssueClick = () => {
    setIsAddingNewIssue(true);
    resetIssueForm();
  };

  const handleSubmitCurrentIssue = () => {
    if (!selectedIssueType) {
      alert('Please select an issue type.');
      return;
    }

    let newIssue: Partial<TicketIssue> = { 
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        issueType: selectedIssueType 
    };
    let isValid = true;

    switch (selectedIssueType) {
      case 'Order Delay':
        if (!issueDescription.trim()) {
          alert('Please describe the issue.');
          isValid = false;
        } else {
          newIssue.issueDescription = issueDescription.trim();
        }
        break;
      case 'Missing Item':
        if (selectedProductsForIssue.length === 0) {
          alert('Please select the item(s) that is missing.');
          isValid = false;
        } else {
          newIssue.relatedProductIds = selectedProductsForIssue;
        }
        break;
      case 'Incorrect item':
        if (selectedProductsForIssue.length === 0) {
          alert('Please select the ordered item(s) that were incorrect.');
          isValid = false;
        } else if (selectedReceivedInsteadItems.length === 0) {
          alert('Please select the item(s) you received instead.');
          isValid = false;
        } else {
          newIssue.relatedProductIds = selectedProductsForIssue;
          newIssue.receivedInsteadProductIds = selectedReceivedInsteadItems;
        }
        break;
      case 'Damaged item':
        if (selectedProductsForIssue.length === 0) {
          alert('Please select the item(s) that is damaged.');
          isValid = false;
        } else {
          newIssue.relatedProductIds = selectedProductsForIssue;
          newIssue.damagedItemPhotoNames = damagedItemPhotos.map(file => file.name);
        }
        break;
      case 'Incorrect quantity':
        const orderItem = order?.items.find(item => item.id === selectedSingleProductForIssue);
        if (!selectedSingleProductForIssue || !orderItem) {
          alert('Please select the item with incorrect quantity.');
          isValid = false;
        } else {
          const receivedQty = parseInt(quantityReceived, 10);
          if (isNaN(receivedQty) || receivedQty < 1 || receivedQty >= orderItem.quantity) {
            alert(`Quantity received must be a number between 1 and ${orderItem.quantity - 1}.`);
            isValid = false;
          } else {
            newIssue.singleRelatedProductId = selectedSingleProductForIssue;
            newIssue.quantityInOrder = orderItem.quantity;
            newIssue.quantityReceived = receivedQty;
          }
        }
        break;
      default:
        isValid = false; 
    }

    if (isValid && newIssue.id && newIssue.issueType) {
      setCurrentIssuesForTicket(prev => [...prev, newIssue as TicketIssue]);
      setIsAddingNewIssue(false); 
      resetIssueForm();
    }
  };

  const handleSaveFullTicket = () => {
    if (!order) return;
    if (currentIssuesForTicket.length === 0) {
        alert("Please add at least one issue to create a ticket.");
        return;
    }
    onSaveTicket(order.id, currentIssuesForTicket);
  };

  const orderItemsForDropdown = useMemo(() => {
    return order?.items || [];
  }, [order]);

  const itemsForIncorrectQuantityDropdown = useMemo(() => {
    return order?.items.filter(item => item.quantity > 1) || [];
  }, [order]);
  
  const selectedOrderItemForIncorrectQuantity = useMemo(() => {
    if (selectedIssueType === 'Incorrect quantity' && selectedSingleProductForIssue && order) {
        return order.items.find(item => item.id === selectedSingleProductForIssue);
    }
    return null;
  }, [selectedIssueType, selectedSingleProductForIssue, order]);

  const filteredReceivedItemsSearch = useMemo(() => {
    if (!searchReceivedItemQuery) return products; // Using MOCK_PRODUCTS from props
    return products.filter(p => 
      p.name.toLowerCase().includes(searchReceivedItemQuery.toLowerCase())
    );
  }, [searchReceivedItemQuery, products]);

  const handleDamagedPhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setDamagedItemPhotos(prev => [...prev, ...Array.from(event.target.files as FileList)]);
    }
  };

  const removeDamagedPhoto = (fileName: string) => {
    setDamagedItemPhotos(prev => prev.filter(file => file.name !== fileName));
     if (damagedPhotoInputRef.current) {
        damagedPhotoInputRef.current.value = ""; // Reset file input
    }
  };


  if (!isOpen || !order) return null;

  const renderIssueForm = () => (
    <div className="space-y-4 my-4 p-3 border border-neutral-DEFAULT rounded-md bg-neutral-lightest">
      <div>
        <label htmlFor="issueType" className="block text-sm font-medium text-neutral-darker">Issue type:</label>
        <select
          id="issueType"
          value={selectedIssueType}
          onChange={(e) => {
            setSelectedIssueType(e.target.value as IssueType | '');
            resetIssueForm(); // Reset all conditional fields when type changes
            setSelectedIssueType(e.target.value as IssueType | ''); // Re-set after reset
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-DEFAULT focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        >
          <option value="">Select an issue type</option>
          {ISSUE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {selectedIssueType === 'Order Delay' && (
        <div>
          <label htmlFor="issueDescriptionDelay" className="block text-sm font-medium text-neutral-darker">What is the issue:</label>
          <textarea
            id="issueDescriptionDelay"
            rows={3}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-DEFAULT rounded-md focus:ring-primary focus:border-primary"
            placeholder="e.g., My order has not arrived yet."
          />
        </div>
      )}

      {selectedIssueType === 'Missing Item' && (
         <div>
            <label htmlFor="relatedProductsMissing" className="block text-sm font-medium text-neutral-darker">Item(s) that is missing:</label>
            <select
              id="relatedProductsMissing"
              multiple
              value={selectedProductsForIssue}
              onChange={(e) => setSelectedProductsForIssue(Array.from(e.target.selectedOptions, option => option.value))}
              className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-DEFAULT rounded-md focus:ring-primary focus:border-primary h-24"
            >
              {orderItemsForDropdown.map(item => (
                <option key={item.id} value={item.id}>{item.name} (Qty Ordered: {item.quantity})</option>
              ))}
            </select>
            <p className="text-xs text-neutral-dark mt-1">Hold Ctrl (or Cmd on Mac) to select multiple items.</p>
          </div>
      )}

      {selectedIssueType === 'Incorrect item' && (
        <>
          <div>
            <label htmlFor="relatedProductsIncorrect" className="block text-sm font-medium text-neutral-darker">Ordered item(s) that were incorrect:</label>
            <select
              id="relatedProductsIncorrect"
              multiple
              value={selectedProductsForIssue}
              onChange={(e) => setSelectedProductsForIssue(Array.from(e.target.selectedOptions, option => option.value))}
              className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-DEFAULT rounded-md focus:ring-primary focus:border-primary h-24"
            >
              {orderItemsForDropdown.map(item => (
                <option key={item.id} value={item.id}>{item.name} (Qty Ordered: {item.quantity})</option>
              ))}
            </select>
            <p className="text-xs text-neutral-dark mt-1">Hold Ctrl (or Cmd on Mac) to select multiple items.</p>
          </div>
          <div>
            <label htmlFor="receivedInsteadItems" className="block text-sm font-medium text-neutral-darker mt-3">Item(s) received instead:</label>
            <input 
                type="text"
                placeholder="Search for received item..."
                value={searchReceivedItemQuery}
                onChange={(e) => setSearchReceivedItemQuery(e.target.value)}
                className="mt-1 mb-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-DEFAULT focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            />
            <select
              id="receivedInsteadItems"
              multiple
              value={selectedReceivedInsteadItems}
              onChange={(e) => setSelectedReceivedInsteadItems(Array.from(e.target.selectedOptions, option => option.value))}
              className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-DEFAULT rounded-md focus:ring-primary focus:border-primary h-24"
            >
              {filteredReceivedItemsSearch.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
             <p className="text-xs text-neutral-dark mt-1">Hold Ctrl (or Cmd on Mac) to select multiple items.</p>
          </div>
        </>
      )}
      
      {selectedIssueType === 'Damaged item' && (
        <>
          <div>
            <label htmlFor="relatedProductsDamaged" className="block text-sm font-medium text-neutral-darker">Item(s) that is damaged:</label>
            <select
              id="relatedProductsDamaged"
              multiple
              value={selectedProductsForIssue}
              onChange={(e) => setSelectedProductsForIssue(Array.from(e.target.selectedOptions, option => option.value))}
              className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-DEFAULT rounded-md focus:ring-primary focus:border-primary h-24"
            >
              {orderItemsForDropdown.map(item => (
                <option key={item.id} value={item.id}>{item.name} (Qty Ordered: {item.quantity})</option>
              ))}
            </select>
            <p className="text-xs text-neutral-dark mt-1">Hold Ctrl (or Cmd on Mac) to select multiple items.</p>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-neutral-darker">Attach photo(s) of damaged item(s):</label>
            <Button 
                variant="ghost" 
                onClick={() => damagedPhotoInputRef.current?.click()} 
                className="mt-1 w-full justify-start border border-neutral-DEFAULT hover:bg-neutral-light px-3 py-2"
                leftIcon={<Icon name="camera" className="w-5 h-5"/>}
            >
                Add Photo(s)
            </Button>
            <input
              type="file"
              ref={damagedPhotoInputRef}
              multiple
              accept="image/*"
              onChange={handleDamagedPhotoSelect}
              className="hidden"
            />
            {damagedItemPhotos.length > 0 && (
              <div className="mt-2 space-y-1">
                {damagedItemPhotos.map(file => (
                  <div key={file.name} className="flex items-center justify-between text-xs bg-gray-100 p-1.5 rounded">
                    <span className="truncate">{file.name}</span>
                    <button onClick={() => removeDamagedPhoto(file.name)} className="ml-2 text-red-500 hover:text-red-700">
                      <Icon name="trash" className="w-3 h-3"/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}


      {selectedIssueType === 'Incorrect quantity' && (
        <>
          <div>
            <label htmlFor="relatedSingleProductQty" className="block text-sm font-medium text-neutral-darker">Issue related to:</label>
            <select
              id="relatedSingleProductQty"
              value={selectedSingleProductForIssue}
              onChange={(e) => setSelectedSingleProductForIssue(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-DEFAULT focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="">Select an item</option>
              {itemsForIncorrectQuantityDropdown.map(item => (
                <option key={item.id} value={item.id}>{item.name} (Ordered: {item.quantity})</option>
              ))}
            </select>
            {itemsForIncorrectQuantityDropdown.length === 0 && orderItemsForDropdown.length > 0 && (
                <p className="text-xs text-neutral-dark mt-1">No items in this order had a quantity greater than 1.</p>
            )}
          </div>
          {selectedOrderItemForIncorrectQuantity && (
            <>
              <p className="text-sm text-neutral-darker mt-2">Quantity in Order: <span className="font-semibold">{selectedOrderItemForIncorrectQuantity.quantity}</span></p>
              <div>
                <label htmlFor="quantityReceived" className="block text-sm font-medium text-neutral-darker mt-1">Quantity received:</label>
                <input
                  type="number"
                  id="quantityReceived"
                  value={quantityReceived}
                  onChange={(e) => setQuantityReceived(e.target.value)}
                  min="1"
                  max={selectedOrderItemForIncorrectQuantity.quantity > 1 ? selectedOrderItemForIncorrectQuantity.quantity - 1 : 1}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-DEFAULT rounded-md focus:ring-primary focus:border-primary"
                  disabled={selectedOrderItemForIncorrectQuantity.quantity <= 1}
                />
                 {selectedOrderItemForIncorrectQuantity.quantity <= 1 && 
                    <p className="text-xs text-red-500 mt-1">This item cannot have an incorrect quantity reported as only 1 was ordered. Consider 'Missing Item'.</p>
                 }
              </div>
            </>
          )}
        </>
      )}
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="ghost" onClick={() => { setIsAddingNewIssue(false); resetIssueForm(); }}>Cancel Adding</Button>
        <Button variant="primary" onClick={handleSubmitCurrentIssue} disabled={!selectedIssueType}>Submit Issue</Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create Support Ticket for Order #${order.id}`}
      footer={
        <div className="flex justify-between w-full">
          <Button variant="ghost" onClick={onClose}>Cancel Ticket</Button>
          <Button 
            variant="success" 
            onClick={handleSaveFullTicket}
            disabled={currentIssuesForTicket.length === 0}
          >
            Save Ticket ({currentIssuesForTicket.length} Issue{currentIssuesForTicket.length === 1 ? '' : 's'})
          </Button>
        </div>
      }
    >
      <div className="text-sm space-y-3 max-h-[70vh] overflow-y-auto">
        {currentIssuesForTicket.length > 0 && (
            <div className="mb-4">
                <h4 className="font-semibold text-neutral-darker mb-2">Current Issues for this Ticket:</h4>
                <ul className="space-y-2 list-disc list-inside pl-2 bg-neutral-lightest p-3 rounded-md">
                    {currentIssuesForTicket.map((issue) => {
                        const orderedProductNames = issue.relatedProductIds
                            ?.map(pid => order.items.find(item => item.id === pid)?.name)
                            .filter(name => !!name)
                            .join(', ');
                        const singleOrderedProductName = issue.singleRelatedProductId 
                            ? order.items.find(item => item.id === issue.singleRelatedProductId)?.name
                            : '';
                        const receivedInsteadProductNames = issue.receivedInsteadProductIds
                            ?.map(pid => products.find(prod => prod.id === pid)?.name)
                            .filter(name => !!name)
                            .join(', ');

                        return (
                            <li key={issue.id} className="text-xs text-neutral-dark">
                                <span className="font-medium">{issue.issueType}</span>
                                {issue.issueType === 'Order Delay' && issue.issueDescription && `: "${issue.issueDescription}"`}
                                {(issue.issueType === 'Missing Item' || issue.issueType === 'Damaged item') && orderedProductNames && `: ${orderedProductNames}`}
                                {issue.issueType === 'Incorrect item' && orderedProductNames && ` (Ordered: ${orderedProductNames})`}
                                {issue.issueType === 'Incorrect item' && receivedInsteadProductNames && ` (Received: ${receivedInsteadProductNames})`}
                                {issue.issueType === 'Incorrect quantity' && singleOrderedProductName && `: ${singleOrderedProductName}`}
                                {issue.issueType === 'Incorrect quantity' && issue.quantityInOrder !== undefined && ` (Ordered: ${issue.quantityInOrder}, Received: ${issue.quantityReceived})`}
                                {issue.issueType === 'Damaged item' && issue.damagedItemPhotoNames && issue.damagedItemPhotoNames.length > 0 && ` (Photos: ${issue.damagedItemPhotoNames.join(', ')})`}
                            </li>
                        );
                    })}
                </ul>
            </div>
        )}

        {isAddingNewIssue ? (
          renderIssueForm()
        ) : (
          <Button 
            variant="primary" 
            onClick={handleAddIssueClick} 
            leftIcon={<Icon name="plus" className="w-4 h-4"/>}
            className="w-full"
          >
            Add an issue
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default CreateTicketModal;