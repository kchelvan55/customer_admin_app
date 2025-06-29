export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  uom: string; // New field for Unit of Measure
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ProductInCart extends Product {
  quantity: number;
}

export interface TemplateItem {
  productId:string;
  quantity: number;
}

export const DaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type DayOfWeek = typeof DaysOfWeek[number];

export const ShopLocations = ["Al-Sheika Tuas", "Al-Sheika Boon Lay"] as const;
export type ShopLocation = typeof ShopLocations[number];

export interface Template {
  id:string;
  name: string;
  items: TemplateItem[];
  createdAt: string;
  updatedAt?: string; // Added for edit functionality
  days?: DayOfWeek[];
  shop?: ShopLocation;
  lastUsedAt?: string; // New field for last used date
}

export interface DraftTemplateItem {
  product: Product;
  quantity: number; // Keeping as number, UI will handle 0 as blank input
}

// Define all possible order statuses
export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled'
  // New Admin specific statuses
  | 'To select date'
  | 'On hold - Payment'
  | 'To pick person for billing in Insmart'
  | 'Order delegated for billing' // New
  | 'Billing in progress' // New
  | 'Billed in Insmart'
  | 'To be packed' 
  | 'To ship';
  // Note: 'Shipped' is common to both old and new lists

export const USER_ORDER_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
export const ADMIN_ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "To select date", 
  "On hold - Payment", 
  "To pick person for billing in Insmart", 
  "Order delegated for billing", // New
  "Billing in progress", // New
  "Billed in Insmart"
];


export const AdminStaffNamesPackedBy = ["Cong", "Yang", "Samy", "Sharvin", "Arun", "Jiang", "Sun", "Venkatesh"] as const;
export type AdminStaffNamePackedBy = typeof AdminStaffNamesPackedBy[number];

export const AdminStaffNamesDeliveredBy = ["Senthil", "Reddy", "Ganesan", "Dinesh", "Perumal", "Uthay"] as const;
export type AdminStaffNameDeliveredBy = typeof AdminStaffNamesDeliveredBy[number];

export const CustomerTypes = ["Shop Cat 1", "Shop Cat 2", "Shop Cat 3", "Minimart", "Retail"] as const;
export type CustomerType = typeof CustomerTypes[number];
export const DEFAULT_CUSTOMER_TYPE: CustomerType = "Retail";

export const AdminStaffNames = ["Saraswathi", "Sumathi", "Shabeena", "Cini", "Rohini", "Kogila.S", "Kogila.T", "Deepa", "Seetha"] as const;
export type AdminStaffName = typeof AdminStaffNames[number];
export const DEFAULT_LOGGED_IN_ADMIN_STAFF: AdminStaffName = "Saraswathi";

export interface Order {
  id: string;
  items: ProductInCart[];
  totalPrice: number;
  orderDate: string; // Date the order was placed
  invoiceDate?: string; // Date for the invoice, can be future if advance order
  status: OrderStatus; // Updated to use the comprehensive OrderStatus type
  shopLocation?: ShopLocation;
  shippingAddress?: string;
  billingAddress?: string;
  contactNumber?: string; // New field
  attachedPhotoName?: string; 
  attachedDocumentName?: string;
  customerType?: CustomerType; // New field
  // Admin specific fields
  billedInInsmartBy?: AdminStaffName;
  billedDate?: string; // New field for when billing is completed
  shippingDate?: string; // Date the order is scheduled for shipping
  packedBy?: AdminStaffNamePackedBy;
  deliveredBy?: AdminStaffNameDeliveredBy;
  // Order modification tracking
  isModified?: boolean;
  originalTotalPrice?: number;
  modificationDate?: string;
  modificationSummary?: string; // Brief description of changes made
}

export enum Page {
  PRODUCTS = 'PRODUCTS',
  CART = 'CART',
  TEMPLATES = 'TEMPLATES',
  CREATE_TEMPLATE = 'CREATE_TEMPLATE',
  VIEW_TEMPLATE_DETAILS = 'VIEW_TEMPLATE_DETAILS',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  ORDER_HISTORY = 'ORDER_HISTORY',
  PROFILE = 'PROFILE',
  ORDER_DETAILS = 'ORDER_DETAILS', // New page for order details before confirmation
  MODIFY_ORDER = 'MODIFY_ORDER', // New page for modifying existing orders
  // Admin Pages
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_ORDER_MANAGEMENT = 'ADMIN_ORDER_MANAGEMENT',
  ADMIN_USER_MANAGEMENT = 'ADMIN_USER_MANAGEMENT',
  ADMIN_PRODUCT_CATALOG = 'ADMIN_PRODUCT_CATALOG',
  ADMIN_VIEW_ORDER_PDF = 'ADMIN_VIEW_ORDER_PDF',
  ADMIN_PRINT_ORDERS_PDF = 'ADMIN_PRINT_ORDERS_PDF',
}

export type IconName = 
  | 'shoppingCart' | 'template' | 'home' | 'plus' | 'minus' | 'trash' | 'chevronLeft' | 'save' 
  | 'eye' | 'checkCircle' | 'xCircle' | 'list' | 'receipt' | 'user' | 'refreshCcw' | 'search' 
  | 'filter' | 'sort' | 'arrowUp' | 'arrowDown' | 'arrowRight' | 'chevronDown' | 'edit' | 'camera' | 'paperclip'
  | 'calendar' | 'ticket' | 'info' | 'settings' | 'layoutGrid' | 'packageCheck' | 'printer' | 'logOut'
  | 'layoutSidebarLeft' | 'layoutSplit' | 'layoutSidebarRight' | 'columns'
  | 'play' | 'check' | 'users'; // Added 'users' icon

export const SingaporeRegions = ["North", "South", "East", "West", "Central"] as const;
export type SingaporeRegion = typeof SingaporeRegions[number];

export type SortOption = 'default' | 'name_asc' | 'name_desc' | 'category_asc' | 'category_desc';
export type ProductPageMode = 'ORDER' | 'TEMPLATE';

export const ADD_NEW_ADDRESS_OPTION_VALUE = "ADD_NEW_ADDRESS_INTERNAL_VALUE";
export const ADD_NEW_ADDRESS_DISPLAY_TEXT = "Add new address...";
export const DEFAULT_SHIPPING_ADDRESS_1 = "Blk 123, Application Road, #10-10, Singapore 246810";
export const DEFAULT_SHIPPING_ADDRESS_2 = "Unit 456, Order Street, #05-05, Singapore 135791";

export const ADD_NEW_CONTACT_OPTION_VALUE = "ADD_NEW_CONTACT_INTERNAL_VALUE";
export const ADD_NEW_CONTACT_DISPLAY_TEXT = "Add new contact person...";
export const DEFAULT_CONTACT_INFO_STRING = "Praveen - +65 9876 5432";

export interface CountryInfo { code: string; name: string; }
export const CountryCodes: CountryInfo[] = [
    { code: '+65', name: 'SG (+65)' },
    { code: '+91', name: 'IN (+91)' },
    { code: '+60', name: 'MY (+60)' },
    // Add more countries as needed
];
export type CountryCode = typeof CountryCodes[number]['code'];
export const DEFAULT_CONTACT_COUNTRY_CODE: CountryCode = '+65';

export type IssueType = typeof import('./constants').ISSUE_TYPES[number];

export interface TicketIssue {
  id: string;
  issueType: IssueType;
  issueDescription?: string; // For "Order Delay"
  relatedProductIds?: string[]; // For "Missing Item", "Incorrect item", "Damaged item" (ordered items)
  singleRelatedProductId?: string; // For "Incorrect quantity" (ordered item)
  quantityInOrder?: number; // For "Incorrect quantity"
  quantityReceived?: number; // For "Incorrect quantity"
  receivedInsteadProductIds?: string[]; // For "Incorrect item" (items from general product list)
  damagedItemPhotoNames?: string[]; // For "Damaged item"
}
export interface SupportTicket {
  id: string;
  orderId: string;
  issues: TicketIssue[];
  createdAt: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  // Potentially add: resolutionNotes, resolvedAt, resolvedBy, etc.
}


export type PanelDisplayMode = 'split' | 'customerFocus' | 'adminFocus';

export type AdminOrderTableColumnId = 
  | 'select' 
  | 'orderId' 
  | 'customerOrderDate' // Renamed from 'date'
  | 'customerInvoiceRequestDate' // New column
  | 'billedDate' // New column for when billing is completed
  | 'shipmentRegion' // New
  | 'shipmentSchedule' // New
  | 'customer'
  | 'customerType'
  | 'shop' 
  | 'total' 
  | 'status'
  | 'shippingDate'
  | 'billedInInsmartBy'
  | 'packedBy'
  | 'deliveredBy';

export interface AdminOrderTableColumnConfig {
    id: AdminOrderTableColumnId;
    label: string;
    defaultVisible: boolean;
    minWidth?: string;
    isEditable?: boolean; // New property
}

export const ALL_ADMIN_ORDER_TABLE_COLUMNS: AdminOrderTableColumnConfig[] = [
    { id: 'select', label: '', defaultVisible: true, minWidth: '25px' }, 
    { id: 'orderId', label: 'Order ID', defaultVisible: true, minWidth: '130px' },
    { id: 'customerOrderDate', label: 'Customer Order Date', defaultVisible: true, minWidth: '110px' }, 
    { id: 'customerInvoiceRequestDate', label: 'Cust. Invoice Req. Date', defaultVisible: true, minWidth: '110px' },
    { id: 'billedDate', label: 'Billed Date', defaultVisible: false, minWidth: '100px' }, // Hidden by default for To Pick Date
    { id: 'shipmentRegion', label: 'Shipment Region', defaultVisible: true, minWidth: '110px', isEditable: false },
    { id: 'shipmentSchedule', label: 'Shipment Schedule#', defaultVisible: false, minWidth: '100px', isEditable: false }, // Hidden by default
    { id: 'customer', label: 'Customer', defaultVisible: false, minWidth: '110px' }, // Hidden by default
    { id: 'customerType', label: 'Cust. Type', defaultVisible: false, minWidth: '100px', isEditable: true }, // Hidden by default
    { id: 'shop', label: 'Shop', defaultVisible: true, minWidth: '110px' }, 
    { id: 'total', label: 'Total', defaultVisible: true, minWidth: '80px' }, 
    { id: 'status', label: 'Billing Status', defaultVisible: false, minWidth: '140px', isEditable: true }, 
    { id: 'shippingDate', label: 'Shipping Date', defaultVisible: true, minWidth: '100px', isEditable: true }, 
    { id: 'billedInInsmartBy', label: 'Billed By', defaultVisible: false, minWidth: '100px', isEditable: true }, // Hidden by default for To Pick Date 
    { id: 'packedBy', label: 'Packed By', defaultVisible: false, minWidth: '100px', isEditable: true }, 
    { id: 'deliveredBy', label: 'Delivered By', defaultVisible: false, minWidth: '100px', isEditable: true }, 
];

export type AdminOrderManagementSubTab = 'To Pick Date' | 'To Bill in Insmart' | 'Billed to Schedule' | 'Schedule' | 'Accounting related' | 'All Orders';
export const ADMIN_ORDER_MANAGEMENT_SUB_TABS: AdminOrderManagementSubTab[] = ['To Pick Date', 'To Bill in Insmart', 'Billed to Schedule', 'Schedule', 'Accounting related', 'All Orders'];

export type AdminUserManagementSubTab = 'Individual User Management' | 'Organization and Shop Management' | 'User Groups' | 'Activity Logs';
export const ADMIN_USER_MANAGEMENT_SUB_TABS: AdminUserManagementSubTab[] = [
  'Individual User Management',
  'Organization and Shop Management',
  'User Groups',
  'Activity Logs'
];


export interface AssignmentPriorityModalInfo {
  orderForPrompt: Order;
  originalAssignmentArgs: {
    targetOrderIds: string[];
    biller?: AdminStaffName; // Undefined for 'Quick Assign to Me'
    isQuickAssign: boolean; // Differentiates quick assign from other assignments
    // For inline edit / bulk update, we might need more context if we resume original action
    isInlineEdit?: boolean;
    inlineEditCol?: AdminOrderTableColumnId; 
    isBulkUpdate?: boolean;
    bulkUpdateFields?: any; // To store fields from bulk update modal
    bulkUpdateFlags?: any;
  };
}

// User Management specific types
export interface RoleShopAssignment {
  role: string;
  shops: ShopLocation[];
}

export interface AppUser {
  id: string;
  name: string;
  contactNumber: string; // e.g., "+65 12345678"
  role: string;
  organization: string; // e.g., "Al-Sheika"
  shops: ShopLocation[]; // Array of shop names, e.g., ["Al-Sheika Tuas"]
  roleShopAssignments?: RoleShopAssignment[]; // For external users with multiple roles per shop
}
