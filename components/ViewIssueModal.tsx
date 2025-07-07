import React from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import { TicketIssue, Product, ProductInCart } from '../types';

interface ViewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: (TicketIssue & {
    ticketId: string;
    orderId: string;
    ticketCreatedAt: string;
    ticketStatus: string;
  }) | null;
  orderItems: ProductInCart[];
  allProducts: Product[];
  formatDate: (dateString?: string | Date) => string;
}

const ViewIssueModal: React.FC<ViewIssueModalProps> = ({ 
    isOpen, 
    onClose, 
    issue,
    orderItems,
    allProducts,
    formatDate 
}: ViewIssueModalProps) => {
  if (!isOpen || !issue) return null;

  const getProductName = (productId: string, fromOrder: boolean = true): string => {
    const sourceList = fromOrder ? orderItems : allProducts;
    const product = sourceList.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getProductDetails = (productId: string, fromOrder: boolean = true): ProductInCart | Product | null => {
    const sourceList = fromOrder ? orderItems : allProducts;
    const product = sourceList.find(p => p.id === productId);
    return product || null;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'text-red-600';
      case 'In Progress': return 'text-yellow-600';
      case 'Resolved': return 'text-green-600';
      case 'Closed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getQuickActions = (issueType: string) => {
    switch(issueType) {
      case 'Order Delay':
        return ['Contact Customer'];
      case 'Missing Item':
        return ['Contact Customer', 'Arrange Dues'];
      case 'Incorrect item':
        return ['Contact Customer', 'Arrange Exchange'];
      case 'Damaged item':
        return ['Contact Customer', 'Arrange Dues'];
      case 'Incorrect quantity':
        return ['Contact Customer', 'Arrange Dues'];
      default:
        return ['Contact Customer'];
    }
  };

  const getActionButtonStyle = (action: string) => {
    if (action.includes('Exchange')) {
      return 'text-xs bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded border border-purple-300 transition-colors';
    } else if (action.includes('Dues')) {
      return 'text-xs bg-orange-100 hover:bg-orange-200 px-3 py-2 rounded border border-orange-300 transition-colors';
    } else {
      return 'text-xs bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded border border-blue-300 transition-colors';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Issue Details - ${issue.issueType}`}
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="text-sm text-neutral-darker space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Ticket Information */}
        <div className="bg-neutral-lightest p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Ticket ID:</strong> <span className="break-all">#{issue.ticketId}</span></p>
              <p><strong>Order ID:</strong> #{issue.orderId}</p>
            </div>
            <div>
              <p><strong>Reported:</strong> {formatDate(issue.ticketCreatedAt)}</p>
              <p><strong>Status:</strong> <span className={`font-semibold ${getStatusColor(issue.ticketStatus)}`}>{issue.ticketStatus}</span></p>
            </div>
          </div>
        </div>

        {/* Issue Details */}
        <div className="border border-neutral-DEFAULT p-4 rounded-md bg-white shadow-sm">
          <div className="flex items-center mb-3">
            <Icon name="ticket" className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-semibold text-lg text-primary">{issue.issueType}</h3>
          </div>
          
          <div className="space-y-3 pl-2 border-l-2 border-primary-light">
            {/* Order Delay Details */}
            {issue.issueType === 'Order Delay' && issue.issueDescription && (
              <div>
                <p className="font-medium text-neutral-darker mb-1">Customer Description:</p>
                <p className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 italic">
                  "{issue.issueDescription}"
                </p>
              </div>
            )}

            {/* Missing/Incorrect/Damaged Items */}
            {issue.relatedProductIds && issue.relatedProductIds.length > 0 && (
              <div>
                <p className="font-medium text-neutral-darker mb-2">
                  {issue.issueType === 'Missing Item' ? 'Missing Items:' : 
                   issue.issueType === 'Incorrect item' ? 'Ordered Items (Incorrect):' :
                   issue.issueType === 'Damaged item' ? 'Damaged Items:' : 
                   'Related Items:'}
                </p>
                <div className="space-y-2">
                  {issue.relatedProductIds.map(productId => {
                    const product = getProductDetails(productId, true);
                    return (
                      <div key={productId} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{getProductName(productId, true)}</p>
                            {product && (
                              <div className="text-xs text-neutral-dark mt-1">
                                <p>UOM: {product.uom} | Price: ${product.price.toFixed(2)}</p>
                                {'quantity' in product && <p>Ordered Quantity: {product.quantity}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Received Instead (for Incorrect item) */}
            {issue.issueType === 'Incorrect item' && issue.receivedInsteadProductIds && issue.receivedInsteadProductIds.length > 0 && (
              <div>
                <p className="font-medium text-neutral-darker mb-2">Items Received Instead:</p>
                <div className="space-y-2">
                  {issue.receivedInsteadProductIds.map(productId => {
                    const product = getProductDetails(productId, false);
                    return (
                      <div key={productId} className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{getProductName(productId, false)}</p>
                            {product && (
                              <div className="text-xs text-neutral-dark mt-1">
                                <p>UOM: {product.uom} | Price: ${product.price.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Damaged Item Photos */}
            {issue.issueType === 'Damaged item' && issue.damagedItemPhotoNames && issue.damagedItemPhotoNames.length > 0 && (
              <div>
                <p className="font-medium text-neutral-darker mb-2">Attached Photos:</p>
                <div className="flex flex-wrap gap-2">
                  {issue.damagedItemPhotoNames.map(photoName => (
                    <div key={photoName} className="bg-neutral-light px-3 py-2 rounded-md text-xs inline-flex items-center border">
                      <Icon name="camera" className="w-4 h-4 mr-2 text-neutral-dark"/>
                      <span className="font-mono">{photoName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incorrect Quantity Details */}
            {issue.issueType === 'Incorrect quantity' && issue.singleRelatedProductId && (
              <div>
                <p className="font-medium text-neutral-darker mb-2">Quantity Issue Details:</p>
                <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                  <p className="font-medium">{getProductName(issue.singleRelatedProductId, true)}</p>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Ordered Quantity:</span>
                      <span className="font-bold text-green-600">{issue.quantityInOrder}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Received Quantity:</span>
                      <span className="font-bold text-red-600">{issue.quantityReceived}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                      <span>Difference:</span>
                      <span className="font-bold text-orange-600">
                        {(issue.quantityInOrder || 0) - (issue.quantityReceived || 0)} short
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-blue-800 font-medium mb-2">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {getQuickActions(issue.issueType).map((action, index) => (
              <button 
                key={index}
                className={getActionButtonStyle(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewIssueModal; 