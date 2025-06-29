import React from 'react';
import { Page, IconName } from '../types';
import Icon from './Icon';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isViewingPastOrder?: boolean; // For highlighting Orders tab correctly
  className?: string; // Added for specific styling, e.g., print
}

const NavItem: React.FC<{
  label: string;
  iconName: IconName;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, iconName, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1 rounded-md transition-colors duration-150 relative w-1/4 ${
        isActive ? 'text-primary' : 'text-neutral-dark hover:text-primary-light'
      }`}
      aria-label={label}
    >
      <Icon name={iconName} className="w-6 h-6" /> {/* Reduced icon size */}
      <span className={`text-xs mt-0.5 ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
};


const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, isViewingPastOrder, className }) => {
  return (
    <nav className={`customer-navbar absolute bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-neutral-DEFAULT z-40 ${className || ''}`}>
      {/* Reduced navbar height from h-16 to h-14 (3.5rem) */}
      <div className="max-w-screen-md mx-auto h-14 flex justify-around items-center px-1 sm:px-2">
        <NavItem
          label="Products"
          iconName="home"
          isActive={currentPage === Page.PRODUCTS}
          onClick={() => onNavigate(Page.PRODUCTS)}
        />
        <NavItem
          label="Templates"
          iconName="template"
          isActive={currentPage === Page.TEMPLATES || currentPage === Page.VIEW_TEMPLATE_DETAILS || currentPage === Page.CREATE_TEMPLATE}
          onClick={() => onNavigate(Page.TEMPLATES)}
        />
        <NavItem
          label="Orders"
          iconName="receipt"
          isActive={currentPage === Page.ORDER_HISTORY || (currentPage === Page.ORDER_CONFIRMATION && !!isViewingPastOrder)}
          onClick={() => onNavigate(Page.ORDER_HISTORY)}
        />
        <NavItem
          label="Profile"
          iconName="user"
          isActive={currentPage === Page.PROFILE}
          onClick={() => onNavigate(Page.PROFILE)}
        />
      </div>
    </nav>
  );
};

export default Navbar;
