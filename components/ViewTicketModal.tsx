
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import { SupportTicket, TicketIssue, Product, ProductInCart } from '../types';

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  orderItems: ProductInCart[]; // Items from the specific order this ticket is for
  allProducts: Product[]; // All available products (e.g., MOCK_PRODUCTS)
  formatDate: (dateString?: string | Date) => string;
}

const ViewTicketModal: React.FC<ViewTicketModalProps> = ({ 
    isOpen, 
    onClose, 
    ticket, 
    orderItems,
    allProducts,
    formatDate 
}) => {
  if (!isOpen || !ticket) return null;

  const getProductName = (productId: string, fromOrder: boolean = true): string => {
    const sourceList = fromOrder ? orderItems : allProducts;
    const product = sourceList.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Support Ticket Details (ID: ${ticket.id})`}
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="text-sm text-neutral-darker space-y-3 max-h-[70vh] overflow-y-auto">
        <div className="bg-neutral-lightest p-3 rounded-md">
            <p><strong>Order ID:</strong> #{ticket.orderId}</p>
            <p><strong>Ticket Created:</strong> {formatDate(ticket.createdAt)}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${
                ticket.status === 'Open' ? 'text-red-600' :
                ticket.status === 'In Progress' ? 'text-yellow-600' :
                'text-green-600'
            }`}>{ticket.status}</span></p>
        </div>

        <h4 className="font-semibold text-neutral-darker mt-4 mb-2">Reported Issues ({ticket.issues.length}):</h4>
        {ticket.issues.length > 0 ? (
          <ul className="space-y-3">
            {ticket.issues.map((issue, index) => (
              <li key={issue.id} className="border border-neutral-DEFAULT p-3 rounded-md bg-white shadow-sm">
                <p className="font-medium text-primary mb-1">Issue #{index + 1}: {issue.issueType}</p>
                <div className="text-xs text-neutral-dark space-y-0.5 pl-2 border-l-2 border-primary-light">
                  {issue.issueType === 'Order Delay' && issue.issueDescription && (
                    <p><strong>Description:</strong> {issue.issueDescription}</p>
                  )}
                  {issue.relatedProductIds && issue.relatedProductIds.length > 0 && (
                    <p>
                        <strong>
                            {issue.issueType === 'Missing Item' ? 'Missing Item(s): ' : 
                             issue.issueType === 'Incorrect item' ? 'Ordered Item(s) Incorrect: ' :
                             issue.issueType === 'Damaged item' ? 'Damaged Item(s): ' : 
                             'Related Item(s): '}
                        </strong> 
                        {issue.relatedProductIds.map(pid => getProductName(pid, true)).join(', ')}
                    </p>
                  )}
                  {issue.issueType === 'Incorrect item' && issue.receivedInsteadProductIds && issue.receivedInsteadProductIds.length > 0 && (
                    <p><strong>Item(s) Received Instead:</strong> {issue.receivedInsteadProductIds.map(pid => getProductName(pid, false)).join(', ')}</p>
                  )}
                  {issue.issueType === 'Damaged item' && issue.damagedItemPhotoNames && issue.damagedItemPhotoNames.length > 0 && (
                     <p className="flex items-center flex-wrap">
                        <strong className="mr-1">Attached Photo(s):</strong> 
                        {issue.damagedItemPhotoNames.map(name => (
                            <span key={name} className="bg-neutral-light px-1.5 py-0.5 rounded text-xs mr-1 mb-0.5 inline-flex items-center">
                                <Icon name="camera" className="w-3 h-3 mr-1"/>{name}
                            </span>
                        ))}
                    </p>
                  )}
                  {issue.issueType === 'Incorrect quantity' && issue.singleRelatedProductId && (
                    <>
                      <p><strong>Item:</strong> {getProductName(issue.singleRelatedProductId, true)}</p>
                      <p><strong>Quantity in Order:</strong> {issue.quantityInOrder}</p>
                      <p><strong>Quantity Received:</strong> {issue.quantityReceived}</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No issues reported in this ticket.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewTicketModal;
