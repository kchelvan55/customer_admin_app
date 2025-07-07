
import React from 'react';
import { Page, IconName, DEFAULT_LOGGED_IN_ADMIN_STAFF } from '../types';
import Icon from './Icon';

interface AdminNavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  className?: string; // For adding specific class for print styles
}

const AdminNavItem: React.FC<{
  label: string;
  iconName: IconName;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ label, iconName, isActive, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-150 ${
        isActive 
          ? 'bg-primary-dark text-white' 
          : 'text-neutral-light hover:bg-primary-light hover:text-white'
      } ${className}`}
      aria-label={label}
    >
      <Icon name={iconName} className="w-5 h-5" />
      <span className={`text-sm ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
};

const AdminNavbar: React.FC<AdminNavbarProps> = ({ currentPage, onNavigate, className }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 bg-neutral-darker text-white shadow-lg z-50 ${className || ''}`}>
      <div className="max-w-screen-xl mx-auto h-14 flex justify-between items-center px-3 sm:px-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-lg font-semibold text-white">Admin Panel</span>
           <AdminNavItem
            label="Dashboard"
            iconName="layoutGrid"
            isActive={currentPage === Page.ADMIN_DASHBOARD}
            onClick={() => onNavigate(Page.ADMIN_DASHBOARD)}
          />
          <AdminNavItem
            label="Orders"
            iconName="packageCheck"
            isActive={currentPage === Page.ADMIN_ORDER_MANAGEMENT || currentPage === Page.ADMIN_VIEW_ORDER_PDF || currentPage === Page.ADMIN_PRINT_ORDERS_PDF}
            onClick={() => onNavigate(Page.ADMIN_ORDER_MANAGEMENT)}
          />
          <AdminNavItem
            label="Users"
            iconName="user"
            isActive={currentPage === Page.ADMIN_USER_MANAGEMENT}
            onClick={() => onNavigate(Page.ADMIN_USER_MANAGEMENT)}
          />
          <AdminNavItem
            label="Products"
            iconName="list"
            isActive={currentPage === Page.ADMIN_PRODUCT_CATALOG}
            onClick={() => onNavigate(Page.ADMIN_PRODUCT_CATALOG)}
          />
          <AdminNavItem
            label="Support"
            iconName="ticket"
            isActive={currentPage === Page.ADMIN_SUPPORT_TICKETS}
            onClick={() => onNavigate(Page.ADMIN_SUPPORT_TICKETS)}
          />
          {/* Add more admin nav items here as sections are built */}
        </div>
        <div className="flex items-center space-x-2 text-sm text-neutral-light">
          <Icon name="user" className="w-5 h-5" />
          <span>{DEFAULT_LOGGED_IN_ADMIN_STAFF}</span>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;