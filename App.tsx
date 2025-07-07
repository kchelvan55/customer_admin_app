import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
    Product, CartItem, Template, Order, Page, ProductInCart, DraftTemplateItem, TemplateItem, 
    SingaporeRegions, SortOption, ProductPageMode, IconName, 
    DayOfWeek, DaysOfWeek, ShopLocation, ShopLocations,
    ADD_NEW_ADDRESS_OPTION_VALUE, ADD_NEW_ADDRESS_DISPLAY_TEXT,
    DEFAULT_SHIPPING_ADDRESS_1, DEFAULT_SHIPPING_ADDRESS_2,
    DEFAULT_CONTACT_INFO_STRING, ADD_NEW_CONTACT_OPTION_VALUE, ADD_NEW_CONTACT_DISPLAY_TEXT,
    CountryCodes, CountryCode, CountryInfo, DEFAULT_CONTACT_COUNTRY_CODE,
    SupportTicket, TicketIssue, ADMIN_ORDER_STATUS_OPTIONS, OrderStatus,
    AdminStaffName, AdminStaffNames, DEFAULT_LOGGED_IN_ADMIN_STAFF, PanelDisplayMode,
    AdminOrderTableColumnConfig, ALL_ADMIN_ORDER_TABLE_COLUMNS, AdminOrderTableColumnId,
    AdminProductTableColumnConfig, ALL_ADMIN_PRODUCT_TABLE_COLUMNS, AdminProductTableColumnId,
    AdminStaffNamesPackedBy, AdminStaffNamePackedBy, AdminStaffNamesDeliveredBy, AdminStaffNameDeliveredBy,
    AdminOrderManagementSubTab, ADMIN_ORDER_MANAGEMENT_SUB_TABS,
    AdminUserManagementSubTab, ADMIN_USER_MANAGEMENT_SUB_TABS,
    CustomerType, CustomerTypes, DEFAULT_CUSTOMER_TYPE,
    AssignmentPriorityModalInfo,
    AppUser, ModificationRequest, ModificationRequestStatus
} from './types';
import { MOCK_PRODUCTS, ISSUE_TYPES } from './constants';

// Helper function to robustly unwrap default exports
const unwrap = (module: any, moduleName?: string) => {
  if (module && typeof module === 'object' && module.default && typeof module.default === 'function') {
    return module.default;
  }
  if (module === undefined) {
    console.error(`Error: Module ${moduleName || 'unknown'} is undefined. Check import path or file content.`);
  } else if (typeof module !== 'function' && (typeof module !== 'object' || !module.default)) {
     console.warn(`Warning: Module ${moduleName || 'unknown'} does not appear to be a standard React component (expected function or object with default export). Received:`, module);
  }
  return module; 
};


// Import local components using the unwrap helper
import NavbarModule from './components/Navbar';
const Navbar = unwrap(NavbarModule, 'Navbar');
import AdminNavbarModule from './components/AdminNavbar';
const AdminNavbar = unwrap(AdminNavbarModule, 'AdminNavbar');
import ProductListItemModule from './components/ProductCard';
const ProductListItem = unwrap(ProductListItemModule, 'ProductListItem');
import CartItemDisplayModule from './components/CartItemDisplay';
const CartItemDisplay = unwrap(CartItemDisplayModule, 'CartItemDisplay');
import ButtonModule from './components/Button';
const Button = unwrap(ButtonModule, 'Button');
import ModalModule from './components/Modal';
const Modal = unwrap(ModalModule, 'Modal');
import IconModule from './components/Icon';
const Icon = unwrap(IconModule, 'Icon');
import DatePickerModule from './components/DatePicker';
const DatePicker = unwrap(DatePickerModule, 'DatePicker');
import CreateTicketModalModule from './components/CreateTicketModal';
const CreateTicketModal = unwrap(CreateTicketModalModule, 'CreateTicketModal');
import ViewTicketModalModule from './components/ViewTicketModal';
const ViewTicketModal = unwrap(ViewTicketModalModule, 'ViewTicketModal');
import ViewIssueModalModule from './components/ViewIssueModal';
const ViewIssueModal = unwrap(ViewIssueModalModule, 'ViewIssueModal');
import PanelControlBarModule from './components/PanelControlBar';
const PanelControlBar = unwrap(PanelControlBarModule, 'PanelControlBar');


const TOAST_SHOW_DELAY = 50; 
const TOAST_VISIBLE_DURATION = 3000; // Increased duration slightly for longer messages
const TOAST_FADE_ANIMATION_DURATION = 500;

// Heights of sticky elements for IntersectionObserver calculations (approximate in rem)
const SEARCH_BAR_HEIGHT_REM = 3; 
const MODE_SELECTOR_HEIGHT_REM = 2.5; 
const CATEGORY_DROPDOWN_HEIGHT_REM = 2; 
const ADMIN_NAVBAR_HEIGHT_REM = 3.5; 
const CUSTOMER_NAVBAR_HEIGHT_REM = 3.5; // Reduced from 4rem
const PANEL_CONTROL_BAR_HEIGHT_REM = 3; 
const DRAG_THRESHOLD = 5; // Pixels for click vs drag detection

const MOCK_INTERNAL_USERS: AppUser[] = [
    { id: 'user-1', name: 'Veeramani', contactNumber: '11223344', role: 'Super Admin', organization: 'Selvi Mills', shops: [] },
    { id: 'user-2', name: 'Kalaichelvan', contactNumber: '55667788', role: 'Super Admin', organization: 'Selvi Mills', shops: [] },
    { id: 'user-3', name: 'Sumathi', contactNumber: '99112233', role: 'Super Admin', organization: 'Selvi Mills', shops: [] },
    { id: 'user-4', name: 'Seetha', contactNumber: '44556677', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-5', name: 'Saraswathi', contactNumber: '88990011', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-6', name: 'Shabeena', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-7', name: 'Cini', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-8', name: 'Kogila.S', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-9', name: 'Rohini', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-10', name: 'Rohini', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-11', name: 'Deepa', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
    { id: 'user-12', name: 'Visha', contactNumber: '', role: 'Admin Staff', organization: 'Selvi Mills', shops: [] },
];

const MOCK_CUSTOMER_USERS: AppUser[] = [
    { id: 'user-13', name: 'Mani', contactNumber: '+65 8468 2040', role: 'Owner', organization: 'Al-Sheika', shops: ['Al-Sheika Tuas', 'Al-Sheika Boon Lay'] },
    { id: 'user-14', name: 'Murali', contactNumber: '+65 8170 7358', role: 'Manager, PIC of Payments', organization: 'Al-Sheika', shops: ['Al-Sheika Tuas', 'Al-Sheika Boon Lay'] },
    { id: 'user-15', name: 'Praveen', contactNumber: '+65 9876 5432', role: 'PIC of Ordering, PIC of Payments', organization: 'Al-Sheika', shops: ['Al-Sheika Tuas'] },
    { id: 'user-16', name: 'Eswari', contactNumber: '+65 9075 0347', role: 'PIC of Ordering', organization: 'Al-Sheika', shops: ['Al-Sheika Boon Lay'] },
];

export const App: React.FC = () => {
  const [customerCurrentPage, setCustomerCurrentPage] = useState<Page>(Page.PRODUCTS);
  const [adminCurrentPage, setAdminCurrentPage] = useState<Page>(Page.ADMIN_ORDER_MANAGEMENT);
  const [panelDisplayMode, setPanelDisplayMode] = useState<PanelDisplayMode>('customerFocus');

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [stagedForTemplateItems, setStagedForTemplateItems] = useState<Product[]>([]); 
  const [currentDraftTemplateItems, setCurrentDraftTemplateItems] = useState<DraftTemplateItem[]>([]);

  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [currentOrderDetails, setCurrentOrderDetails] = useState<Order | null>(null);
  const [viewingTemplateId, setViewingTemplateId] = useState<string | null>(null);
  
  // Order modification state
  const [orderBeingModified, setOrderBeingModified] = useState<Order | null>(null);
  const [modificationCartItems, setModificationCartItems] = useState<CartItem[]>([]);
  const [isInModificationMode, setIsInModificationMode] = useState<boolean>(false);
  const [modificationSearchQuery, setModificationSearchQuery] = useState('');
  const [showAddItemsSection, setShowAddItemsSection] = useState(false);
  const [isModificationConfirmModalOpen, setIsModificationConfirmModalOpen] = useState(false);
  const [orderIdPendingModification, setOrderIdPendingModification] = useState<string | null>(null);
  const [orderTimerText, setOrderTimerText] = useState<string>('');
  
  // Order modification summary modal state
  const [isModificationSummaryModalOpen, setIsModificationSummaryModalOpen] = useState(false);
  const [modificationSummaryData, setModificationSummaryData] = useState<{
    originalItems: ProductInCart[];
    newItems: ProductInCart[];
    originalTotal: number;
    newTotal: number;
  } | null>(null);
  
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [toastText, setToastText] = useState<string | null>(null);
  const [animateToastIn, setAnimateToastIn] = useState<boolean>(false);
  const toastTimersRef = useRef<{ showTimer?: number; hideTimer?: number; removeTimer?: number }>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [productPageMode, setProductPageMode] = useState<ProductPageMode>('ORDER'); 
  
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [activeCategoryInView, setActiveCategoryInView] = useState<string | null>(null);
  const categoryHeaderRefs = useRef<Record<string, HTMLHeadingElement | null>>({});
  const productPageContentRef = useRef<HTMLDivElement>(null); 

  const [isDiscardConfirmModalOpen, setIsDiscardConfirmModalOpen] = useState<boolean>(false);

  const [currentDraftTemplateDays, setCurrentDraftTemplateDays] = useState<DayOfWeek[]>([]);
  const [currentDraftTemplateShop, setCurrentDraftTemplateShop] = useState<ShopLocation | undefined>(undefined);

  const [selectedOrderShopLocation, setSelectedOrderShopLocation] = useState<ShopLocation>(ShopLocations[0]);
  const [availableShippingAddresses, setAvailableShippingAddresses] = useState<string[]>([
    DEFAULT_SHIPPING_ADDRESS_1,
    DEFAULT_SHIPPING_ADDRESS_2,
    ADD_NEW_ADDRESS_DISPLAY_TEXT 
  ]);
  const [selectedShippingAddressOption, setSelectedShippingAddressOption] = useState<string>(DEFAULT_SHIPPING_ADDRESS_1);
  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState<boolean>(true);
  const [selectedBillingAddressOption, setSelectedBillingAddressOption] = useState<string>(DEFAULT_SHIPPING_ADDRESS_1);
  
  const [availableContactInfos, setAvailableContactInfos] = useState<string[]>([
    DEFAULT_CONTACT_INFO_STRING,
    ADD_NEW_CONTACT_DISPLAY_TEXT
  ]);
  const [selectedContactInfoOption, setSelectedContactInfoOption] = useState<string>(DEFAULT_CONTACT_INFO_STRING);
  
  const [isAddShippingAddressModalOpen, setIsAddShippingAddressModalOpen] = useState<boolean>(false);
  const [customShippingAddressInput, setCustomShippingAddressInput] = useState<{ line1: string; unitNo: string; postalCode: string }>({ line1: '', unitNo: '', postalCode: '' });
  const [shippingAddressModalContext, setShippingAddressModalContext] = useState<'shipping' | 'billing'>('shipping');

  const [isAddContactInfoModalOpen, setIsAddContactInfoModalOpen] = useState<boolean>(false);
  const [customContactInfoInput, setCustomContactInfoInput] = useState<{ name: string; number: string; countryCode: CountryCode }>({ name: '', number: '', countryCode: DEFAULT_CONTACT_COUNTRY_CODE });

  const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState<boolean>(false);

  const [attachedPhoto, setAttachedPhoto] = useState<File | null>(null);
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const modificationSearchInputRef = useRef<HTMLInputElement>(null);

  const [profileToggles, setProfileToggles] = useState({
    generalInfoSection: false,
    userInfoCard: false,
    orgDetailsCard: false,
    managerDetailsCard: false,
    shopDetailsSection: false,
    shopTuasCard: false,
    shopBoonLayCard: false,
    shopTuasUpdateRequestSent: false, 
    shopBoonLayUpdateRequestSent: false, 
    deliveryInfoSection: false,
  });

  // State for live delivery timers
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live timer update for delivery information
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for seconds display

    return () => clearInterval(timer);
  }, []);

  const [isAdvanceOrder, setIsAdvanceOrder] = useState<boolean>(false);
  const [selectedInvoiceDate, setSelectedInvoiceDate] = useState<Date | null>(null);
  const [orderIdCounter, setOrderIdCounter] = useState<number>(1);

  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState<boolean>(false);
  const [orderForTicketCreation, setOrderForTicketCreation] = useState<Order | null>(null);
  const [allSupportTickets, setAllSupportTickets] = useState<SupportTicket[]>([]);
  const [isViewTicketModalOpen, setIsViewTicketModalOpen] = useState<boolean>(false);
  const [ticketToView, setTicketToView] = useState<SupportTicket | null>(null);
  const [isViewIssueModalOpen, setIsViewIssueModalOpen] = useState<boolean>(false);
  const [issueToView, setIssueToView] = useState<(TicketIssue & {
    ticketId: string;
    orderId: string;
    ticketCreatedAt: string;
    ticketStatus: string;
  }) | null>(null);

  // Admin specific state
  const [adminSelectedOrderIds, setAdminSelectedOrderIds] = useState<string[]>([]);
  const [orderToViewAdminPdf, setOrderToViewAdminPdf] = useState<Order | null>(null);
  
  // Simple selection states
  const [focusedOrderId, setFocusedOrderId] = useState<string | null>(null);
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null);
  
  // Driver assignment modal states
  const [isDriverAssignmentModalOpen, setIsDriverAssignmentModalOpen] = useState(false);
  const [selectedDriverForAssignment, setSelectedDriverForAssignment] = useState<AdminStaffNameDeliveredBy | null>(null);
  
  // Selection controls toggle
  const [isSelectionControlsOpen, setIsSelectionControlsOpen] = useState(false);
  const [ordersToPrintAdminPdf, setOrdersToPrintAdminPdf] = useState<Order[]>([]);
  
  const [isUpdateOrdersModalOpen, setIsUpdateOrdersModalOpen] = useState<boolean>(false);
  const [updateFieldsState, setUpdateFieldsState] = useState({
    status: ADMIN_ORDER_STATUS_OPTIONS[0] as OrderStatus, 
    billedBy: AdminStaffNames[0] as AdminStaffName, 
    shippingDate: null as Date | null,
    packedBy: AdminStaffNamesPackedBy[0] as AdminStaffNamePackedBy,
    deliveredBy: AdminStaffNamesDeliveredBy[0] as AdminStaffNameDeliveredBy,
    customerType: DEFAULT_CUSTOMER_TYPE as CustomerType,
  });
   const [applyUpdateFlags, setApplyUpdateFlags] = useState({
    status: false,
    billedBy: false,
    shippingDate: false,
    packedBy: false,
    deliveredBy: false,
    customerType: false,
  });

  const [visibleAdminOrderColumns, setVisibleAdminOrderColumns] = useState<AdminOrderTableColumnId[]>(
    ALL_ADMIN_ORDER_TABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id)
  );
  const [isColumnSelectModalOpen, setIsColumnSelectModalOpen] = useState(false);

  const [showProductImages, setShowProductImages] = useState<boolean>(false); 
  const [productPendingOrderQuantityProductId, setProductPendingOrderQuantityProductId] = useState<string | null>(null);
  const [productPendingTemplateQuantityProductId, setProductPendingTemplateQuantityProductId] = useState<string | null>(null);
  
  const [templateToConfigureForCart, setTemplateToConfigureForCart] = useState<Template | null>(null);
  const [configuredTemplateItems, setConfiguredTemplateItems] = useState<{ productId: string; quantityString: string; product: Product }[]>([]);
  const configurableQuantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Admin Order Table Inline Editing State
  const [editingCellInfo, setEditingCellInfo] = useState<{
      orderId: string;
      columnId: AdminOrderTableColumnId;
      initialValue: any;
      cellElement: HTMLElement | null;
  } | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<any>('');
  const [inlineEditMouseDownPos, setInlineEditMouseDownPos] = useState<{ x: number, y: number } | null>(null);
  const inlineEditPopupRef = useRef<HTMLDivElement>(null);
  
  const [currentAdminOrderManagementSubTab, setCurrentAdminOrderManagementSubTab] = useState<AdminOrderManagementSubTab>(ADMIN_ORDER_MANAGEMENT_SUB_TABS[0]);
  const [currentAdminUserManagementSubTab, setCurrentAdminUserManagementSubTab] = useState<AdminUserManagementSubTab>(ADMIN_USER_MANAGEMENT_SUB_TABS[0]);


  // State for new "Quick Update Shipping Date" modal
  const [isQuickUpdateShippingDateModalOpen, setIsQuickUpdateShippingDateModalOpen] = useState<boolean>(false);
  const [quickShippingDateToUpdate, setQuickShippingDateToUpdate] = useState<Date | null>(null);

  // State for Assignment Priority Modal
  const [isAssignmentPriorityModalOpen, setIsAssignmentPriorityModalOpen] = useState<boolean>(false);
  const [assignmentPriorityModalInfo, setAssignmentPriorityModalInfo] = useState<AssignmentPriorityModalInfo | null>(null);

  // State for Credit Limit Modal
  const [isCreditLimitModalOpen, setIsCreditLimitModalOpen] = useState<boolean>(false);
  const [creditLimitModalOrder, setCreditLimitModalOrder] = useState<Order | null>(null);

  // State for Shipping Date Confirmation Modal
  const [isShippingDateConfirmModalOpen, setIsShippingDateConfirmModalOpen] = useState<boolean>(false);
  const [shippingDateConfirmData, setShippingDateConfirmData] = useState<{
    selectedDate: Date;
    orderIds: string[];
    shopName: string;
    context: 'inline' | 'bulk' | 'quick';
    originalData?: any; // Store original update data for bulk/quick
  } | null>(null);

  // State for Pending Modification Request Modal

  // Define the reusable function for checking modification requests
  const hasAnyModificationRequests = (order: Order): boolean => {
    const hasModificationRequests = (order.modificationRequests?.length || 0) > 0;
    const hasProcessedRequests = (order.processedModificationRequests?.length || 0) > 0;
    return hasModificationRequests || hasProcessedRequests;
  };

  // Helper function to count total modification requests
  const getTotalModificationRequestsCount = (order: Order): number => {
    return (order.modificationRequests?.length || 0) + (order.processedModificationRequests?.length || 0);
  };

  // Helper function to check if order has no modification requests (for legacy checks)
  const hasNoModificationRequests = (order: Order): boolean => {
    return !hasAnyModificationRequests(order);
  };
  const [isPendingModificationModalOpen, setIsPendingModificationModalOpen] = useState<boolean>(false);
  const [pendingModificationOrder, setPendingModificationOrder] = useState<Order | null>(null);

  // State for Shop Organization Management Modal
  const [isShopOrgManagementModalOpen, setIsShopOrgManagementModalOpen] = useState<boolean>(false);
  const [shopOrgManagementData, setShopOrgManagementData] = useState<{
    shop: any;
    currentOrgId: string;
    action: 'move' | 'remove';
  } | null>(null);
  const [shopOrgForm, setShopOrgForm] = useState({
    targetOrgId: '',
    removalReason: '',
    customReason: ''
  });

  // Internal Billing Hold Modal states
  const [isBillingHoldModalOpen, setIsBillingHoldModalOpen] = useState(false);
  const [billingHoldAction, setBillingHoldAction] = useState<{
    shop: any;
    orgId: string;
    action: 'enable' | 'disable';
  } | null>(null);

  // Internal Billing Hold Warning Modal states
  const [isInternalBillingHoldWarningModalOpen, setIsInternalBillingHoldWarningModalOpen] = useState(false);

  // Helper function to check if order's shop has internal billing hold enabled
  const isOrderShopOnBillingHold = (order: Order): boolean => {
    if (!order.shopLocation) return false;
    
    // Check in organizations
    for (const org of organizations) {
      if (org.shops) {
        const shop = org.shops.find((s: any) => s.name === order.shopLocation);
        if (shop && shop.internalBillingHold) {
          return true;
        }
      }
    }
    
    // Check in unlinked shops
    const unlinkedShop = unlinkedShops.find((s: any) => s.name === order.shopLocation);
    return unlinkedShop?.internalBillingHold || false;
  };

  // Handler for internal billing hold warning modal
  const handleCloseInternalBillingHoldWarningModal = () => {
    setIsInternalBillingHoldWarningModalOpen(false);
  };

  // State for User Management
  const [allAppUsers, setAllAppUsers] = useState<AppUser[]>([
    {
      id: "0001",
      name: "Veeramani",
      contactNumber: "11223344",
      role: "Super Admin",
      organization: "Selvi Mills",
      shops: [] // N/A means no shops linked
    },
    {
      id: "0002",
      name: "Kalaichelvan",
      contactNumber: "",
      role: "Super Admin",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0003",
      name: "Sumathi",
      contactNumber: "",
      role: "Super Admin",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0004",
      name: "Seetha",
      contactNumber: "",
      role: "Admin",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0005",
      name: "Saraswathi",
      contactNumber: "",
      role: "Admin",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0006",
      name: "Shabeena",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0007",
      name: "Cini",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0008",
      name: "Deepa",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0009",
      name: "Rohini",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0010",
      name: "Kogila.S",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0011",
      name: "Kogila.T",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0012",
      name: "Visha",
      contactNumber: "",
      role: "Staff",
      organization: "Selvi Mills",
      shops: []
    },
    {
      id: "0013",
      name: "Mani",
      contactNumber: "84682040",
      role: "Owner",
      organization: "Al-Sheika",
      shops: ["Al-Sheika Tuas", "Al-Sheika Boon Lay"],
      roleShopAssignments: [
        { role: "Owner", shops: ["Al-Sheika Tuas", "Al-Sheika Boon Lay"] }
      ]
    },
    {
      id: "0014",
      name: "Murali",
      contactNumber: "81707358",
      role: "Manager & PIC of Payments",
      organization: "Al-Sheika",
      shops: ["Al-Sheika Tuas", "Al-Sheika Boon Lay"],
      roleShopAssignments: [
        { role: "Manager", shops: ["Al-Sheika Tuas"] },
        { role: "Manager", shops: ["Al-Sheika Boon Lay"] },
        { role: "PIC of Payments", shops: ["Al-Sheika Boon Lay"] }
      ]
    },
    {
      id: "0015",
      name: "Praveen",
      contactNumber: "",
      role: "PIC of Ordering & PIC of Payments",
      organization: "Al-Sheika",
      shops: ["Al-Sheika Tuas"],
      roleShopAssignments: [
        { role: "PIC of Ordering", shops: ["Al-Sheika Tuas"] },
        { role: "PIC of Payments", shops: ["Al-Sheika Tuas"] }
      ]
    },
    {
      id: "0016",
      name: "Eswari",
      contactNumber: "",
      role: "PIC of Ordering",
      organization: "Al-Sheika",
      shops: ["Al-Sheika Boon Lay"],
      roleShopAssignments: [
        { role: "PIC of Ordering", shops: ["Al-Sheika Boon Lay"] }
      ]
    }
  ]);

  // State for Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    contactNumber: '',
    role: 'Staff' as 'Super Admin' | 'Admin Staff' | 'Staff' | 'Owner' | 'Manager' | 'PIC of Ordering' | 'PIC of Payments',
    organization: 'Selvi Mills',
    shops: [] as ShopLocation[],
    userType: 'internal' as 'internal' | 'external'
  });

  // State for Edit User Modal
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    contactNumber: '',
    role: 'Staff' as 'Super Admin' | 'Admin Staff' | 'Staff' | 'Owner' | 'Manager' | 'PIC of Ordering' | 'PIC of Payments',
    organization: '',
    shops: [] as ShopLocation[],
    userType: 'internal' as 'internal' | 'external'
  });

  // State for User Table Row Expansion - Hide sub-rows by default
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);

  // Add Organization Modal states
  const [isAddOrganizationModalOpen, setIsAddOrganizationModalOpen] = useState(false);
  const [newOrganizationForm, setNewOrganizationForm] = useState({
    name: '',
    type: 'external' as 'external' | 'internal'
  });

  // Admin Product Catalog State
  const [visibleAdminProductColumns, setVisibleAdminProductColumns] = useState<AdminProductTableColumnId[]>(
    ALL_ADMIN_PRODUCT_TABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id)
  );
  const [isProductColumnSelectModalOpen, setIsProductColumnSelectModalOpen] = useState(false);
  const [adminSelectedProductIds, setAdminSelectedProductIds] = useState<string[]>([]);
  
  // Product Management Modal States
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addProductCurrentStep, setAddProductCurrentStep] = useState(1);
  const [newProductForm, setNewProductForm] = useState<Partial<Product> & {
    costPrice?: number;
    retailPrice?: number;
    minimartPrice?: number;
    wholesalePrice?: number;
    shopCat1Price?: number;
    shopCat3Price?: number;
    attachedImageFile?: File | null;
  }>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    uom: '',
    vendor: '',
    costPrice: 0,
    retailPrice: 0,
    minimartPrice: 0,
    wholesalePrice: 0,
    shopCat1Price: 0,
    shopCat3Price: 0,
    attachedImageFile: null,
  });



  // Singapore neighbourhoods for shipment regions
  const singaporeNeighbourhoods = [
    'Ang Mo Kio', 'Bedok', 'Bishan', 'Boon Lay', 'Bukit Batok', 'Bukit Merah', 'Bukit Panjang', 'Bukit Timah',
    'Central Water Catchment', 'Changi', 'Choa Chu Kang', 'Clementi', 'Downtown Core', 'Geylang', 'Hougang',
    'Jurong East', 'Jurong West', 'Kallang', 'Marine Parade', 'Museum', 'Newton', 'North-Eastern Islands',
    'Novena', 'Orchard', 'Outram', 'Pasir Ris', 'Punggol', 'Queenstown', 'River Valley', 'Rochor',
    'Sembawang', 'Sengkang', 'Serangoon', 'Singapore River', 'Southern Islands', 'Straits View',
    'Sungei Kadut', 'Tampines', 'Tanglin', 'Tekka', 'Toa Payoh', 'Tuas', 'Western Islands', 'Western Water Catchment',
    'Woodlands', 'Yishun'
  ];

  // Add Shop Modal states
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [selectedOrgForShop, setSelectedOrgForShop] = useState<string>('');
  const [addShopCurrentStep, setAddShopCurrentStep] = useState(1);
  const [newShopForm, setNewShopForm] = useState({
    name: '',
    address: '',
    shipmentRegion: '',
    paymentTerms: '',
    amountLimit: '',
    customerType: '',
    packaging: {
      palletType: '',
      labelType: '',
      packagingType: '',
      weightType: ''
    },
    parkingUnloading: {
      notes: ''
    },
    delivery: {
      openTime: '',
      closeTime: '',
      deliverAfter: '',
      deliverBefore: '',
      closedOn: []
    }
  });
  const [shopRegionSearchQuery, setShopRegionSearchQuery] = useState('');

  // Edit Shop Modal states
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [editShopCurrentStep, setEditShopCurrentStep] = useState(1);
  const [editShopForm, setEditShopForm] = useState({
    name: '',
    address: '',
    shipmentRegion: '',
    paymentTerms: '',
    amountLimit: '',
    customerType: '',
    packaging: {
      palletType: '',
      labelType: '',
      packagingType: '',
      weightType: ''
    },
    parkingUnloading: {
      notes: ''
    },
    delivery: {
      openTime: '',
      closeTime: '',
      deliverAfter: '',
      deliverBefore: '',
      closedOn: []
    }
  });
  const [editShopRegionSearchQuery, setEditShopRegionSearchQuery] = useState('');

  // Shop modal step configurations
  const shopModalSteps = [
    { id: 1, title: 'Basic Information', description: 'Shop name, address, and region' },
    { id: 2, title: 'Payment Terms', description: 'Payment methods and limits' },
    { id: 3, title: 'Packaging Details', description: 'Pallet, label, and packaging options' },
    { id: 4, title: 'Parking/Unloading', description: 'Parking and unloading instructions' },
    { id: 5, title: 'Delivery Hours', description: 'Delivery schedule and timing' }
  ];

  // Product modal step configurations
  const productModalSteps = [
    { id: 1, title: 'Product Information', description: 'Basic product details and specifications' },
    { id: 2, title: 'Pricing', description: 'Cost and selling prices for different customer types' }
  ];

  // Step navigation functions
  const handleAddShopNextStep = () => {
    if (addShopCurrentStep < shopModalSteps.length) {
      setAddShopCurrentStep(addShopCurrentStep + 1);
    }
  };

  const handleAddShopPrevStep = () => {
    if (addShopCurrentStep > 1) {
      setAddShopCurrentStep(addShopCurrentStep - 1);
    }
  };

  const handleEditShopNextStep = () => {
    if (editShopCurrentStep < shopModalSteps.length) {
      setEditShopCurrentStep(editShopCurrentStep + 1);
    }
  };

  const handleEditShopPrevStep = () => {
    if (editShopCurrentStep > 1) {
      setEditShopCurrentStep(editShopCurrentStep - 1);
    }
  };

  // Product modal step navigation functions
  const handleAddProductNextStep = () => {
    if (addProductCurrentStep < productModalSteps.length) {
      setAddProductCurrentStep(addProductCurrentStep + 1);
    }
  };

  const handleAddProductPrevStep = () => {
    if (addProductCurrentStep > 1) {
      setAddProductCurrentStep(addProductCurrentStep - 1);
    }
  };

  // Organization and Shop Management Data and State
  const initialOrganizations = [
    {
      id: 'org-1',
      name: 'Selvi Mills',
      type: 'internal',
      shops: []
    },
    {
      id: 'org-2',
      name: 'Al-Sheika',
      type: 'external',
      shops: [
        { 
          id: 'shop-1', 
          name: 'Al-Sheika Tuas', 
          details: 'Al-Sheika Tuas Location',
          address: '123 Application Road, #10-10, Singapore 246810',
          shipmentRegion: 'Tuas',
          paymentTerms: 'COD',
          customerType: 'Shop Cat 1',
          primaryContact: '+65 8468 2040 (Mani)',
          packaging: {
            palletType: 'Selvi Pallet',
            labelType: 'Selvi Logo',
            packagingType: 'Cardboard Box',
            weightType: '5kg packets'
          },
          parkingUnloading: {
            notes: 'To wait at checkpoint and call'
          },
          delivery: {
            openTime: '',
            closeTime: '',
            deliverAfter: '11:00',
            deliverBefore: '',
            closedOn: []
          },
          roles: {
            Manager: { name: 'Murali', contact: '+65 8170 7358' },
            'PIC of Payments': { name: 'Praveen', contact: 'N/A' },
            'PIC of Ordering': { name: 'Praveen', contact: 'N/A' }
          },
          internalBillingHold: false
        },
        { 
          id: 'shop-2', 
          name: 'Al-Sheika Boon Lay', 
          details: 'Al-Sheika Boon Lay Location',
          address: '456 Order Road, #05-05, Singapore 135791',
          shipmentRegion: 'Boon Lay',
          paymentTerms: 'B2B',
          customerType: 'Shop Cat 1',
          primaryContact: '+65 8468 2040 (Mani)',
          packaging: {
            palletType: 'Customer Pallet',
            labelType: 'Plain Sticker',
            packagingType: 'Plain Clear Plastic',
            weightType: '1kg packets'
          },
          parkingUnloading: {
            notes: 'Park near red gate. DO NOT enter carpark'
          },
          delivery: {
            openTime: '',
            closeTime: '',
            deliverAfter: '',
            deliverBefore: '15:00',
            closedOn: ['Tuesday']
          },
          roles: {
            Manager: { name: 'Murali', contact: '+65 8170 7358' },
            'PIC of Payments': { name: 'Murali', contact: '+65 8170 7358' },
            'PIC of Ordering': { name: 'Eswari', contact: 'N/A' }
          },
          internalBillingHold: false
        }
      ]
    }
  ];
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [unlinkedShops, setUnlinkedShops] = useState<any[]>([]);
  const [expandedOrgIds, setExpandedOrgIds] = useState<string[]>([]);
  const [expandedShopIds, setExpandedShopIds] = useState<string[]>([]);
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState('');

  // Helper functions for toggling
  const toggleOrg = (orgId: string) => {
    setExpandedOrgIds((prev: string[]) => prev.includes(orgId) ? prev.filter((id: string) => id !== orgId) : [...prev, orgId]);
  };
  const toggleShop = (shopId: string) => {
    setExpandedShopIds((prev: string[]) => prev.includes(shopId) ? prev.filter((id: string) => id !== shopId) : [...prev, shopId]);
  };
  const toggleUserExpansion = (userId: string) => {
    setExpandedUserIds((prev: string[]) => prev.includes(userId) ? prev.filter((id: string) => id !== userId) : [...prev, userId]);
  };

  // Search and filter logic for organizations
  const filteredOrganizations = useMemo(() => {
    if (!organizationSearchQuery.trim()) {
      return organizations;
    }
    return organizations.filter(org =>
      org.name.toLowerCase().includes(organizationSearchQuery.toLowerCase()) ||
      org.type.toLowerCase().includes(organizationSearchQuery.toLowerCase()) ||
      (org.shops && org.shops.some(shop => shop.name.toLowerCase().includes(organizationSearchQuery.toLowerCase())))
    );
  }, [organizations, organizationSearchQuery]);

  const handleOrganizationSelect = (orgId: string) => {
    // Expand the organization and all its shops
    setExpandedOrgIds(prev => prev.includes(orgId) ? prev : [...prev, orgId]);
    const selectedOrg = organizations.find(org => org.id === orgId);
    if (selectedOrg && selectedOrg.shops) {
      const shopIds = selectedOrg.shops.map(shop => shop.id);
      setExpandedShopIds(prev => {
        const newShopIds = shopIds.filter(shopId => !prev.includes(shopId));
        return [...prev, ...newShopIds];
      });
    }
  };

  const uniqueCategoriesFromProducts = useMemo(() => { 
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  }, [products]);

  const billingAddressOptions = useMemo(() => {
    return availableShippingAddresses.filter(addr => 
      addr !== selectedShippingAddressOption || addr === ADD_NEW_ADDRESS_DISPLAY_TEXT
    );
  }, [availableShippingAddresses, selectedShippingAddressOption]);


  useEffect(() => {
    // Load common data from localStorage
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) setCartItems(JSON.parse(storedCart));
    } catch (e) { console.error("Error parsing cartItems from localStorage", e); }

    try {
        const storedStagedItems = localStorage.getItem('stagedForTemplateItems');
        if (storedStagedItems) setStagedForTemplateItems(JSON.parse(storedStagedItems));
    } catch (e) { console.error("Error parsing stagedForTemplateItems from localStorage", e); }

    try {
        const storedTemplates = localStorage.getItem('savedTemplates');
        if (storedTemplates) setSavedTemplates(JSON.parse(storedTemplates));
    } catch (e) { console.error("Error parsing savedTemplates from localStorage", e); }

    try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (e) { console.error("Error parsing orders from localStorage", e); }
    
    try {
        const storedProductPageMode = localStorage.getItem('productPageMode');
        if (storedProductPageMode) setProductPageMode(storedProductPageMode as ProductPageMode);
    } catch (e) { console.error("Error parsing productPageMode from localStorage", e); }
        
    try {
        const storedSelectedCategories = localStorage.getItem('selectedCategories');
        if (storedSelectedCategories) setSelectedCategories(JSON.parse(storedSelectedCategories));
    } catch (e) { console.error("Error parsing selectedCategories from localStorage", e); }
    
    try {
        const storedActiveSort = localStorage.getItem('activeSort');
        if (storedActiveSort) setActiveSort(storedActiveSort as SortOption);
    } catch (e) { console.error("Error parsing activeSort from localStorage", e); }
    
    try {
        const storedCurrentDraftItems = localStorage.getItem('currentDraftTemplateItems');
        if (storedCurrentDraftItems) setCurrentDraftTemplateItems(JSON.parse(storedCurrentDraftItems));
    } catch (e) { console.error("Error parsing currentDraftTemplateItems from localStorage", e); }
    
    const storedNewTemplateName = localStorage.getItem('newTemplateName'); // String, no parse needed
    if (storedNewTemplateName) setNewTemplateName(storedNewTemplateName);
    
    try {
        const storedEditingTemplateId = localStorage.getItem('editingTemplateId');
        if (storedEditingTemplateId && storedEditingTemplateId !== 'null') { 
          setEditingTemplateId(JSON.parse(storedEditingTemplateId));
        } else {
          setEditingTemplateId(null);
        }
    } catch (e) { console.error("Error parsing editingTemplateId from localStorage", e); }

    try {
        const storedDraftDays = localStorage.getItem('currentDraftTemplateDays');
        if (storedDraftDays) setCurrentDraftTemplateDays(JSON.parse(storedDraftDays));
    } catch (e) { console.error("Error parsing currentDraftTemplateDays from localStorage", e); }
    
    try {
        const storedDraftShop = localStorage.getItem('currentDraftTemplateShop');
        if (storedDraftShop && storedDraftShop !== 'undefined') setCurrentDraftTemplateShop(JSON.parse(storedDraftShop));
    } catch (e) { console.error("Error parsing currentDraftTemplateShop from localStorage", e); }

    const storedOrderShopLocationItem = localStorage.getItem('selectedOrderShopLocation');
    if (storedOrderShopLocationItem) {
        try {
            const parsed = JSON.parse(storedOrderShopLocationItem);
            if (ShopLocations.includes(parsed as ShopLocation)) {
                setSelectedOrderShopLocation(parsed as ShopLocation);
            }
        } catch (e) { console.error("Error parsing selectedOrderShopLocation from localStorage", e); }
    }

    const storedAvailableShippingItem = localStorage.getItem('availableShippingAddresses');
    if (storedAvailableShippingItem) {
        try {
            const parsed = JSON.parse(storedAvailableShippingItem);
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string') && parsed.length > 0) {
                 setAvailableShippingAddresses(parsed);
            }
        } catch (e) { console.error("Error parsing availableShippingAddresses from localStorage", e); }
    }
    
    const storedSelectedShippingItem = localStorage.getItem('selectedShippingAddressOption'); // String
    if (storedSelectedShippingItem) {
        setSelectedShippingAddressOption(storedSelectedShippingItem);
    }
    
    const storedIsBillingSameItem = localStorage.getItem('isBillingSameAsShipping');
    if (storedIsBillingSameItem) {
        try {
            const parsed = JSON.parse(storedIsBillingSameItem);
            setIsBillingSameAsShipping(typeof parsed === 'boolean' ? parsed : true);
        } catch (e) { 
            console.error("Error parsing isBillingSameAsShipping from localStorage", e);
            setIsBillingSameAsShipping(true); 
        }
    }
    
    const storedSelectedBillingItem = localStorage.getItem('selectedBillingAddressOption'); // String
    if (storedSelectedBillingItem) {
        setSelectedBillingAddressOption(storedSelectedBillingItem);
    }

    const storedAvailableContactsItem = localStorage.getItem('availableContactInfos');
    if (storedAvailableContactsItem) {
        try {
            const parsed = JSON.parse(storedAvailableContactsItem);
             if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string') && parsed.length > 0) {
                setAvailableContactInfos(parsed);
            }
        } catch (e) { console.error("Error parsing availableContactInfos from localStorage", e); }
    }

    const storedSelectedContactItem = localStorage.getItem('selectedContactInfoOption'); // String
    if (storedSelectedContactItem) {
        setSelectedContactInfoOption(storedSelectedContactItem);
    }

    const storedProfileToggles = localStorage.getItem('profileToggles');
    if (storedProfileToggles) {
        try {
            const parsed = JSON.parse(storedProfileToggles);
            const defaultProfileState = {
                generalInfoSection: false, userInfoCard: false, orgDetailsCard: false, managerDetailsCard: false,
                shopDetailsSection: false, shopTuasCard: false, shopBoonLayCard: false,
                shopTuasUpdateRequestSent: false, shopBoonLayUpdateRequestSent: false,
            };
            setProfileToggles(prev => ({ ...defaultProfileState, ...parsed }));
        } catch (e) { console.error("Error parsing profileToggles from localStorage", e); }
    }

    const storedIsAdvanceOrder = localStorage.getItem('isAdvanceOrder');
    if (storedIsAdvanceOrder) {
        try {
            setIsAdvanceOrder(JSON.parse(storedIsAdvanceOrder));
        } catch (e) {
            console.error("Error parsing isAdvanceOrder from localStorage", e);
            setIsAdvanceOrder(false);
        }
    } else {
        setIsAdvanceOrder(false);
    }

    const storedInvoiceDate = localStorage.getItem('selectedInvoiceDate');
    if (storedInvoiceDate && storedInvoiceDate !== 'null') {
      try {
        setSelectedInvoiceDate(new Date(JSON.parse(storedInvoiceDate)));
      } catch (e) { console.error("Error parsing selectedInvoiceDate from localStorage", e); }
    }

    const storedOrderIdCounter = localStorage.getItem('orderIdCounter');
    if (storedOrderIdCounter) {
        const parsedCounter = parseInt(storedOrderIdCounter, 10);
        if (!isNaN(parsedCounter) && parsedCounter > 0) setOrderIdCounter(parsedCounter);
    }
    
    const storedSupportTickets = localStorage.getItem('allSupportTickets');
    if (storedSupportTickets) {
        try { setAllSupportTickets(JSON.parse(storedSupportTickets)); } catch (e) { console.error("Error parsing support tickets", e); }
    }
    
    const storedCustomerPage = localStorage.getItem('customerCurrentPage');
    if (storedCustomerPage) {
        try {
            const parsedPage = JSON.parse(storedCustomerPage) as Page;
            if (Object.values(Page).includes(parsedPage)) {
                setCustomerCurrentPage(parsedPage);
            } else {
                setCustomerCurrentPage(Page.PRODUCTS); // Default
            }
        } catch (e) {
            console.error("Error parsing customerCurrentPage from localStorage", e);
            setCustomerCurrentPage(Page.PRODUCTS); // Default
        }
    }

    const storedAdminPage = localStorage.getItem('adminCurrentPage');
    if (storedAdminPage) {
        try {
            const parsedPage = JSON.parse(storedAdminPage) as Page;
             if (Object.values(Page).includes(parsedPage) && parsedPage.startsWith('ADMIN_')) {
                setAdminCurrentPage(parsedPage);
            } else {
                setAdminCurrentPage(Page.ADMIN_ORDER_MANAGEMENT); // Default
            }
        } catch (e) {
            console.error("Error parsing adminCurrentPage from localStorage", e);
            setAdminCurrentPage(Page.ADMIN_ORDER_MANAGEMENT); // Default
        }
    } else {
        setAdminCurrentPage(Page.ADMIN_ORDER_MANAGEMENT); 
    }

    const storedPanelDisplayMode = localStorage.getItem('panelDisplayMode');
    if (storedPanelDisplayMode) {
        try {
            const parsedMode = JSON.parse(storedPanelDisplayMode) as PanelDisplayMode;
            if (['split', 'customerFocus', 'adminFocus'].includes(parsedMode)) {
                setPanelDisplayMode(parsedMode);
            } else {
                setPanelDisplayMode('split'); // Default
            }
        } catch (e) {
            console.error("Error parsing panelDisplayMode from localStorage", e);
            setPanelDisplayMode('split'); // Default
        }
    }
    
    const storedVisibleAdminCols = localStorage.getItem('visibleAdminOrderColumns');
    if (storedVisibleAdminCols) {
        try {
            const parsedCols = JSON.parse(storedVisibleAdminCols);
            if (Array.isArray(parsedCols) && parsedCols.every(col => ALL_ADMIN_ORDER_TABLE_COLUMNS.some(c => c.id === col))) {
                setVisibleAdminOrderColumns(parsedCols);
            }
        } catch (e) {
            console.error("Error parsing visible admin columns from localStorage", e);
        }
    } else { 
        setVisibleAdminOrderColumns(ALL_ADMIN_ORDER_TABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id));
    }

    const storedVisibleProductCols = localStorage.getItem('visibleAdminProductColumns');
    if (storedVisibleProductCols) {
        try {
            const parsedCols = JSON.parse(storedVisibleProductCols);
            if (Array.isArray(parsedCols) && parsedCols.every(col => ALL_ADMIN_PRODUCT_TABLE_COLUMNS.some(c => c.id === col))) {
                setVisibleAdminProductColumns(parsedCols);
            }
        } catch (e) {
            console.error("Error parsing visible product columns from localStorage", e);
        }
    } else { 
        setVisibleAdminProductColumns(ALL_ADMIN_PRODUCT_TABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id));
    }

    const storedShowProductImages = localStorage.getItem('showProductImages');
    if (storedShowProductImages) {
        try {
            setShowProductImages(JSON.parse(storedShowProductImages));
        } catch (e) {
            console.error("Error parsing showProductImages from localStorage", e);
            setShowProductImages(false); 
        }
    } else {
        setShowProductImages(false); 
    }

    const storedAdminOrderSubTab = localStorage.getItem('currentAdminOrderManagementSubTab');
    if (storedAdminOrderSubTab) {
        try {
            const parsedSubTab = JSON.parse(storedAdminOrderSubTab) as AdminOrderManagementSubTab;
            if (ADMIN_ORDER_MANAGEMENT_SUB_TABS.includes(parsedSubTab)) {
                setCurrentAdminOrderManagementSubTab(parsedSubTab);
            } else {
                 setCurrentAdminOrderManagementSubTab(ADMIN_ORDER_MANAGEMENT_SUB_TABS[0]);
            }
        } catch (e) {
            console.error("Error parsing admin order management sub-tab from localStorage", e);
            setCurrentAdminOrderManagementSubTab(ADMIN_ORDER_MANAGEMENT_SUB_TABS[0]);
        }
    }

    const storedAdminUserSubTab = localStorage.getItem('currentAdminUserManagementSubTab');
    if (storedAdminUserSubTab) {
        try {
            const parsedSubTab = JSON.parse(storedAdminUserSubTab) as AdminUserManagementSubTab;
            if (ADMIN_USER_MANAGEMENT_SUB_TABS.includes(parsedSubTab)) {
                setCurrentAdminUserManagementSubTab(parsedSubTab);
            } else {
                 setCurrentAdminUserManagementSubTab(ADMIN_USER_MANAGEMENT_SUB_TABS[0]);
            }
        } catch (e) {
            console.error("Error parsing admin user management sub-tab from localStorage", e);
            setCurrentAdminUserManagementSubTab(ADMIN_USER_MANAGEMENT_SUB_TABS[0]);
        }
    }

    const storedAppUsers = localStorage.getItem('allAppUsers');
    const combinedMockUsers = [...MOCK_INTERNAL_USERS, ...MOCK_CUSTOMER_USERS];
    if (storedAppUsers) {
        try { setAllAppUsers(JSON.parse(storedAppUsers)); }
        catch (e) { 
            console.error("Error parsing allAppUsers from localStorage, using mocks.", e);
            setAllAppUsers(combinedMockUsers);
        }
    } else {
        setAllAppUsers(combinedMockUsers);
    }

    // Load organizations data from localStorage
    const storedOrganizations = localStorage.getItem('organizations');
    if (storedOrganizations) {
        try { setOrganizations(JSON.parse(storedOrganizations)); }
        catch (e) { 
            console.error("Error parsing organizations from localStorage, using initial data.", e);
            setOrganizations(initialOrganizations);
        }
    } else {
        setOrganizations(initialOrganizations);
    }

    // Load unlinked shops data from localStorage  
    const storedUnlinkedShops = localStorage.getItem('unlinkedShops');
    if (storedUnlinkedShops) {
        try { setUnlinkedShops(JSON.parse(storedUnlinkedShops)); }
        catch (e) { 
            console.error("Error parsing unlinkedShops from localStorage.", e);
            setUnlinkedShops([]);
        }
    } else {
        setUnlinkedShops([]);
    }

    // Load products data from localStorage
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        try { setProducts(JSON.parse(storedProducts)); }
        catch (e) { 
            console.error("Error parsing products from localStorage, using MOCK_PRODUCTS.", e);
            setProducts(MOCK_PRODUCTS);
        }
    } else {
        setProducts(MOCK_PRODUCTS);
    }

    // Cross-tab synchronization: Listen for localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      console.log('🔄 Storage event received:', event.key, event.newValue ? 'has value' : 'no value');
      if (event.key && event.newValue) {
        try {
          switch (event.key) {
            case 'cartItems':
              console.log('🛒 Syncing cart items from other tab');
              setCartItems(JSON.parse(event.newValue));
              break;
            case 'stagedForTemplateItems':
              setStagedForTemplateItems(JSON.parse(event.newValue));
              break;
            case 'savedTemplates':
              setSavedTemplates(JSON.parse(event.newValue));
              break;
            case 'orders':
              console.log('📦 Syncing orders from other tab');
              setOrders(JSON.parse(event.newValue));
              break;
            case 'productPageMode':
              setProductPageMode(event.newValue as ProductPageMode);
              break;
            case 'selectedCategories':
              setSelectedCategories(JSON.parse(event.newValue));
              break;
            case 'activeSort':
              setActiveSort(event.newValue as SortOption);
              break;
            case 'currentDraftTemplateItems':
              setCurrentDraftTemplateItems(JSON.parse(event.newValue));
              break;
            case 'newTemplateName':
              setNewTemplateName(event.newValue);
              break;
            case 'editingTemplateId':
              if (event.newValue && event.newValue !== 'null') {
                setEditingTemplateId(JSON.parse(event.newValue));
              } else {
                setEditingTemplateId(null);
              }
              break;
            case 'currentDraftTemplateDays':
              setCurrentDraftTemplateDays(JSON.parse(event.newValue));
              break;
            case 'currentDraftTemplateShop':
              if (event.newValue && event.newValue !== 'undefined') {
                setCurrentDraftTemplateShop(JSON.parse(event.newValue));
              }
              break;
            case 'selectedOrderShopLocation':
              const parsedShopLocation = JSON.parse(event.newValue);
              if (ShopLocations.includes(parsedShopLocation as ShopLocation)) {
                setSelectedOrderShopLocation(parsedShopLocation as ShopLocation);
              }
              break;
            case 'availableShippingAddresses':
              const parsedShipping = JSON.parse(event.newValue);
              if (Array.isArray(parsedShipping) && parsedShipping.every(item => typeof item === 'string')) {
                setAvailableShippingAddresses(parsedShipping);
              }
              break;
            case 'selectedShippingAddressOption':
              setSelectedShippingAddressOption(event.newValue);
              break;
            case 'isBillingSameAsShipping':
              const parsedBilling = JSON.parse(event.newValue);
              setIsBillingSameAsShipping(typeof parsedBilling === 'boolean' ? parsedBilling : true);
              break;
            case 'selectedBillingAddressOption':
              setSelectedBillingAddressOption(event.newValue);
              break;
            case 'availableContactInfos':
              const parsedContacts = JSON.parse(event.newValue);
              if (Array.isArray(parsedContacts) && parsedContacts.every(item => typeof item === 'string')) {
                setAvailableContactInfos(parsedContacts);
              }
              break;
            case 'selectedContactInfoOption':
              setSelectedContactInfoOption(event.newValue);
              break;
            case 'profileToggles':
              const parsedToggles = JSON.parse(event.newValue);
              const defaultProfileState = {
                generalInfoSection: false, userInfoCard: false, orgDetailsCard: false, managerDetailsCard: false,
                shopDetailsSection: false, shopTuasCard: false, shopBoonLayCard: false,
                shopTuasUpdateRequestSent: false, shopBoonLayUpdateRequestSent: false,
              };
              setProfileToggles(prev => ({ ...defaultProfileState, ...parsedToggles }));
              break;
            case 'isAdvanceOrder':
              setIsAdvanceOrder(JSON.parse(event.newValue));
              break;
            case 'selectedInvoiceDate':
              if (event.newValue !== 'null') {
                setSelectedInvoiceDate(new Date(JSON.parse(event.newValue)));
              }
              break;
            case 'orderIdCounter':
              const parsedCounter = parseInt(event.newValue, 10);
              if (!isNaN(parsedCounter) && parsedCounter > 0) {
                setOrderIdCounter(parsedCounter);
              }
              break;
            case 'allSupportTickets':
              setAllSupportTickets(JSON.parse(event.newValue));
              break;
            // Note: Removed customerCurrentPage, adminCurrentPage, and panelDisplayMode sync to allow independent navigation per tab
            case 'visibleAdminOrderColumns':
              const parsedAdminCols = JSON.parse(event.newValue);
              if (Array.isArray(parsedAdminCols) && parsedAdminCols.every(col => ALL_ADMIN_ORDER_TABLE_COLUMNS.some(c => c.id === col))) {
                setVisibleAdminOrderColumns(parsedAdminCols);
              }
              break;
            case 'visibleAdminProductColumns':
              const parsedProductCols = JSON.parse(event.newValue);
              if (Array.isArray(parsedProductCols) && parsedProductCols.every(col => ALL_ADMIN_PRODUCT_TABLE_COLUMNS.some(c => c.id === col))) {
                setVisibleAdminProductColumns(parsedProductCols);
              }
              break;
            case 'showProductImages':
              setShowProductImages(JSON.parse(event.newValue));
              break;
            // Note: Removed currentAdminOrderManagementSubTab and currentAdminUserManagementSubTab sync to allow independent sub-tab navigation per tab
            case 'allAppUsers':
              setAllAppUsers(JSON.parse(event.newValue));
              break;
            case 'organizations':
              setOrganizations(JSON.parse(event.newValue));
              break;
            case 'unlinkedShops':
              setUnlinkedShops(JSON.parse(event.newValue));
              break;
            case 'products':
              setProducts(JSON.parse(event.newValue));
              break;
            // Add more cases as needed for other localStorage keys
          }
        } catch (e) {
          console.error(`Error syncing ${event.key} from localStorage:`, e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (toastTimersRef.current.showTimer) clearTimeout(toastTimersRef.current.showTimer);
      if (toastTimersRef.current.hideTimer) clearTimeout(toastTimersRef.current.hideTimer);
      if (toastTimersRef.current.removeTimer) clearTimeout(toastTimersRef.current.removeTimer);
    };
  }, []);

  useEffect(() => { localStorage.setItem('cartItems', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('stagedForTemplateItems', JSON.stringify(stagedForTemplateItems)); }, [stagedForTemplateItems]);
  useEffect(() => { localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates)); }, [savedTemplates]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('productPageMode', productPageMode); }, [productPageMode]);
  useEffect(() => { localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories)); }, [selectedCategories]);
  useEffect(() => { localStorage.setItem('activeSort', activeSort); }, [activeSort]);
  useEffect(() => { localStorage.setItem('currentDraftTemplateItems', JSON.stringify(currentDraftTemplateItems)); }, [currentDraftTemplateItems]);
  useEffect(() => { localStorage.setItem('newTemplateName', newTemplateName); }, [newTemplateName]);
  useEffect(() => { localStorage.setItem('editingTemplateId', JSON.stringify(editingTemplateId)); }, [editingTemplateId]);
  useEffect(() => { localStorage.setItem('currentDraftTemplateDays', JSON.stringify(currentDraftTemplateDays)); }, [currentDraftTemplateDays]);
  useEffect(() => { localStorage.setItem('currentDraftTemplateShop', JSON.stringify(currentDraftTemplateShop)); }, [currentDraftTemplateShop]);
  
  useEffect(() => { localStorage.setItem('selectedOrderShopLocation', JSON.stringify(selectedOrderShopLocation)); }, [selectedOrderShopLocation]);
  useEffect(() => { localStorage.setItem('availableShippingAddresses', JSON.stringify(availableShippingAddresses)); }, [availableShippingAddresses]);
  useEffect(() => { localStorage.setItem('selectedShippingAddressOption', selectedShippingAddressOption); }, [selectedShippingAddressOption]);
  useEffect(() => { localStorage.setItem('isBillingSameAsShipping', JSON.stringify(isBillingSameAsShipping)); }, [isBillingSameAsShipping]);
  useEffect(() => { localStorage.setItem('selectedBillingAddressOption', selectedBillingAddressOption); }, [selectedBillingAddressOption]);
  useEffect(() => { localStorage.setItem('availableContactInfos', JSON.stringify(availableContactInfos)); }, [availableContactInfos]);
  useEffect(() => { localStorage.setItem('selectedContactInfoOption', selectedContactInfoOption); }, [selectedContactInfoOption]);
  useEffect(() => { localStorage.setItem('profileToggles', JSON.stringify(profileToggles)); }, [profileToggles]);
  useEffect(() => { localStorage.setItem('isAdvanceOrder', JSON.stringify(isAdvanceOrder)); }, [isAdvanceOrder]);
  useEffect(() => { localStorage.setItem('selectedInvoiceDate', JSON.stringify(selectedInvoiceDate)); }, [selectedInvoiceDate]);
  useEffect(() => { localStorage.setItem('orderIdCounter', String(orderIdCounter)); }, [orderIdCounter]);
  useEffect(() => { localStorage.setItem('allSupportTickets', JSON.stringify(allSupportTickets)); }, [allSupportTickets]);
  useEffect(() => { localStorage.setItem('customerCurrentPage', JSON.stringify(customerCurrentPage)); }, [customerCurrentPage]);
  useEffect(() => { localStorage.setItem('adminCurrentPage', JSON.stringify(adminCurrentPage)); }, [adminCurrentPage]);
  useEffect(() => { localStorage.setItem('panelDisplayMode', JSON.stringify(panelDisplayMode)); }, [panelDisplayMode]);
  useEffect(() => { localStorage.setItem('visibleAdminOrderColumns', JSON.stringify(visibleAdminOrderColumns)); }, [visibleAdminOrderColumns]);
  useEffect(() => { localStorage.setItem('visibleAdminProductColumns', JSON.stringify(visibleAdminProductColumns)); }, [visibleAdminProductColumns]);
  useEffect(() => { localStorage.setItem('showProductImages', JSON.stringify(showProductImages)); }, [showProductImages]);
  useEffect(() => { localStorage.setItem('currentAdminOrderManagementSubTab', JSON.stringify(currentAdminOrderManagementSubTab)); }, [currentAdminOrderManagementSubTab]);
  useEffect(() => { localStorage.setItem('currentAdminUserManagementSubTab', JSON.stringify(currentAdminUserManagementSubTab)); }, [currentAdminUserManagementSubTab]);
  useEffect(() => { localStorage.setItem('allAppUsers', JSON.stringify(allAppUsers)); }, [allAppUsers]);
  useEffect(() => { localStorage.setItem('organizations', JSON.stringify(organizations)); }, [organizations]);
  useEffect(() => { localStorage.setItem('unlinkedShops', JSON.stringify(unlinkedShops)); }, [unlinkedShops]);
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);

  // Timer for order modification confirmation modal
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isModificationConfirmModalOpen && orderIdPendingModification) {
      const order = orders.find(o => o.id === orderIdPendingModification);
      if (order) {
        const updateTimer = () => {
          const orderCreatedTime = new Date(order.orderDate);
          const now = new Date();
          const diffMs = now.getTime() - orderCreatedTime.getTime();
          
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          setOrderTimerText(formattedTime);
        };
        
        // Initial update
        updateTimer();
        
        // Update every second
        interval = setInterval(updateTimer, 1000);
      }
    } else {
      setOrderTimerText('');
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isModificationConfirmModalOpen, orderIdPendingModification, orders]);

  // Auto-focus search input when modification page loads
  useEffect(() => {
    if (customerCurrentPage === Page.MODIFY_ORDER && showAddItemsSection && modificationSearchInputRef.current) {
      // Small delay to ensure the element is rendered
      const timer = setTimeout(() => {
        modificationSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [customerCurrentPage, showAddItemsSection]);

    useEffect(() => {
        const isValid = availableShippingAddresses.includes(selectedShippingAddressOption) ||
                        (selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT && availableShippingAddresses.includes(ADD_NEW_ADDRESS_DISPLAY_TEXT));
        if (!isValid) {
            const firstPredefined = availableShippingAddresses.find(addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE);
            setSelectedShippingAddressOption(firstPredefined || DEFAULT_SHIPPING_ADDRESS_1);
        }
    }, [availableShippingAddresses, selectedShippingAddressOption]);

    useEffect(() => {
        if (isBillingSameAsShipping) {
            setSelectedBillingAddressOption(selectedShippingAddressOption);
        } else {
            const currentValidBillingOptions = availableShippingAddresses.filter(addr =>
                addr !== selectedShippingAddressOption || addr === ADD_NEW_ADDRESS_DISPLAY_TEXT
            );
            const isValidBilling = currentValidBillingOptions.includes(selectedBillingAddressOption) ||
                                (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT && currentValidBillingOptions.includes(ADD_NEW_ADDRESS_DISPLAY_TEXT));

            if (!isValidBilling) {
                const firstValidOption = currentValidBillingOptions.find(addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE) ||
                                       (currentValidBillingOptions.includes(ADD_NEW_ADDRESS_DISPLAY_TEXT) ? ADD_NEW_ADDRESS_DISPLAY_TEXT : DEFAULT_SHIPPING_ADDRESS_1);
                setSelectedBillingAddressOption(firstValidOption);
            }
        }
    }, [isBillingSameAsShipping, selectedShippingAddressOption, availableShippingAddresses, selectedBillingAddressOption]); 

    useEffect(() => {
        const isValidContact = availableContactInfos.includes(selectedContactInfoOption) ||
                            (selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT && availableContactInfos.includes(ADD_NEW_CONTACT_DISPLAY_TEXT));
        if (!isValidContact) {
            const firstPredefinedContact = availableContactInfos.find(contact => contact !== ADD_NEW_CONTACT_DISPLAY_TEXT && contact !== ADD_NEW_CONTACT_OPTION_VALUE);
            setSelectedContactInfoOption(firstPredefinedContact || DEFAULT_CONTACT_INFO_STRING);
        }
    }, [availableContactInfos, selectedContactInfoOption]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editingCellInfo && inlineEditPopupRef.current && !inlineEditPopupRef.current.contains(event.target as Node)) {
                setEditingCellInfo(null);
            }
            if (isAssignmentPriorityModalOpen && assignmentPriorityModalInfo && inlineEditPopupRef.current && !inlineEditPopupRef.current.contains(event.target as Node)){
                 // Do not close assignment priority modal on outside click, only by button.
            }
        };
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (editingCellInfo && event.key === 'Escape') {
                setEditingCellInfo(null);
            }
            if (isAssignmentPriorityModalOpen && event.key === 'Escape') {
                setIsAssignmentPriorityModalOpen(false);
                setAssignmentPriorityModalInfo(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [editingCellInfo, isAssignmentPriorityModalOpen, assignmentPriorityModalInfo]);


  const showToast = useCallback((message: string) => {
    if (toastTimersRef.current.showTimer) clearTimeout(toastTimersRef.current.showTimer);
    if (toastTimersRef.current.hideTimer) clearTimeout(toastTimersRef.current.hideTimer);
    if (toastTimersRef.current.removeTimer) clearTimeout(toastTimersRef.current.removeTimer);

    setToastText(message);
    setAnimateToastIn(false); 

    toastTimersRef.current.showTimer = window.setTimeout(() => {
      setAnimateToastIn(true);
      toastTimersRef.current.hideTimer = window.setTimeout(() => {
        setAnimateToastIn(false);
        toastTimersRef.current.removeTimer = window.setTimeout(() => {
          setToastText(null);
        }, TOAST_FADE_ANIMATION_DURATION);
      }, TOAST_VISIBLE_DURATION);
    }, TOAST_SHOW_DELAY);
  }, []);
  
  const handleInitiateOrderQuantityEntry = (productId: string, currentQuantity?: number) => {
    setProductPendingOrderQuantityProductId(productId);
    setProductPendingTemplateQuantityProductId(null);
  };

  const handleConfirmOrderQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || quantity <= 0) return;

    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex] = { ...updatedCartItems[existingItemIndex], quantity: quantity };
      setCartItems(updatedCartItems);
      showToast(`${product.name} quantity updated to ${quantity} in cart`);
    } else {
      setCartItems([...cartItems, { productId: productId, quantity: quantity }]);
      showToast(`${product.name} (x${quantity}) added to cart`);
    }
    setProductPendingOrderQuantityProductId(null);
  };

  const handleCancelOrderQuantityEntry = () => {
    setProductPendingOrderQuantityProductId(null);
  };

  const handleRemoveFromOrderCart = (productId: string, showUndoToast = true) => {
    const productName = products.find(p => p.id === productId)?.name || 'Item';
    setCartItems(cartItems.filter(item => item.productId !== productId));
    if (productPendingOrderQuantityProductId === productId) {
      setProductPendingOrderQuantityProductId(null);
    }
    if (showUndoToast) {
      showToast(`${productName} removed from cart`);
    }
  };

  const handleInitiateTemplateQuantityEntry = (productId: string, currentQuantity?: number) => {
    setProductPendingTemplateQuantityProductId(productId);
    setProductPendingOrderQuantityProductId(null);
  };

  const handleConfirmTemplateQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || quantity <= 0) return;
  
    setCurrentDraftTemplateItems(prevDraftItems => {
      const existingItemIndex = prevDraftItems.findIndex(item => item.product.id === productId);
      let newDraftItems;
      if (existingItemIndex > -1) {
        newDraftItems = [...prevDraftItems];
        newDraftItems[existingItemIndex] = { ...newDraftItems[existingItemIndex], quantity: quantity };
        showToast(`${product.name} quantity updated to ${quantity} in draft`);
      } else {
        newDraftItems = [...prevDraftItems, { product, quantity: quantity }];
        showToast(`${product.name} (x${quantity}) added to draft`);
      }
      return newDraftItems;
    });
    setProductPendingTemplateQuantityProductId(null);
  };
  
  const handleCancelTemplateQuantityEntry = () => {
    setProductPendingTemplateQuantityProductId(null);
  };

  const handleRemoveFromTemplateDraft = (productId: string, showUndoToast = true) => {
    const product = products.find(p => p.id === productId);
    setCurrentDraftTemplateItems(prev => prev.filter(item => item.product.id !== productId));
    if (productPendingTemplateQuantityProductId === productId) {
        setProductPendingTemplateQuantityProductId(null);
    }
    if (showUndoToast && product) {
        showToast(`${product.name} removed from draft`);
    }
  };


  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromOrderCart(productId, false); 
    } else {
      setCartItems(cartItems.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const handleFinalizeTemplate = () => {
    const trimmedNewName = newTemplateName.trim();
    if (trimmedNewName === '') {
      showToast('Template name cannot be empty');
      return;
    }
    const itemsToSave = currentDraftTemplateItems.filter(item => item.quantity > 0);

    if (itemsToSave.length === 0) {
      showToast('Add items with quantity to the template');
      return;
    }

    const nameExists = savedTemplates.some(
      template => 
        template.name.toLowerCase() === trimmedNewName.toLowerCase() &&
        template.id !== editingTemplateId 
    );

    if (nameExists) {
      showToast(`A template named "${trimmedNewName}" already exists. Please choose a different name.`);
      return;
    }

    if (editingTemplateId) {
        const updatedTemplates = savedTemplates.map(t => 
            t.id === editingTemplateId 
            ? { 
                ...t, 
                name: trimmedNewName, 
                items: itemsToSave.map(item => ({ productId: item.product.id, quantity: item.quantity })),
                days: currentDraftTemplateDays,
                shop: currentDraftTemplateShop,
                updatedAt: new Date().toISOString()
              } 
            : t
        );
        setSavedTemplates(updatedTemplates);
        showToast(`Template "${trimmedNewName}" updated`);
    } else {
        const newTemplate: Template = {
          id: `template_${Date.now()}`,
          name: trimmedNewName,
          items: itemsToSave.map(item => ({ productId: item.product.id, quantity: item.quantity })),
          days: currentDraftTemplateDays,
          shop: currentDraftTemplateShop,
          createdAt: new Date().toISOString(),
        };
        setSavedTemplates([...savedTemplates, newTemplate]);
        showToast(`Template "${trimmedNewName}" saved`);
    }

    setNewTemplateName('');
    setCurrentDraftTemplateItems([]);
    setCurrentDraftTemplateDays([]);
    setCurrentDraftTemplateShop(undefined);
    setStagedForTemplateItems([]); 
    setEditingTemplateId(null);
    setProductPendingTemplateQuantityProductId(null);
    setCustomerCurrentPage(Page.TEMPLATES);
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty');
      if (customerCurrentPage === Page.ORDER_DETAILS) {
        setCustomerCurrentPage(Page.CART);
      }
      return;
    }

    if (selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT || selectedContactInfoOption === ADD_NEW_CONTACT_OPTION_VALUE ||
        selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE ||
        (!isBillingSameAsShipping && (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedBillingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) ||
        (isAdvanceOrder && !selectedInvoiceDate)
      ) {
        let message = "Please ensure all order details are correctly selected";
        if (isAdvanceOrder && !selectedInvoiceDate) message += " including Invoice Date";
        message += ".";
        showToast(message);
        return;
    }

    const orderItems: ProductInCart[] = cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId)!; // Assuming product will be found; handled by cartProducts useMemo for display
      return { ...product, quantity: cartItem.quantity };
    });
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalBillingAddress = isBillingSameAsShipping ? selectedShippingAddressOption : selectedBillingAddressOption;
    const orderDate = new Date().toISOString();
    
    const newOrderId = String(orderIdCounter).padStart(4, '0');

    const newOrder: Order = {
      id: newOrderId,
      items: orderItems,
      totalPrice,
      orderDate: orderDate,
      invoiceDate: isAdvanceOrder && selectedInvoiceDate ? selectedInvoiceDate.toISOString() : orderDate,
      status: 'To select date', 
      shopLocation: selectedOrderShopLocation,
      shippingAddress: selectedShippingAddressOption,
      billingAddress: finalBillingAddress,
      contactNumber: selectedContactInfoOption,
      attachedPhotoName: attachedPhoto ? attachedPhoto.name : undefined,
      attachedDocumentName: attachedDocument ? attachedDocument.name : undefined,
      customerType: DEFAULT_CUSTOMER_TYPE,
      // billedDate will be set upon billing completion
    };
    setOrders([...orders, newOrder]);
    setCurrentOrderDetails(newOrder);
    setOrderIdCounter(prev => prev + 1);
    
    setCartItems([]); 
    setAttachedPhoto(null);
    setAttachedDocument(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
    setIsAdvanceOrder(false);
    setSelectedInvoiceDate(null);
    setProductPendingOrderQuantityProductId(null);

    setCustomerCurrentPage(Page.ORDER_CONFIRMATION);
    showToast('Order placed successfully!');
  };

  const handleViewTemplateDetails = (templateId: string) => {
    setEditingTemplateId(null); 
    setViewingTemplateId(templateId);
    setCustomerCurrentPage(Page.VIEW_TEMPLATE_DETAILS);
  };
  
  const handleReorder = (orderId: string) => {
    const orderToReorder = orders.find(o => o.id === orderId);
    if (orderToReorder) {
        const newCartItems: CartItem[] = orderToReorder.items.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        setCartItems(newCartItems);
        showToast(`Items from order ${orderId} added to cart. Review and checkout.`);
        setProductPendingOrderQuantityProductId(null); 
        setCustomerCurrentPage(Page.CART); 
    }
  };

  const handleModifyOrder = (orderId: string) => {
    // Show confirmation dialog first
    setOrderIdPendingModification(orderId);
    setIsModificationConfirmModalOpen(true);
  };

  const handleConfirmModification = () => {
    if (!orderIdPendingModification) return;
    
    const orderToModify = orders.find(o => o.id === orderIdPendingModification);
    if (orderToModify) {
        // Load the order into modification state
        setOrderBeingModified(orderToModify);
        const modificationItems: CartItem[] = orderToModify.items.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        setModificationCartItems(modificationItems);
        setIsInModificationMode(true);
        setShowAddItemsSection(true); // Open search section by default
        setModificationSearchQuery(''); // Clear any previous search
        // Clear regular cart to avoid confusion
        setCartItems([]);
        showToast(`Order ${orderIdPendingModification} loaded for modification.`);
        setProductPendingOrderQuantityProductId(null); 
        setCustomerCurrentPage(Page.MODIFY_ORDER); 
    }
    
    // Close modal and clear pending state
    setIsModificationConfirmModalOpen(false);
    setOrderIdPendingModification(null);
  };

  const handleCancelModificationConfirm = () => {
    setIsModificationConfirmModalOpen(false);
    setOrderIdPendingModification(null);
  };

  const handleOpenModificationSummary = (newItems: ProductInCart[], newTotal: number) => {
    if (!orderBeingModified) {
      return;
    }
    
    setModificationSummaryData({
      originalItems: orderBeingModified.items,
      newItems: newItems,
      originalTotal: orderBeingModified.totalPrice,
      newTotal: newTotal
    });
    setIsModificationSummaryModalOpen(true);
  };

  const handleCloseModificationSummary = () => {
    setIsModificationSummaryModalOpen(false);
    setModificationSummaryData(null);
  };

  const handleConfirmModificationSummary = () => {
    // Get the data from the modal summary
    if (modificationSummaryData && orderBeingModified) {
      performOrderModificationSave(modificationSummaryData.newItems, modificationSummaryData.newTotal);
    }
    
    // Close the summary modal
    setIsModificationSummaryModalOpen(false);
    setModificationSummaryData(null);
  };

  const performOrderModificationSave = (newItems: ProductInCart[], newTotal: number) => {
    if (!orderBeingModified) {
      return;
    }

    // Note: UI now prevents modification of items with pending requests,
    // so this server-side validation is no longer needed

    // Calculate modification request summary
    const originalItems = orderBeingModified.items;
    const originalTotal = orderBeingModified.totalPrice;
    const priceChange = newTotal - originalTotal;
    
    let requestSummary = '';
    if (originalItems.length !== newItems.length) {
      requestSummary += `Items changed from ${originalItems.length} to ${newItems.length}. `;
    }
    if (priceChange !== 0) {
      requestSummary += `Total changed by $${Math.abs(priceChange).toFixed(2)} (${priceChange > 0 ? 'increase' : 'decrease'})`;
    }

    // Create modification request instead of immediately modifying the order
    // Calculate change information for each item
    const originalItemsMap = new Map(originalItems.map(item => [item.id, item]));
    const newItemsMap = new Map(newItems.map(item => [item.id, item]));
    
    // Find items that were removed (in original but not in new)
    const removedItems = originalItems.filter(originalItem => !newItemsMap.has(originalItem.id));
    
    const modificationRequest: ModificationRequest = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      requestedItems: newItems.map(item => {
        const originalItem = originalItemsMap.get(item.id);
        let changeType: 'added' | 'removed' | 'quantityChanged';
        let originalQuantity: number | undefined;
        
        if (!originalItem) {
          // Item is being added
          changeType = 'added';
          originalQuantity = undefined; // Was not in original order
        } else if (originalItem.quantity !== item.quantity) {
          // Quantity is being changed
          changeType = 'quantityChanged';
          originalQuantity = originalItem.quantity;
        } else {
          // This shouldn't happen in normal flow, but handle it
          changeType = 'quantityChanged';
          originalQuantity = originalItem.quantity;
        }
        
        return {
          ...item,
          itemStatus: 'pending' as ModificationRequestStatus,
          processedDate: undefined,
          processedBy: undefined,
          changeType,
          originalQuantity
        };
      }),
      requestedTotalPrice: newTotal,
      requestDate: new Date().toISOString(),
      requestSummary: requestSummary || 'Order modification requested',
      status: 'pending',
      // Store removed items information for processing later (don't put in processedRemovedItems yet)
      pendingRemovedItems: removedItems.map(item => ({
        productId: item.id,
        productName: item.name,
        originalQuantity: item.quantity,
        unitPrice: item.price,
        changeType: 'removed' as const
      }))
    };

    // Get existing requests and add the new one
    const existingRequests = orderBeingModified.modificationRequests || [];
    
    // Update the order with new modification request added to array
    const updatedOrder: Order = {
      ...orderBeingModified,
      modificationRequests: [...existingRequests, modificationRequest]
    };

    const newOrders = orders.map(order => 
      order.id === orderBeingModified.id ? updatedOrder : order
    );
    
    setOrders(newOrders);

    // Clear modification state
    setOrderBeingModified(null);
    setModificationCartItems([]);
    setIsInModificationMode(false);
    setModificationSearchQuery('');
    setShowAddItemsSection(false);
    
    showToast(`Modification request for Order ${orderBeingModified.id} submitted successfully!`);
    setCustomerCurrentPage(Page.ORDER_HISTORY);
  };

  const canModifyOrder = (order: Order): boolean => {
    // Orders can be modified if they haven't been shipped or delivered
    const nonModifiableStatuses: OrderStatus[] = ['Shipped', 'Delivered', 'Cancelled'];
    return !nonModifiableStatuses.includes(order.status);
  };

  const handleAcceptModificationRequest = (orderId: string, requestId?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.modificationRequests || order.modificationRequests.length === 0) {
      showToast('No modification requests found');
      return;
    }

    // If no specific request ID provided, accept the most recent pending request
    const modificationRequest = requestId 
      ? order.modificationRequests.find(req => req.id === requestId && req.status === 'pending')
      : order.modificationRequests.find(req => req.status === 'pending');

    if (!modificationRequest) {
      showToast('No pending modification request found');
      return;
    }
    
    // Create the processed request with moved removed items
    const processedRequest: ModificationRequest = {
      ...modificationRequest,
      status: 'accepted' as ModificationRequestStatus,
      processedDate: new Date().toISOString(),
      processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF,
      // Move pending removed items to processed with 'accepted' status
      processedRemovedItems: modificationRequest.pendingRemovedItems?.map(item => ({
        ...item,
        status: 'accepted' as ModificationRequestStatus,
        processedDate: new Date().toISOString(),
        processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
      })) || [],
      // Clear pending removed items since they're now processed
      pendingRemovedItems: []
    };

    // Remove the processed request from pending and add to processed
    const remainingPendingRequests = order.modificationRequests.filter(req => req.id !== modificationRequest.id);
    const existingProcessedRequests = order.processedModificationRequests || [];

    // Properly merge the modification request with the existing order
    const originalItems = order.items;
    const requestedItems = modificationRequest.requestedItems;
    
    // Start with original items
    let finalItems = [...originalItems];
    
    // Find items that were removed (in original but not in requested)
    const requestedItemIds = new Set(requestedItems.map(item => item.id));
    finalItems = finalItems.filter(item => requestedItemIds.has(item.id));
    
    // Process requested items
    requestedItems.forEach(requestedItem => {
      const existingItemIndex = finalItems.findIndex(item => item.id === requestedItem.id);
      
      if (existingItemIndex !== -1) {
        // Item exists - update quantity
        finalItems[existingItemIndex] = {
          ...finalItems[existingItemIndex],
          quantity: requestedItem.quantity
        };
      } else {
        // Item doesn't exist - add as new item
        finalItems.push({
          id: requestedItem.id,
          name: requestedItem.name,
          description: requestedItem.description,
          price: requestedItem.price,
          imageUrl: requestedItem.imageUrl,
          category: requestedItem.category,
          uom: requestedItem.uom,
          quantity: requestedItem.quantity
        });
      }
    });
    
    // Calculate the new total price based on final items
    const newTotalPrice = finalItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const updatedOrder: Order = {
      ...order,
      items: finalItems,
      totalPrice: newTotalPrice,
      status: 'To select date', // Reset status for re-processing
      isModified: true,
      originalTotalPrice: order.totalPrice,
      modificationDate: new Date().toISOString(),
      modificationSummary: modificationRequest.requestSummary,
      modificationRequests: remainingPendingRequests,
      processedModificationRequests: [...existingProcessedRequests, processedRequest]
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    showToast(`Modification request for Order ${orderId} accepted successfully!`);
  };

  const handleDenyModificationRequest = (orderId: string, requestId?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.modificationRequests || order.modificationRequests.length === 0) {
      showToast('No modification requests found');
      return;
    }

    // If no specific request ID provided, deny the most recent pending request
    const modificationRequest = requestId 
      ? order.modificationRequests.find(req => req.id === requestId && req.status === 'pending')
      : order.modificationRequests.find(req => req.status === 'pending');

    if (!modificationRequest) {
      showToast('No pending modification request found');
      return;
    }
    
    // Create the processed request with moved removed items
    const processedRequest: ModificationRequest = {
      ...modificationRequest,
      status: 'denied' as ModificationRequestStatus,
      processedDate: new Date().toISOString(),
      processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF,
      // Move pending removed items to processed with 'denied' status
      processedRemovedItems: modificationRequest.pendingRemovedItems?.map(item => ({
        ...item,
        status: 'denied' as ModificationRequestStatus,
        processedDate: new Date().toISOString(),
        processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
      })) || [],
      // Clear pending removed items since they're now processed
      pendingRemovedItems: []
    };

    // Remove the processed request from pending and add to processed
    const remainingPendingRequests = order.modificationRequests.filter(req => req.id !== modificationRequest.id);
    const existingProcessedRequests = order.processedModificationRequests || [];

    const updatedOrder: Order = {
      ...order,
      modificationRequests: remainingPendingRequests,
      processedModificationRequests: [...existingProcessedRequests, processedRequest]
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    showToast(`Modification request for Order ${orderId} denied.`);
  };

  // New handlers for individual product processing
  const handleAcceptProductModificationRequest = (orderId: string, requestId: string, productId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.modificationRequests || order.modificationRequests.length === 0) {
      showToast('No modification requests found');
      return;
    }

    const modificationRequest = order.modificationRequests.find(req => req.id === requestId);
    if (!modificationRequest) {
      showToast('Modification request not found');
      return;
    }

    // Check if this is a removed item (not in requestedItems)
    const isRemovedItem = !modificationRequest.requestedItems.find(item => item.id === productId);
    
    let updatedRequests;
    
    if (isRemovedItem) {
      // For removed items, we need to track them separately
      // Add processed removed items to a special tracking array
      updatedRequests = order.modificationRequests.map(req => 
        req.id === requestId 
          ? {
              ...req,
              processedRemovedItems: [
                ...(req.processedRemovedItems || []),
                {
                  productId,
                  status: 'accepted' as ModificationRequestStatus,
                  processedDate: new Date().toISOString(),
                  processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
                }
              ]
            }
          : req
      );
    } else {
      // Update the specific product status to accepted for regular items
      updatedRequests = order.modificationRequests.map(req => 
        req.id === requestId 
          ? {
              ...req,
              requestedItems: req.requestedItems.map(item => 
                item.id === productId 
                  ? {
                      ...item,
                      itemStatus: 'accepted' as ModificationRequestStatus,
                      processedDate: new Date().toISOString(),
                      processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
                    }
                  : item
              )
            }
          : req
      );
    }

    // Apply accepted changes immediately to the order items
    const updatedRequest = updatedRequests.find(req => req.id === requestId)!;
    
    // Get the current order items (which may have been modified by previous acceptances)
    let currentItems = [...order.items];
    
    // Apply this specific acceptance to the order
    if (isRemovedItem) {
      // Remove this item from the order
      currentItems = currentItems.filter(item => item.id !== productId);
    } else {
      // Find the requested item that was just accepted
      const acceptedItem = updatedRequest.requestedItems.find(item => item.id === productId);
      if (acceptedItem && acceptedItem.itemStatus === 'accepted') {
        const existingItemIndex = currentItems.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
          // Item exists - update quantity
          currentItems[existingItemIndex] = {
            ...currentItems[existingItemIndex],
            quantity: acceptedItem.quantity
          };
        } else {
          // Item doesn't exist - add as new item
          currentItems.push({
            id: acceptedItem.id,
            name: acceptedItem.name,
            description: acceptedItem.description,
            price: acceptedItem.price,
            imageUrl: acceptedItem.imageUrl,
            category: acceptedItem.category,
            uom: acceptedItem.uom,
            quantity: acceptedItem.quantity
          });
        }
      }
    }
    
    // Calculate the new total price
    const newTotalPrice = currentItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Check if all items in this request have been processed
    const allRegularItemsProcessed = updatedRequest.requestedItems.every(item => item.itemStatus !== 'pending');
    
    // Count processed removed items
    const originalItems = order.items;
    const requestedItems = updatedRequest.requestedItems;
    const removedItemIds = originalItems
      .filter(originalItem => !requestedItems.find(r => r.id === originalItem.id))
      .map(item => item.id);
    
    const processedRemovedItems = updatedRequest.processedRemovedItems || [];
    const allRemovedItemsProcessed = removedItemIds.every(removedId => 
      processedRemovedItems.find(processed => processed.productId === removedId)
    );
    
    const allItemsProcessed = allRegularItemsProcessed && allRemovedItemsProcessed;
    
    if (allItemsProcessed) {
      // All items processed - move request to processed array
      const allRegularAccepted = updatedRequest.requestedItems.every(item => item.itemStatus === 'accepted');
      const allRegularDenied = updatedRequest.requestedItems.every(item => item.itemStatus === 'denied');
      const allRemovedAccepted = processedRemovedItems.every(item => item.status === 'accepted');
      const allRemovedDenied = processedRemovedItems.every(item => item.status === 'denied');
      
      const allAccepted = allRegularAccepted && allRemovedAccepted;
      const allDenied = allRegularDenied && allRemovedDenied;

      // Create the final processed request
      const processedRequest: ModificationRequest = {
        ...updatedRequest,
        status: allAccepted ? 'accepted' as ModificationRequestStatus : 
                allDenied ? 'denied' as ModificationRequestStatus :
                'accepted' as ModificationRequestStatus, // Mixed - consider accepted if at least one accepted
        processedDate: new Date().toISOString(),
        processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
      };

      // Remove the processed request from pending and add to processed
      const remainingPendingRequests = updatedRequests.filter(req => req.id !== requestId);
      const existingProcessedRequests = order.processedModificationRequests || [];

      const updatedOrder: Order = {
        ...order,
        items: currentItems,
        totalPrice: newTotalPrice,
        status: 'To select date', // Reset status for re-processing
        isModified: true,
        originalTotalPrice: order.originalTotalPrice || order.totalPrice,
        modificationDate: new Date().toISOString(),
        modificationSummary: updatedRequest.requestSummary,
        modificationRequests: remainingPendingRequests,
        processedModificationRequests: [...existingProcessedRequests, processedRequest]
      };
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      showToast(`Request processing complete for Order ${orderId}!`);
    } else {
      // Not all items processed yet, but apply this accepted change immediately
      const updatedOrder: Order = {
        ...order,
        items: currentItems,
        totalPrice: newTotalPrice,
        status: 'To select date', // Reset status for re-processing
        isModified: true,
        originalTotalPrice: order.originalTotalPrice || order.totalPrice,
        modificationDate: new Date().toISOString(),
        modificationSummary: updatedRequest.requestSummary,
        modificationRequests: updatedRequests
      };
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      showToast(`Product accepted and applied to Order ${orderId}. Waiting for other products to be processed.`);
    }
  };

  const handleDenyProductModificationRequest = (orderId: string, requestId: string, productId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.modificationRequests || order.modificationRequests.length === 0) {
      showToast('No modification requests found');
      return;
    }

    const modificationRequest = order.modificationRequests.find(req => req.id === requestId);
    if (!modificationRequest) {
      showToast('Modification request not found');
      return;
    }

    // Check if this is a removed item (not in requestedItems)
    const isRemovedItem = !modificationRequest.requestedItems.find(item => item.id === productId);
    
    let updatedRequests;
    
    if (isRemovedItem) {
      // For removed items, we need to track them separately
      updatedRequests = order.modificationRequests.map(req => 
        req.id === requestId 
          ? {
              ...req,
              processedRemovedItems: [
                ...(req.processedRemovedItems || []),
                {
                  productId,
                  status: 'denied' as ModificationRequestStatus,
                  processedDate: new Date().toISOString(),
                  processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
                }
              ]
            }
          : req
      );
    } else {
      // Update the specific product status to denied for regular items
      updatedRequests = order.modificationRequests.map(req => 
        req.id === requestId 
          ? {
              ...req,
              requestedItems: req.requestedItems.map(item => 
                item.id === productId 
                  ? {
                      ...item,
                      itemStatus: 'denied' as ModificationRequestStatus,
                      processedDate: new Date().toISOString(),
                      processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
                    }
                  : item
              )
            }
          : req
      );
    }

    // Check if all items in this request have been processed
    const updatedRequest = updatedRequests.find(req => req.id === requestId)!;
    
    // Count processed regular items
    const allRegularItemsProcessed = updatedRequest.requestedItems.every(item => item.itemStatus !== 'pending');
    
    // Count processed removed items
    const originalItems = order.items;
    const requestedItems = updatedRequest.requestedItems;
    const removedItemIds = originalItems
      .filter(originalItem => !requestedItems.find(r => r.id === originalItem.id))
      .map(item => item.id);
    
    const processedRemovedItems = updatedRequest.processedRemovedItems || [];
    const allRemovedItemsProcessed = removedItemIds.every(removedId => 
      processedRemovedItems.find(processed => processed.productId === removedId)
    );
    
    const allItemsProcessed = allRegularItemsProcessed && allRemovedItemsProcessed;
    
    if (allItemsProcessed) {
      // Update overall request status
      const allRegularAccepted = updatedRequest.requestedItems.every(item => item.itemStatus === 'accepted');
      const allRegularDenied = updatedRequest.requestedItems.every(item => item.itemStatus === 'denied');
      const allRemovedAccepted = processedRemovedItems.every(item => item.status === 'accepted');
      const allRemovedDenied = processedRemovedItems.every(item => item.status === 'denied');
      
      const allAccepted = allRegularAccepted && allRemovedAccepted;
      const allDenied = allRegularDenied && allRemovedDenied;

      // Create the final processed request
      const processedRequest: ModificationRequest = {
        ...updatedRequest,
        status: allAccepted ? 'accepted' as ModificationRequestStatus : 
                allDenied ? 'denied' as ModificationRequestStatus :
                'accepted' as ModificationRequestStatus, // Mixed - consider accepted if at least one accepted
        processedDate: new Date().toISOString(),
        processedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF
      };

      // Remove the processed request from pending and add to processed
      const remainingPendingRequests = updatedRequests.filter(req => req.id !== requestId);
      const existingProcessedRequests = order.processedModificationRequests || [];

      const updatedOrder: Order = {
        ...order,
        modificationRequests: remainingPendingRequests,
        processedModificationRequests: [...existingProcessedRequests, processedRequest]
      };
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      showToast(`Product denied. Request processing complete.`);
    } else {
      // Not all items processed yet, just update the requests
      const updatedOrder: Order = {
        ...order,
        modificationRequests: updatedRequests
      };
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      showToast(`Product denied. Waiting for other products to be processed.`);
    }
  };

  // Helper function to get modification request status for an order
  const getModificationRequestStatus = (order: Order) => {
    const pendingRequests = order.modificationRequests || [];
    const processedRequests = order.processedModificationRequests || [];
    
    if (pendingRequests.length > 0 && processedRequests.length > 0) {
      return {
        type: 'mixed' as const,
        pendingCount: pendingRequests.length,
        processedCount: processedRequests.length,
        totalCount: pendingRequests.length + processedRequests.length,
        borderColor: 'border-l-purple-500',
        iconColor: 'text-purple-600'
      };
    } else if (pendingRequests.length > 0) {
      return {
        type: 'pending' as const,
        pendingCount: pendingRequests.length,
        processedCount: 0,
        totalCount: pendingRequests.length,
        borderColor: 'border-l-orange-500',
        iconColor: 'text-orange-600'
      };
    } else if (processedRequests.length > 0) {
      return {
        type: 'processed' as const,
        pendingCount: 0,
        processedCount: processedRequests.length,
        totalCount: processedRequests.length,
        borderColor: 'border-l-blue-500',
        iconColor: 'text-blue-600'
      };
    }
    
    return null;
  };

  const handleUseTemplate = (templateId: string) => {
      const templateToUse = savedTemplates.find(t => t.id === templateId);
      if (templateToUse) {
          const newCartItems: CartItem[] = templateToUse.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
          }));
          let updatedCart = [...cartItems];
          newCartItems.forEach(newItem => {
              const existingIndex = updatedCart.findIndex(cartItem => cartItem.productId === newItem.productId);
              if (existingIndex > -1) {
                  updatedCart[existingIndex] = {
                      ...updatedCart[existingIndex],
                      quantity: updatedCart[existingIndex].quantity + newItem.quantity
                  };
              } else {
                  updatedCart.push(newItem);
              }
          });

          setCartItems(updatedCart);
          
          const updatedTemplates = savedTemplates.map(t => 
            t.id === templateId ? { ...t, lastUsedAt: new Date().toISOString() } : t
          );
          setSavedTemplates(updatedTemplates);

          showToast(`Items from template "${templateToUse.name}" added to cart.`);
          setProductPendingOrderQuantityProductId(null); 
          setCustomerCurrentPage(Page.CART); 
      }
  };
  
  const handleDeleteTemplate = (templateId: string) => {
      const templateToDelete = savedTemplates.find(t => t.id === templateId);
      if (templateToDelete) {
        setSavedTemplates(savedTemplates.filter(t => t.id !== templateId));
        showToast(`Template "${templateToDelete.name}" deleted.`);
        if (viewingTemplateId === templateId) { 
            setCustomerCurrentPage(Page.TEMPLATES);
            setViewingTemplateId(null);
        }
        if (editingTemplateId === templateId) {
            setEditingTemplateId(null); 
            setNewTemplateName('');
            setCurrentDraftTemplateItems([]);
            setCurrentDraftTemplateDays([]);
            setCurrentDraftTemplateShop(undefined);
            setProductPendingOrderQuantityProductId(null);
        }
      }
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const originalTemplate = savedTemplates.find(t => t.id === templateId);
    if (!originalTemplate) {
      showToast("Original template not found.");
      return;
    }

    let suggestedName = `${originalTemplate.name} (Copy)`;
    let copyNum = 2;
    while (savedTemplates.some(t => t.name.toLowerCase() === suggestedName.toLowerCase())) {
      suggestedName = `${originalTemplate.name} (Copy ${copyNum})`;
      copyNum++;
    }
    setNewTemplateName(suggestedName);

    const draftItems: DraftTemplateItem[] = originalTemplate.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { product: product!, quantity: item.quantity }; 
    }).filter(item => item.product); 

    setCurrentDraftTemplateItems(draftItems);
    setCurrentDraftTemplateDays(originalTemplate.days ? [...originalTemplate.days] : []);
    setCurrentDraftTemplateShop(originalTemplate.shop);
    setStagedForTemplateItems([]); 
    setEditingTemplateId(null); 
    setProductPendingOrderQuantityProductId(null); 

    setCustomerCurrentPage(Page.CREATE_TEMPLATE);
    showToast(`Drafting copy of '${originalTemplate.name}'. Adjust and save.`);
  };

  const handleEditTemplate = (templateId: string) => {
    const templateToEdit = savedTemplates.find(t => t.id === templateId);
    if (!templateToEdit) {
        showToast("Template not found for editing.");
        return;
    }
    setEditingTemplateId(templateId);
    setNewTemplateName(templateToEdit.name);
    const draftItems: DraftTemplateItem[] = templateToEdit.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return { product: product!, quantity: item.quantity };
    }).filter(item => item.product);
    
    setCurrentDraftTemplateItems(draftItems);
    setCurrentDraftTemplateDays(templateToEdit.days ? [...templateToEdit.days] : []);
    setCurrentDraftTemplateShop(templateToEdit.shop);
    setStagedForTemplateItems([]); 
    setProductPendingOrderQuantityProductId(null); 

    setCustomerCurrentPage(Page.CREATE_TEMPLATE);
    showToast(`Editing template '${templateToEdit.name}'. Make changes and save.`);
  };


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterApply = () => {
    setSelectedCategories(tempSelectedCategories);
    setIsFilterModalOpen(false);
  };
  
  const handleFilterClear = () => {
    setTempSelectedCategories([]);
  };

  const handleSortSelect = (option: SortOption) => {
    setActiveSort(option);
    setIsSortModalOpen(false); 
  };
  
  const cartProducts: ProductInCart[] = useMemo(() => {
    return cartItems
      .map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) {
          console.warn(`Product with ID ${cartItem.productId} not found in MOCK_PRODUCTS. This item will be excluded from the cart display and calculations.`);
          return null; 
        }
        return { ...product, quantity: cartItem.quantity };
      })
      .filter(item => item !== null) as ProductInCart[];
  }, [cartItems, products]);

  const totalCartPrice = useMemo(() => {
    return cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartProducts]);

  const displayedProductsResult = useMemo(() => {
    let currentContextProductIds = new Set<string>();
    if (productPageMode === 'ORDER') {
        cartItems.forEach(item => currentContextProductIds.add(item.productId));
        if (productPendingOrderQuantityProductId) currentContextProductIds.add(productPendingOrderQuantityProductId);
    } else { 
        currentDraftTemplateItems.forEach(item => currentContextProductIds.add(item.product.id));
        if (productPendingTemplateQuantityProductId) currentContextProductIds.add(productPendingTemplateQuantityProductId);
    }
    
    let filteredProducts = products.filter(p => {
        const matchesSearch = searchQuery 
            ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        const matchesCategoryFilter = selectedCategories.length > 0 ? selectedCategories.includes(p.category) : true;
        return matchesSearch && matchesCategoryFilter;
    });

    const sortFunction = (a: Product, b: Product): number => {
        switch (activeSort) {
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'category_asc': return a.category.localeCompare(b.category);
            case 'category_desc': return b.category.localeCompare(a.category);
            default: return 0;
        }
    };
    
    filteredProducts.sort((a, b) => {
        const aIsContext = currentContextProductIds.has(a.id);
        const bIsContext = currentContextProductIds.has(b.id);
        if (aIsContext && !bIsContext) return -1;
        if (!aIsContext && bIsContext) return 1;
        return sortFunction(a,b); 
    });
    
    const groupByCategory = (items: Product[]) => {
        return items.reduce((acc, product) => {
            const category = product.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(product);
            return acc;
        }, {} as Record<string, Product[]>);
    };
    
    const allGrouped = groupByCategory(filteredProducts);
    const allDisplayableCategoriesSorted = Object.keys(allGrouped).sort((catA, catB) => {
        const catAHasContext = allGrouped[catA].some(p => currentContextProductIds.has(p.id));
        const catBHasContext = allGrouped[catB].some(p => currentContextProductIds.has(p.id));
        if (catAHasContext && !catBHasContext) return -1;
        if (!catAHasContext && catBHasContext) return 1;
        return catA.localeCompare(catB); 
    });

    return { allGrouped, allDisplayableCategoriesSorted, hasResults: filteredProducts.length > 0 };

  }, [products, searchQuery, selectedCategories, activeSort, cartItems, productPageMode, currentDraftTemplateItems, productPendingOrderQuantityProductId, productPendingTemplateQuantityProductId]);

  const allDisplayableCategories = useMemo(() => {
    return displayedProductsResult.allDisplayableCategoriesSorted;
  }, [displayedProductsResult.allDisplayableCategoriesSorted]);


   useEffect(() => {
    if (customerCurrentPage === Page.PRODUCTS) {
      if (allDisplayableCategories.length > 0) {
        if (!activeCategoryInView || !allDisplayableCategories.includes(activeCategoryInView)) {
          setActiveCategoryInView(allDisplayableCategories[0]);
        }
      } else {
        setActiveCategoryInView(null);
      }
    }
  }, [customerCurrentPage, allDisplayableCategories, activeCategoryInView]);


  useEffect(() => {
    if (customerCurrentPage !== Page.PRODUCTS) return; 

    const DELIVERY_BANNER_HEIGHT_REM = 2; // 2rem for the banner height
    const topMarginForObserver = (SEARCH_BAR_HEIGHT_REM + MODE_SELECTOR_HEIGHT_REM + CATEGORY_DROPDOWN_HEIGHT_REM + DELIVERY_BANNER_HEIGHT_REM) * 16; 

    const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetElement = entry.target as HTMLElement; 
                const topBoundary = topMarginForObserver; 
                
                const customerPanel = productPageContentRef.current?.closest('.customer-panel');
                if (!customerPanel) return;
                const panelScrollTop = customerPanel.scrollTop;
                const elementTopRelativeToPanel = targetElement.offsetTop - panelScrollTop;


                if (elementTopRelativeToPanel <= topBoundary + 20 && elementTopRelativeToPanel >= topBoundary - targetElement.offsetHeight + 20) {
                     const categoryName = targetElement.dataset.categoryname;
                    if (categoryName) {
                        setActiveCategoryInView(categoryName);
                    }
                }
            }
        });
    };
    
    const customerPanelElement = productPageContentRef.current?.closest('.customer-panel');
    const observer = new IntersectionObserver(observerCallback, {
        root: customerPanelElement, 
        rootMargin: `-${topMarginForObserver -1 }px 0px 0px 0px`, 
        threshold: 0.01, 
    });

    const currentRefs = categoryHeaderRefs.current;
    const observedElements: HTMLElement[] = [];
    Object.values(currentRefs).forEach(el => {
        if (el) {
          observer.observe(el);
          observedElements.push(el);
        }
    });

    return () => {
        observedElements.forEach(el => {
            if (el) observer.unobserve(el);
        });
        observer.disconnect();
    };
  }, [customerCurrentPage, displayedProductsResult.allDisplayableCategoriesSorted]);


  const handleCategorySelectAndScroll = (categoryName: string) => {
    const headerId = `category-header-${categoryName.replace(/\s+/g, '-')}`;
    const element = document.getElementById(headerId);
    const customerPanel = productPageContentRef.current?.closest('.customer-panel');

    if (element && customerPanel) {
        const offset = (SEARCH_BAR_HEIGHT_REM + MODE_SELECTOR_HEIGHT_REM + CATEGORY_DROPDOWN_HEIGHT_REM) * 16; 
        const elementPositionInPanel = element.offsetTop; 
        const offsetPosition = elementPositionInPanel - offset - 5; 

        customerPanel.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        setActiveCategoryInView(categoryName); 
    }
    setIsCategoryDropdownOpen(false);
  };

  const handleDiscardDraft = () => {
    setIsDiscardConfirmModalOpen(true);
  };

  const handleConfirmDiscardDraft = () => {
    setNewTemplateName('');
    setCurrentDraftTemplateItems([]);
    setCurrentDraftTemplateDays([]);
    setCurrentDraftTemplateShop(undefined);
    setStagedForTemplateItems([]); 
    setEditingTemplateId(null);
    setProductPendingTemplateQuantityProductId(null);
    setCustomerCurrentPage(Page.TEMPLATES);
    setIsDiscardConfirmModalOpen(false);
    showToast("Draft discarded.");
  };

  const handleSaveCustomShippingAddress = () => {
    const { line1, unitNo, postalCode } = customShippingAddressInput;
    if (!line1.trim() || !postalCode.trim()) {
      showToast("Address Line 1 and Postal Code are required.");
      return;
    }
    if (!/^\d{6}$/.test(postalCode.trim())) {
        showToast("Please enter a valid 6-digit Singapore postal code.");
        return;
    }

    const newAddress = `${line1.trim()}${unitNo.trim() ? `, #${unitNo.trim()}` : ''}, Singapore ${postalCode.trim()}`;
    
    const currentAddressesWithoutAdd = availableShippingAddresses.filter(addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE);
    if (currentAddressesWithoutAdd.includes(newAddress)) {
        showToast("This address already exists.");
    } else {
        currentAddressesWithoutAdd.push(newAddress);
    }
    const updatedAddresses = [...currentAddressesWithoutAdd, ADD_NEW_ADDRESS_DISPLAY_TEXT];
    
    setAvailableShippingAddresses(updatedAddresses);

    if (shippingAddressModalContext === 'shipping') {
      setSelectedShippingAddressOption(newAddress);
    } else { 
      setSelectedBillingAddressOption(newAddress);
    }
    
    setCustomShippingAddressInput({ line1: '', unitNo: '', postalCode: '' });
    setIsAddShippingAddressModalOpen(false);
    showToast("New shipping address added and selected.");
  };

  const handleSaveCustomContactInfo = () => {
    const { name, number, countryCode } = customContactInfoInput;
    if (!name.trim()) {
        showToast("Contact name is required.");
        return;
    }
    if (!number.trim()) {
        showToast("Contact number is required.");
        return;
    }
    if (!/^\d{7,15}$/.test(number.trim().replace(/\s+/g, ''))) { 
        showToast("Please enter a valid contact number.");
        return;
    }

    const newContactInfo = `${name.trim()} - ${countryCode} ${number.trim()}`;
    
    const currentContactsWithoutAdd = availableContactInfos.filter(
        contact => contact !== ADD_NEW_CONTACT_DISPLAY_TEXT && contact !== ADD_NEW_CONTACT_OPTION_VALUE
    );
     if (currentContactsWithoutAdd.includes(newContactInfo)) {
        showToast("This contact information already exists.");
    } else {
        currentContactsWithoutAdd.push(newContactInfo);
    }
    const updatedContacts = [...currentContactsWithoutAdd, ADD_NEW_CONTACT_DISPLAY_TEXT];
    
    setAvailableContactInfos(updatedContacts);
    setSelectedContactInfoOption(newContactInfo);
    setCustomContactInfoInput({ name: '', number: '', countryCode: DEFAULT_CONTACT_COUNTRY_CODE });
    setIsAddContactInfoModalOpen(false);
    showToast("New contact information added and selected.");
  };

  const handleAttachPhotoClick = () => photoInputRef.current?.click();
  const handleAttachDocumentClick = () => documentInputRef.current?.click();

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          setAttachedPhoto(event.target.files[0]);
          showToast(`Photo '${event.target.files[0].name}' selected.`);
      }
  };

  const handleDocumentSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          setAttachedDocument(event.target.files[0]);
          showToast(`Document '${event.target.files[0].name}' selected.`);
      }
  };

  const handleRemovePhoto = () => {
      setAttachedPhoto(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      showToast("Photo attachment removed.");
  };

  const handleRemoveDocument = () => {
      setAttachedDocument(null);
      if (documentInputRef.current) documentInputRef.current.value = "";
      showToast("Document attachment removed.");
  };

  const handleProfileToggle = (key: keyof typeof profileToggles) => {
    setProfileToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenCreateTicketModal = (order: Order) => {
    setOrderForTicketCreation(order);
    setIsCreateTicketModalOpen(true);
  };

  const handleCloseCreateTicketModal = () => {
    setOrderForTicketCreation(null);
    setIsCreateTicketModalOpen(false);
  };

  const handleSaveSupportTicket = (orderId: string, issues: TicketIssue[]) => {
    if (!orderId || issues.length === 0) {
        showToast("Cannot save ticket with empty issues or missing order ID.");
        return;
    }
    const newTicket: SupportTicket = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        orderId: orderId,
        issues: issues,
        createdAt: new Date().toISOString(),
        status: 'Open',
    };
    setAllSupportTickets(prevTickets => [...prevTickets, newTicket]);
    handleCloseCreateTicketModal();
    showToast(`Support ticket for Order #${orderId} created successfully!`);
  };

  const handleOpenViewTicketModal = (ticket: SupportTicket) => {
    setTicketToView(ticket);
    const orderForTicket = orders.find(o => o.id === ticket.orderId);
    if (orderForTicket) {
      setOrderForTicketCreation(orderForTicket);
      setIsViewTicketModalOpen(true);
    } else {
      showToast("Could not find the order associated with this ticket.");
    }
  };

  const handleCloseViewTicketModal = () => {
    setTicketToView(null);
    setOrderForTicketCreation(null);
    setIsViewTicketModalOpen(false);
  };

  const handleCustomerNavigate = (page: Page) => {
    setOrderToViewAdminPdf(null); 
    setOrdersToPrintAdminPdf([]); 
    setCustomerCurrentPage(page);
    if (page !== Page.PRODUCTS) {
        setIsCategoryDropdownOpen(false); 
        setProductPendingOrderQuantityProductId(null); 
        setProductPendingTemplateQuantityProductId(null);
    }
    if (page !== Page.VIEW_TEMPLATE_DETAILS) {
        setViewingTemplateId(null);
    }
    if (page !== Page.CREATE_TEMPLATE) {
        setTemplateToConfigureForCart(null);
    }
  };
  
  const handleAdminNavigate = (page: Page) => {
    setOrderToViewAdminPdf(null);
    setOrdersToPrintAdminPdf([]);
    setAdminCurrentPage(page);
    setEditingCellInfo(null);
  };

  const handleAdminSelectOrder = (orderId: string, checked: boolean) => {
    setAdminSelectedOrderIds(prev => 
      checked ? [...new Set([...prev, orderId])] : prev.filter(id => id !== orderId)
    );
  };
  
  const handleAdminSelectAllOrdersInGroup = (checked: boolean, ordersInGroup: Order[]) => {
      const groupOrderIds = ordersInGroup.map(o => o.id);
      if (checked) {
          setAdminSelectedOrderIds(prev => [...new Set([...prev, ...groupOrderIds])]);
      } else {
          setAdminSelectedOrderIds(prev => prev.filter(id => !groupOrderIds.includes(id)));
      }
  };

  // Simple click handler for single selection
  const handleOrderClick = (orderId: string) => {
    setAdminSelectedOrderIds([orderId]);
    setFocusedOrderId(orderId);
    setSelectionAnchorId(orderId);
  };

  // Column selection handler
  const handleColumnSelection = (regionOrders: Order[], checked: boolean) => {
    const regionOrderIds = regionOrders.map(o => o.id);
    if (checked) {
      setAdminSelectedOrderIds(prev => [...new Set([...prev, ...regionOrderIds])]);
    } else {
      setAdminSelectedOrderIds(prev => prev.filter(id => !regionOrderIds.includes(id)));
    }
  };

  // Driver assignment handlers
  const handleOpenDriverAssignmentModal = () => {
    if (adminSelectedOrderIds.length === 0) {
      showToast("No orders selected for driver assignment.");
      return;
    }
    setSelectedDriverForAssignment(null);
    setIsDriverAssignmentModalOpen(true);
  };

  const handleCloseDriverAssignmentModal = () => {
    setIsDriverAssignmentModalOpen(false);
    setSelectedDriverForAssignment(null);
  };

  const handleSaveDriverAssignment = () => {
    if (!selectedDriverForAssignment) {
      showToast("Please select a driver.");
      return;
    }

    const ordersToUpdate = orders.filter(order => adminSelectedOrderIds.includes(order.id));
    
    setOrders(prevOrders =>
      prevOrders.map(order => 
        adminSelectedOrderIds.includes(order.id)
          ? { ...order, deliveredBy: selectedDriverForAssignment }
          : order
      )
    );

    showToast(`${ordersToUpdate.length} order(s) assigned to driver ${selectedDriverForAssignment}.`);
    handleCloseDriverAssignmentModal();
  };

  // Excel-like keyboard navigation with Shift+Arrow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentAdminOrderManagementSubTab !== 'Billed to Schedule' || !focusedOrderId) return;
      
      // Get all billed orders organized by sections and regions
      const billedOrders = orders.filter(order => order.status === 'Billed in Insmart');
      
      // Create a flattened list for simple navigation
      const allOrdersFlattened: Order[] = [];
      billedOrders.forEach(order => {
        allOrdersFlattened.push(order);
      });
      
             // Find current position in flattened list
       const currentIndex = allOrdersFlattened.findIndex(order => order.id === focusedOrderId);
       if (currentIndex === -1) return;
       
       let newIndex = currentIndex;
       
       // Handle navigation
       if (e.key === 'ArrowUp') {
         e.preventDefault();
         newIndex = Math.max(0, currentIndex - 1);
       } else if (e.key === 'ArrowDown') {
         e.preventDefault();
         newIndex = Math.min(allOrdersFlattened.length - 1, currentIndex + 1);
       } else if (e.key === 'ArrowLeft') {
         e.preventDefault();
         newIndex = Math.max(0, currentIndex - 1);
       } else if (e.key === 'ArrowRight') {
         e.preventDefault();
         newIndex = Math.min(allOrdersFlattened.length - 1, currentIndex + 1);
       }
       
       // If position changed, update selection
       if (newIndex !== currentIndex) {
         const newOrderId = allOrdersFlattened[newIndex].id;
         
         if (e.shiftKey && selectionAnchorId) {
           // Range selection from anchor to new position
           const anchorIndex = allOrdersFlattened.findIndex(order => order.id === selectionAnchorId);
           if (anchorIndex !== -1) {
             const minIndex = Math.min(anchorIndex, newIndex);
             const maxIndex = Math.max(anchorIndex, newIndex);
             const selectedIds = allOrdersFlattened.slice(minIndex, maxIndex + 1).map(order => order.id);
             setAdminSelectedOrderIds(selectedIds);
           }
         } else {
           // Single selection
           setAdminSelectedOrderIds([newOrderId]);
           setSelectionAnchorId(newOrderId);
         }
         
         setFocusedOrderId(newOrderId);
       }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentAdminOrderManagementSubTab, orders, focusedOrderId, selectionAnchorId]);

  const isWithinBillingWindow = (invoiceDateString?: string): boolean => {
    if (!invoiceDateString) return true; 
    const invoiceDate = new Date(invoiceDateString);
    invoiceDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysBeforeInvoice = new Date(invoiceDate);
    twoDaysBeforeInvoice.setDate(invoiceDate.getDate() - 2);
    
    return today >= twoDaysBeforeInvoice && today <= invoiceDate;
  };

  // Helper function to check if order exceeds credit limit
  const doesOrderExceedCreditLimit = (order: Order): boolean => {
    const shop = organizations.flatMap(org => org.shops).find(s => s.name === order.shopLocation);
    if (!shop || !shop.paymentTerms) return false;
    
    const isAmountLimitShop = shop.paymentTerms.includes('Amount Limit');
    if (!isAmountLimitShop) return false;
    
    let limitAmount = 0;
    if (shop.amountLimit) {
        limitAmount = parseFloat(shop.amountLimit.toString());
    } else if (shop.paymentTerms.startsWith('Amount Limit: $')) {
        limitAmount = parseFloat(shop.paymentTerms.replace('Amount Limit: $', ''));
    }
    
    return limitAmount > 0 && order.totalPrice >= limitAmount;
  };

const getShipmentSchedule = (order: Order): number => {
    if (order.shopLocation === ShopLocations[0]) return 1; // Al-Sheika Tuas
    if (order.shopLocation === ShopLocations[1]) return 3; // Al-Sheika Boon Lay
    return 99; // Default for others or undefined, sorts last
};

const _performAssignment = (targetOrderIds: string[], biller?: AdminStaffName) => {
    let assignedCount = 0;
    const failedBillingWindowOrderIds: string[] = [];

    setOrders(prevOrders =>
        prevOrders.map(order => {
            if (targetOrderIds.includes(order.id)) {
                if (biller && !isWithinBillingWindow(order.invoiceDate || order.orderDate)) {
                    failedBillingWindowOrderIds.push(order.id);
                    return order;
                }

                let newStatus = order.status;
                if (biller && order.status === 'To pick person for billing in Insmart') {
                    newStatus = 'Order delegated for billing';
                } else if (!biller && (order.status === 'Order delegated for billing' || order.status === 'Billing in progress')) {
                    // This case is for unassigning, though current priority check is for assigning
                    newStatus = 'To pick person for billing in Insmart';
                }
                
                assignedCount++;
                return { ...order, billedInInsmartBy: biller, status: newStatus };
            }
            return order;
        })
    );

    if (assignedCount > 0) {
        showToast(`${assignedCount} order(s) ${biller ? `assigned to ${biller}` : 'updated'}.`);
    }
    if (failedBillingWindowOrderIds.length > 0) {
        showToast(`Order(s) #${failedBillingWindowOrderIds.join(', #')} could not be assigned: invoice date is not within the 2-day billing window.`);
    }
    if (assignedCount === 0 && failedBillingWindowOrderIds.length === 0 && targetOrderIds.length > 0) {
        showToast("No orders were eligible for assignment (e.g., already assigned, in progress, or billed).");
    }
    // Do not clear adminSelectedOrderIds here, let the calling function manage it
};


const checkAndHandleAssignmentPriority = (
    targetOrderIds: string[], // Order(s) user wants to assign
    billerToAssign?: AdminStaffName, // Biller to assign (undefined for 'Quick Assign to Me')
    assignmentType: 'quickAssign' | 'inlineEdit' | 'bulkUpdate' = 'quickAssign' // To reconstruct original action
) => {
    if (targetOrderIds.length === 0 || !billerToAssign) { // Only check when assigning a biller
        _performAssignment(targetOrderIds, billerToAssign);
        return;
    }

    // This check is only for orders in the "Ungrouped" section of "To Bill in Insmart"
    const ungroupedTargetOrders = orders.filter(o => 
        targetOrderIds.includes(o.id) &&
        !o.billedInInsmartBy && // Is currently in ungrouped
        currentAdminOrderManagementSubTab === 'To Bill in Insmart'
    );

    if (ungroupedTargetOrders.length === 0) { // No ungrouped orders are being targeted, or not in the right tab
        _performAssignment(targetOrderIds, billerToAssign);
        return;
    }
    
    // Sort all orders once for consistent priority checks
    const allSortedOrdersInTab = [...orders]
        .filter(order => !!order.shippingDate && (
            order.status === 'To pick person for billing in Insmart' || 
            order.status === 'Order delegated for billing' || 
            order.status === 'Billing in progress' || 
            order.status === 'Billed in Insmart'
        ))
        .sort(billTabSortFn);

    const allUngroupedUnassignedOrders = allSortedOrdersInTab.filter(o => !o.billedInInsmartBy);

    const otherUngroupedUnassignedOrders = allUngroupedUnassignedOrders.filter(o => !targetOrderIds.includes(o.id));

    if (otherUngroupedUnassignedOrders.length === 0) {
        _performAssignment(targetOrderIds, billerToAssign);
        return;
    }
    
    // The highest priority (lowest schedule #, then by sort order) unassigned order NOT being currently targeted
    const highestPriorityOtherUnassignedOrder = otherUngroupedUnassignedOrders[0]; 
    const scheduleOfHighestPriorityOther = getShipmentSchedule(highestPriorityOtherUnassignedOrder);

    // Smallest schedule number among the orders user wants to assign
    const minScheduleOfTargeted = Math.min(...ungroupedTargetOrders.map(o => getShipmentSchedule(o)));
    
    if (highestPriorityOtherUnassignedOrder && scheduleOfHighestPriorityOther < minScheduleOfTargeted) {
        setAssignmentPriorityModalInfo({
            orderForPrompt: highestPriorityOtherUnassignedOrder,
            originalAssignmentArgs: {
                targetOrderIds: targetOrderIds, // The IDs user originally intended to assign
                biller: billerToAssign,
                isQuickAssign: assignmentType === 'quickAssign',
            }
        });
        setIsAssignmentPriorityModalOpen(true);
    } else {
        _performAssignment(targetOrderIds, billerToAssign);
    }
};


  const handleOpenUpdateOrdersModal = () => {
    if (adminSelectedOrderIds.length > 0) {
      setUpdateFieldsState({
        status: ADMIN_ORDER_STATUS_OPTIONS[0], 
        billedBy: AdminStaffNames[0],
        shippingDate: null,
        packedBy: AdminStaffNamesPackedBy[0],
        deliveredBy: AdminStaffNamesDeliveredBy[0],
        customerType: DEFAULT_CUSTOMER_TYPE,
      });
      setApplyUpdateFlags({ 
        status: false,
        billedBy: false,
        shippingDate: false,
        packedBy: false,
        deliveredBy: false,
        customerType: false,
      });
      setIsUpdateOrdersModalOpen(true);
    } else {
      showToast("No orders selected to update.");
    }
  };

  const handleSaveUpdatedOrders = () => {
    if (adminSelectedOrderIds.length === 0) {
      showToast("No orders selected.");
      setIsUpdateOrdersModalOpen(false);
      return;
    }

    let updatesMadeCount = 0;
    Object.values(applyUpdateFlags).forEach(flag => {
        if (flag) updatesMadeCount++;
    });

    if (updatesMadeCount === 0) {
        showToast("No update fields selected. Please check a box to apply changes.");
        return;
    }
    
    const ordersToUpdateActually = orders.filter(o => adminSelectedOrderIds.includes(o.id));
    
    if (applyUpdateFlags.billedBy) {
        // If "Billed By" is being updated, run through priority check
        const ungroupedSelectedForBillerUpdate = ordersToUpdateActually.filter(o =>
            !o.billedInInsmartBy && currentAdminOrderManagementSubTab === 'To Bill in Insmart'
        );

        if (ungroupedSelectedForBillerUpdate.length > 0) {
            // Priority check logic
            const allSortedOrdersInTab = [...orders]
                .filter(order => !!order.shippingDate && (
                    order.status === 'To pick person for billing in Insmart' || 
                    order.status === 'Order delegated for billing' || 
                    order.status === 'Billing in progress' || 
                    order.status === 'Billed in Insmart'
                ))
                .sort(billTabSortFn);
            const allUngroupedUnassignedOrders = allSortedOrdersInTab.filter(o => !o.billedInInsmartBy);
            const otherUngroupedUnassigned = allUngroupedUnassignedOrders.filter(o => !adminSelectedOrderIds.includes(o.id));

            if (otherUngroupedUnassigned.length > 0) {
                const highestPriorityOther = otherUngroupedUnassigned[0];
                const scheduleOfHighestPriorityOther = getShipmentSchedule(highestPriorityOther);
                const minScheduleOfTargeted = Math.min(...ungroupedSelectedForBillerUpdate.map(o => getShipmentSchedule(o)));

                if (scheduleOfHighestPriorityOther < minScheduleOfTargeted) {
                    setAssignmentPriorityModalInfo({
                        orderForPrompt: highestPriorityOther,
                        originalAssignmentArgs: {
                            targetOrderIds: adminSelectedOrderIds, // All selected orders for bulk update
                            biller: updateFieldsState.billedBy,
                            isQuickAssign: false,
                            isBulkUpdate: true,
                            bulkUpdateFields: {...updateFieldsState},
                            bulkUpdateFlags: {...applyUpdateFlags}
                        }
                    });
                    setIsAssignmentPriorityModalOpen(true);
                    setIsUpdateOrdersModalOpen(false); // Close bulk update modal, priority modal takes over
                    return; // Stop here, let priority modal handle next step
                }
            }
        }
    }
    
    // Validate shipping date if being updated (only if not clearing the date)
    if (applyUpdateFlags.shippingDate && updateFieldsState.shippingDate) {
      if (!validateShippingDate(updateFieldsState.shippingDate, adminSelectedOrderIds, 'bulk', { 
        fields: updateFieldsState, 
        flags: applyUpdateFlags 
      })) {
        return; // Validation failed, modal shown, wait for user decision
      }
    }
    
    // If not applying billedBy, or if priority check passes (or not applicable), proceed with bulk update
    performBulkUpdate(adminSelectedOrderIds, updateFieldsState, applyUpdateFlags);
  };

  const performBulkUpdate = (targetOrderIds: string[], fields: typeof updateFieldsState, flags: typeof applyUpdateFlags) => {
    const failedAssignmentOrderIds: string[] = [];
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (targetOrderIds.includes(order.id)) {
          const updatedOrder = { ...order };
          let canUpdateBiller = true;

          if (flags.billedBy) {
            if (!isWithinBillingWindow(order.invoiceDate || order.orderDate)) {
                canUpdateBiller = false;
                failedAssignmentOrderIds.push(order.id);
            }
          }

          if (flags.status) updatedOrder.status = fields.status;
          
          if (flags.billedBy && canUpdateBiller) {
            updatedOrder.billedInInsmartBy = fields.billedBy;
            if (updatedOrder.status === 'To pick person for billing in Insmart') {
                 updatedOrder.status = 'Order delegated for billing';
            }
          }
          if (flags.shippingDate) {
            if (fields.shippingDate) {
            updatedOrder.shippingDate = fields.shippingDate.toISOString();
            if (updatedOrder.status === 'To select date') {
                updatedOrder.status = 'To pick person for billing in Insmart';
              }
            } else {
              // Clearing shipping date
              updatedOrder.shippingDate = undefined;
              // If clearing shipping date and order was 'To pick person for billing in Insmart', revert to 'To select date'
              if (updatedOrder.status === 'To pick person for billing in Insmart' && !updatedOrder.billedInInsmartBy) {
                  updatedOrder.status = 'To select date';
              }
            }
          }
          if (flags.packedBy) updatedOrder.packedBy = fields.packedBy;
          if (flags.deliveredBy) updatedOrder.deliveredBy = fields.deliveredBy;
          if (flags.customerType) updatedOrder.customerType = fields.customerType;
          return updatedOrder;
        }
        return order;
      })
    );

    let successMessage = "Selected order(s) updated.";
    if (failedAssignmentOrderIds.length > 0) {
        successMessage += ` However, Order(s) #${failedAssignmentOrderIds.join(', #')} could not be assigned a biller due to invoice date restrictions.`;
    }
    showToast(successMessage);
    setAdminSelectedOrderIds(prev => prev.filter(id => !failedAssignmentOrderIds.includes(id)));
    setIsUpdateOrdersModalOpen(false);
  };


  const formatDateForDisplay = (isoString?: string | Date): string => {
    if (!isoString) return 'N/A';
    let date: Date;
    if (typeof isoString === 'string') {
        date = new Date(isoString);
    } else {
        date = isoString;
    }

    if (isNaN(date.getTime())) return 'Invalid Date';
  
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strHours = String(hours).padStart(2, '0');
  
    return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
  };

  const formatSimpleDate = (isoString?: string | Date): string => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${String(date.getDate()).padStart(2, '0')} ${monthNamesShort[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  const formatDateTimeForPdf = (isoString?: string | Date): string => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    return `${String(date.getDate()).padStart(2, '0')} ${monthNamesShort[date.getMonth()]} ${date.getFullYear()}, ${timeString}`;
  };
  
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Generate PDF Changes Format
  const generatePdfChangesFormat = (order: Order): { changeCount: number; changesText: string; removedItems: string[] } => {
    let changeCount = 0;
    let regularChanges: string[] = [];
    let removedChanges: string[] = [];

    // Check if it's legacy modification or new modification request system
            if (order.isModified && hasNoModificationRequests(order)) {
      // Legacy modification - use existing modificationSummary but adapt format
      if (order.modificationSummary) {
        // For legacy, we'll use the existing summary as a fallback since we don't have detailed item tracking
        // Try to extract some basic info but keep it simple
        const removedMatch = order.modificationSummary.match(/(\d+) item\(s\) removed/);
        const addedMatch = order.modificationSummary.match(/(\d+) item\(s\) added/);
        const quantityMatch = order.modificationSummary.match(/(\d+) quantity adjustment\(s\)/);
        
        if (addedMatch) {
          changeCount += parseInt(addedMatch[1]);
          regularChanges.push(`${addedMatch[1]} item(s) added`);
        }
        if (quantityMatch) {
          changeCount += parseInt(quantityMatch[1]);
          regularChanges.push(`${quantityMatch[1]} quantity change(s)`);
        }
        if (removedMatch) {
          changeCount += parseInt(removedMatch[1]);
          removedChanges.push(`${removedMatch[1]} item(s) removed`);
        }
        
        // If no matches found, just use the original summary
        if (changeCount === 0) {
          regularChanges.push(order.modificationSummary);
          changeCount = 1; // Default to 1 if we can't parse
        }
      }
    } else {
      // New modification request system - use current order items to get proper item numbers
      const processedRequests = order.processedModificationRequests || [];
      const acceptedRequests = processedRequests.filter(req => req.status === 'accepted');
      
      acceptedRequests.forEach(request => {
        const currentItems = order.items;
        const requestedItems = request.requestedItems.filter(item => item.itemStatus === 'accepted');
        
        // We need to reconstruct what the order looked like before this modification
        // to properly identify additions vs quantity changes
        
        // For each accepted requested item, check if it was already in the order before modification
        requestedItems.forEach(requestedItem => {
          const itemIndex = currentItems.findIndex(item => item.id === requestedItem.id);
          if (itemIndex !== -1) {
            const itemNumber = itemIndex + 1; // PDF uses 1-based numbering
            
            // Check if this was likely a new addition or quantity change
            // We can try to parse the request summary to understand better
            const requestSummary = request.requestSummary;
            
            if (requestSummary.includes('Items changed from') && requestSummary.includes('quantity adjustment')) {
              regularChanges.push(`#${itemNumber} quantity change`);
            } else if (requestSummary.includes('item(s) added')) {
              regularChanges.push(`#${itemNumber} added to order`);
            } else {
              // Default case - assume quantity change if item exists
              regularChanges.push(`#${itemNumber} quantity change`);
            }
            changeCount++;
          }
        });
        
        // Handle removed items - use stored product names
        const processedRemovedItems = request.processedRemovedItems || [];
        processedRemovedItems.forEach(removedItem => {
          if (removedItem.status === 'accepted') {
            // Use stored product name or fallback to product lookup
            const itemName = removedItem.productName || 
                           products.find(p => p.id === removedItem.productId)?.name || 
                           `Product ${removedItem.productId}`;
            removedChanges.push(`${itemName} removed`);
            changeCount++;
          }
        });
      });
      
      // If no specific changes were identified but we have accepted requests, show general info
      if (changeCount === 0 && acceptedRequests.length > 0) {
        regularChanges.push(`Order modified via ${acceptedRequests.length} request(s)`);
        changeCount = acceptedRequests.length;
      }
    }

    // Combine regular changes and removed changes (removed items at the end)
    const allChanges = [...regularChanges, ...removedChanges];
    const changesText = allChanges.join(', ');
    return { changeCount, changesText, removedItems: removedChanges };
  };

  // Shipping Date Validation Function
  const validateShippingDate = (selectedDate: Date, orderIds: string[], context: 'inline' | 'bulk' | 'quick', originalData?: any): boolean => {
    const ordersToCheck = orders.filter(order => orderIds.includes(order.id));
    
    for (const order of ordersToCheck) {
      const invoiceRequestDate = order.invoiceDate || order.orderDate;
      const invoiceDate = new Date(invoiceRequestDate);
      
      // Remove time components for date-only comparison
      const shippingDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const invoiceDateOnly = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
      
      if (shippingDateOnly < invoiceDateOnly) {
        // Shipping date is before invoice request date - show confirmation modal
        const shopName = order.shopLocation || 'the customer';
        
        setShippingDateConfirmData({
          selectedDate,
          orderIds,
          shopName,
          context,
          originalData
        });
        setIsShippingDateConfirmModalOpen(true);
        return false; // Don't proceed with update yet
      }
    }
    
    return true; // All dates are valid, proceed with update
  };

  // Check for Pending Modification Requests Function
  const hasPendingModificationRequests = (order: Order): boolean => {
    // Only check for requests that actually have a 'pending' status
    const pendingRequests = order.modificationRequests?.filter(req => req.status === 'pending') || [];
    
    // For each pending request, explicitly check all 4 types of modifications
    for (const request of pendingRequests) {
      const originalItems = order.items;
      const requestedItems = request.requestedItems;
      const processedRemovedItems = request.processedRemovedItems || [];
      
      // Create maps for easier lookup
      const originalItemsMap = new Map(originalItems.map(item => [item.id, item]));
      const requestedItemsMap = new Map(requestedItems.map(item => [item.id, item]));
      
      // 1. Check for pending ADDED ITEMS (new items that didn't exist in original order)
      const hasPendingAddedItems = requestedItems.some(requestedItem => {
        const isNewItem = !originalItemsMap.has(requestedItem.id);
        const isPending = requestedItem.itemStatus === 'pending';
        return isNewItem && isPending;
      });
      
      // 2. Check for pending REMOVED ITEMS (original items not in requested items)
      const removedItemIds = originalItems
        .filter(originalItem => !requestedItemsMap.has(originalItem.id))
        .map(item => item.id);
      
      const hasPendingRemovedItems = removedItemIds.some(removedId => 
        !processedRemovedItems.find(processed => processed.productId === removedId)
      );
      
      // 3. Check for pending INCREASED QUANTITY items (existing items with higher quantity)
      const hasPendingIncreasedQuantity = requestedItems.some(requestedItem => {
        const originalItem = originalItemsMap.get(requestedItem.id);
        const isExistingItem = !!originalItem;
        const hasIncreasedQuantity = originalItem && requestedItem.quantity > originalItem.quantity;
        const isPending = requestedItem.itemStatus === 'pending';
        return isExistingItem && hasIncreasedQuantity && isPending;
      });
      
      // 4. Check for pending DECREASED QUANTITY items (existing items with lower quantity)
      const hasPendingDecreasedQuantity = requestedItems.some(requestedItem => {
        const originalItem = originalItemsMap.get(requestedItem.id);
        const isExistingItem = !!originalItem;
        const hasDecreasedQuantity = originalItem && requestedItem.quantity < originalItem.quantity;
        const isPending = requestedItem.itemStatus === 'pending';
        return isExistingItem && hasDecreasedQuantity && isPending;
      });
      
      // If this request has ANY of the 4 types of pending modifications, return true
      if (hasPendingAddedItems || hasPendingRemovedItems || hasPendingIncreasedQuantity || hasPendingDecreasedQuantity) {
        return true;
      }
    }
    
    return false;
  };

  // Calculate total number of changes in pending modification requests
  const calculatePendingChangesCount = (order: Order): number => {
    const pendingRequests = order.modificationRequests?.filter(req => req.status === 'pending') || [];
    let totalChanges = 0;

    pendingRequests.forEach(request => {
      const originalItems = order.items;
      const requestedItems = request.requestedItems;
      
      // Create maps for easier lookup
      const originalItemsMap = new Map(originalItems.map(item => [item.id, item]));
      const requestedItemsMap = new Map(requestedItems.map(item => [item.id, item]));
      
      // Count added items (in requested but not in original)
      requestedItems.forEach(requestedItem => {
        if (!originalItemsMap.has(requestedItem.id)) {
          totalChanges++; // New item added
        }
      });
      
      // Count removed items (in original but not in requested)
      originalItems.forEach(originalItem => {
        if (!requestedItemsMap.has(originalItem.id)) {
          totalChanges++; // Item removed
        }
      });
      
      // Count quantity changes (items that exist in both but with different quantities)
      requestedItems.forEach(requestedItem => {
        const originalItem = originalItemsMap.get(requestedItem.id);
        if (originalItem && originalItem.quantity !== requestedItem.quantity) {
          totalChanges++; // Quantity changed
        }
      });
    });

    return totalChanges;
  };

  // Helper functions for PDF enhancement features
  const getItemModificationInfo = (order: Order, itemId: string): { 
    isAddition: boolean; 
    originalQuantity: number | null; 
    hasQuantityChange: boolean;
  } => {
    let isAddition = false;
    let originalQuantity: number | null = null;
    let hasQuantityChange = false;
    
    // Check processed modification requests for this item
    const processedRequests = order.processedModificationRequests || [];
    const acceptedRequests = processedRequests.filter(req => req.status === 'accepted');
    
    if (acceptedRequests.length === 0) {
      return { isAddition, originalQuantity, hasQuantityChange };
    }

    // Get the current item 
    const currentItem = order.items.find(item => item.id === itemId);
    if (!currentItem) {
      return { isAddition, originalQuantity, hasQuantityChange };
    }

    // Use the stored change information from modification requests
    for (const request of acceptedRequests) {
      const requestedItems = request.requestedItems.filter(item => item.itemStatus === 'accepted');
      const requestedItem = requestedItems.find(item => item.id === itemId);
      
      if (requestedItem && requestedItem.changeType) {
        // Use the stored change information
        switch (requestedItem.changeType) {
          case 'added':
            isAddition = true;
            originalQuantity = 0;
            hasQuantityChange = false;
            break;
          case 'quantityChanged':
            isAddition = false;
            hasQuantityChange = true;
            originalQuantity = requestedItem.originalQuantity || null;
            break;
          case 'removed':
            // This shouldn't happen since the item is in the current order
            // but handle it just in case
            isAddition = false;
            hasQuantityChange = false;
            originalQuantity = requestedItem.originalQuantity || null;
            break;
        }
        break;
      }
    }
    
    return { isAddition, originalQuantity, hasQuantityChange };
  };



  // PDF View Validation Handler
  const handleViewOrderPdf = (order: Order) => {
    if (hasPendingModificationRequests(order)) {
      setPendingModificationOrder(order);
      setIsPendingModificationModalOpen(true);
    } else {
      setOrderToViewAdminPdf(order);
      setAdminCurrentPage(Page.ADMIN_VIEW_ORDER_PDF);
    }
  };

  const handleInitiateConfigureTemplateForCart = (template: Template) => {
    const itemsToConfigure = template.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return { productId: item.productId, quantityString: '', product: product! };
    }).filter(item => item.product); 
    setConfiguredTemplateItems(itemsToConfigure);
    setTemplateToConfigureForCart(template);
    configurableQuantityInputRefs.current = [];
    setTimeout(() => {
        if(configurableQuantityInputRefs.current[0]) {
            configurableQuantityInputRefs.current[0]?.focus()
        }
    }, 0); 
  };

  const handleUpdateConfiguredTemplateItemQuantityString = (productId: string, quantityString: string) => {
    setConfiguredTemplateItems(prev => 
        prev.map(item => item.productId === productId ? { ...item, quantityString } : item)
    );
  };
  
  const handleAdjustConfiguredTemplateItemQuantity = (productId: string, delta: number) => {
    setConfiguredTemplateItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId) {
          const currentQuantity = parseInt(item.quantityString, 10);
          const newQuantity = (isNaN(currentQuantity) ? 0 : currentQuantity) + delta;
          return {
            ...item,
            quantityString: newQuantity > 0 ? String(newQuantity) : '',
          };
        }
        return item;
      })
    );
  };

  const handleConfiguredItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const nextInput = configurableQuantityInputRefs.current[currentIndex + 1];
        if (nextInput) {
            nextInput.focus();
        }
    }
  };


  const handleConfirmAddConfiguredTemplateToCart = () => {
    if (!templateToConfigureForCart) return;

    let updatedCart = [...cartItems];
    let itemsAddedCount = 0;

    configuredTemplateItems.forEach(configuredItem => {
        const quantity = parseInt(configuredItem.quantityString, 10);
        const finalQuantity = isNaN(quantity) || quantity <= 0 ? 1 : quantity;

        const existingIndex = updatedCart.findIndex(cartItem => cartItem.productId === configuredItem.productId);
        if (existingIndex > -1) {
            updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                quantity: updatedCart[existingIndex].quantity + finalQuantity
            };
        } else {
            updatedCart.push({ productId: configuredItem.productId, quantity: finalQuantity });
        }
        itemsAddedCount++;
    });

    setCartItems(updatedCart);
    showToast(`${itemsAddedCount} item(s) from template "${templateToConfigureForCart.name}" added/updated in cart.`);
    
    const updatedTemplates = savedTemplates.map(t => 
      t.id === templateToConfigureForCart.id ? { ...t, lastUsedAt: new Date().toISOString() } : t
    );
    setSavedTemplates(updatedTemplates);

    setTemplateToConfigureForCart(null);
    setConfiguredTemplateItems([]);
    setCustomerCurrentPage(Page.CART); 
  };


  // Get count of unfulfilled orders
  const getUnfulfilledOrdersCount = (): number => {
    return orders.filter(order => 
      order.status !== 'Delivered' && order.status !== 'Cancelled'
    ).length;
  };

  // Static banner component for delivery deadline and order count
  const DeliveryBanner: React.FC = () => {
    const deadlineText = `Order Deadline: ⏰ ${formatTimeRemaining(getNextNoonTime())} left for ${getShortDeliveryDateForNextNoon()}`;
    const unfulfilledCount = getUnfulfilledOrdersCount();
    const orderText = `Currently ${unfulfilledCount} unfulfilled order(s)`;
    
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white h-8 flex items-center px-4">
        <div className="text-sm font-medium truncate">
          {deadlineText}. {orderText}
        </div>
      </div>
    );
  };

  const renderProductsPage = () => {
    const { allGrouped, allDisplayableCategoriesSorted, hasResults } = displayedProductsResult;
    
    const renderProductListForCategory = (category: string, productsInCategory: Product[]) => {
        return (
            <div key={category}>
                <h2 
                    id={`category-header-${category.replace(/\s+/g, '-')}`}
                    ref={el => { categoryHeaderRefs.current[`category-header-${category.replace(/\s+/g, '-')}`] = el; }}
                    data-categoryname={category}
                    className="text-sm font-semibold text-neutral-darker bg-neutral-light py-1 px-4"
                >
                    {category}
                </h2>
                <div className="p-1 sm:p-2">
                    {productsInCategory.map(product => {
                        const orderCartItem = cartItems.find(item => item.productId === product.id);
                        const templateDraftItem = currentDraftTemplateItems.find(item => item.product.id === product.id);
                        return (
                            <ProductListItem
                                key={product.id}
                                product={product}
                                productPageMode={productPageMode}
                                showImage={showProductImages}

                                isPendingOrderQuantityForThisItem={productPageMode === 'ORDER' && productPendingOrderQuantityProductId === product.id}
                                orderCartQuantity={orderCartItem ? orderCartItem.quantity : 0}
                                onInitiateOrderQuantityEntry={handleInitiateOrderQuantityEntry}
                                onConfirmOrderQuantity={handleConfirmOrderQuantity}
                                onCancelOrderQuantityEntry={handleCancelOrderQuantityEntry}
                                onRemoveFromOrderCart={handleRemoveFromOrderCart}

                                isPendingTemplateQuantityForThisItem={productPageMode === 'TEMPLATE' && productPendingTemplateQuantityProductId === product.id}
                                templateDraftQuantity={templateDraftItem ? templateDraftItem.quantity : 0}
                                onInitiateTemplateQuantityEntry={handleInitiateTemplateQuantityEntry}
                                onConfirmTemplateQuantity={handleConfirmTemplateQuantity}
                                onCancelTemplateQuantityEntry={handleCancelTemplateQuantityEntry}
                                onRemoveFromTemplateDraft={handleRemoveFromTemplateDraft}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
      <div ref={productPageContentRef}> 
        {/* Delivery Deadline Banner */}
        <DeliveryBanner />
        
        <div className="sticky top-8 bg-neutral-light z-30 p-2 shadow-sm h-12 flex items-center">
          <div className="relative flex-grow mr-1 sm:mr-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon name="search" className="w-5 h-5 text-neutral-400" />
            </span>
            <input
              type="text"
              placeholder="Search products or categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-1.5 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-neutral-darker text-white placeholder-neutral-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white"
                aria-label="Clear search"
              >
                <Icon name="xCircle" className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center space-x-0.5"> 
            <Button variant="ghost" onClick={() => { setTempSelectedCategories(selectedCategories); setIsFilterModalOpen(true); }} size="sm" className="p-1.5 relative text-neutral-darker hover:text-primary">
              <Icon name="filter" className="w-5 h-5" />
              {selectedCategories.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>}
            </Button>
            <Button variant="ghost" onClick={() => setIsSortModalOpen(true)} size="sm" className="p-1.5 text-neutral-darker hover:text-primary">
              <Icon name="sort" className="w-5 h-5" />
            </Button>
            <Button 
                variant="ghost" 
                onClick={() => setShowProductImages(!showProductImages)} 
                size="sm" 
                className="p-1.5 text-neutral-darker hover:text-primary"
                title={showProductImages ? "Hide product images" : "Show product images"}
            >
              <Icon name={showProductImages ? "eye" : "eye"} className={`w-5 h-5 ${!showProductImages ? 'opacity-50' : ''}`} />
            </Button>
          </div>
        </div>



        <div className="sticky top-[3rem] bg-neutral-light z-20 py-1 px-3 border-b border-neutral-DEFAULT flex space-x-2 h-10 items-center">
            <Button
                variant={productPageMode === 'ORDER' ? 'primary' : 'ghost'}
                onClick={() => { setProductPageMode('ORDER'); setProductPendingOrderQuantityProductId(null); setProductPendingTemplateQuantityProductId(null); }}
                className="flex-1"
                size="sm"
            >
                For Order
            </Button>
            <Button
                variant={productPageMode === 'TEMPLATE' ? 'secondary' : 'ghost'}
                onClick={() => { setProductPageMode('TEMPLATE'); setProductPendingOrderQuantityProductId(null); setProductPendingTemplateQuantityProductId(null); }}
                className="flex-1"
                size="sm"
            >
                For Template
            </Button>
        </div>

        <div className="sticky top-[7.5rem] bg-white z-10 shadow">
            <button 
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-1.5 text-left text-neutral-darker hover:bg-neutral-light h-8"
                aria-expanded={isCategoryDropdownOpen}
                aria-controls="category-dropdown-list"
            >
                <span className="font-semibold truncate">
                    {activeCategoryInView || (allDisplayableCategoriesSorted.length > 0 ? "Select Category" : "No Categories")}
                </span>
                <Icon name="chevronDown" className={`w-5 h-5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryDropdownOpen && (
                <div id="category-dropdown-list" className="absolute top-full left-0 right-0 bg-white border-x border-b border-neutral-DEFAULT shadow-lg max-h-60 overflow-y-auto z-10">
                    {allDisplayableCategoriesSorted.map(category => (
                        <button
                            key={category}
                            onClick={() => handleCategorySelectAndScroll(category)}
                            className="block w-full text-left px-4 py-2 hover:bg-neutral-light text-neutral-darker"
                        >
                            {category}
                        </button>
                    ))}
                    {allDisplayableCategoriesSorted.length === 0 && <p className="px-4 py-2 text-neutral-dark">No categories found</p>}
                </div>
            )}
        </div>

        <div className="bg-neutral-light"> 
            {hasResults ? 
                allDisplayableCategoriesSorted.map(category => renderProductListForCategory(category, allGrouped[category]))
                : (
                <div className="text-center py-10 px-4">
                    <Icon name="search" className="w-12 h-12 text-neutral-DEFAULT mx-auto mb-4" />
                    <p className="text-neutral-dark text-lg">
                        {searchQuery || selectedCategories.length > 0 ? "No products match your criteria." : "No products available."}
                    </p>
                    {(searchQuery || selectedCategories.length > 0) && (
                        <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategories([]); }} className="mt-4">
                            Clear Search & Filters
                        </Button>
                    )}
                </div>
            )}
        </div>

        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Products"
          footer={
            <>
              <Button variant="ghost" onClick={handleFilterClear}>Clear Filters</Button>
              <Button variant="primary" onClick={handleFilterApply}>Apply Filters</Button>
            </>
          }>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {uniqueCategoriesFromProducts.map(category => (
              <label key={category} className="flex items-center space-x-2 p-2 hover:bg-neutral-light rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light"
                  checked={tempSelectedCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempSelectedCategories([...tempSelectedCategories, category]);
                    } else {
                      setTempSelectedCategories(tempSelectedCategories.filter(c => c !== category));
                    }
                  }}
                />
                <span className="text-neutral-darker">{category}</span>
              </label>
            ))}
            {uniqueCategoriesFromProducts.length === 0 && <p className="text-neutral-darker">No categories found.</p>}
          </div>
        </Modal>

        <Modal isOpen={isSortModalOpen} onClose={() => setIsSortModalOpen(false)} title="Sort Products">
          {([
            { label: 'Default', value: 'default' }, 
            { label: 'Name: A-Z', value: 'name_asc' },
            { label: 'Name: Z-A', value: 'name_desc' },
            { label: 'Category: A-Z', value: 'category_asc' },
            { label: 'Category: Z-A', value: 'category_desc' },
          ] as {label: string; value: SortOption}[]).map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSortSelect(opt.value)}
              className={`w-full text-left p-3 hover:bg-neutral-light rounded-md ${activeSort === opt.value ? 'font-semibold text-primary' : 'text-neutral-darker'}`}
            >
              {opt.label} {activeSort === opt.value && <Icon name="checkCircle" className="w-4 h-4 inline-block ml-2 text-primary" />}
            </button>
          ))}
        </Modal>
      </div>
    );
  };
  

const renderCartPage = () => {
    return (
        <div className="flex flex-col h-full bg-neutral-light">
            <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex items-center">
                <Button variant="ghost" onClick={() => setCustomerCurrentPage(Page.PRODUCTS)} className="mr-2 p-2">
                    <Icon name="chevronLeft" className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-semibold text-neutral-darker flex-grow">
                    Shopping Cart ({cartItems.length} unique item{cartItems.length === 1 ? '' : 's'})
                </h1>
            </div>

            <div className="flex-grow overflow-y-auto p-4 pb-28"> 
                {cartProducts.length === 0 ? ( // Use cartProducts here for accurate display count
                    <div className="text-center py-10">
                        <Icon name="shoppingCart" className="w-20 h-20 text-neutral-DEFAULT mx-auto mb-4"/>
                        <p className="text-neutral-darker text-xl font-semibold">Your cart is empty.</p>
                        <p className="text-neutral-dark mt-1">Add some products to get started!</p>
                        <Button 
                            variant="primary" 
                            onClick={() => setCustomerCurrentPage(Page.PRODUCTS)} 
                            className="mt-6"
                            size="lg"
                        >
                            Browse Products
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cartProducts.map(item => (
                            <CartItemDisplay
                                key={item.id}
                                item={item}
                                onUpdateQuantity={handleUpdateCartQuantity}
                                onRemoveItem={handleRemoveFromOrderCart}
                            />
                        ))}
                    </div>
                )}
            </div>

            {cartProducts.length > 0 && ( // Use cartProducts here
                <div className="bg-white border-t border-neutral-DEFAULT p-3 sticky bottom-0 z-10 w-full">
                    <div className="flex justify-between items-center mb-2"> 
                        <span className="text-md font-semibold text-neutral-darker">Estimated Total:</span>
                        <span className="text-xl font-bold text-primary">${totalCartPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex space-x-2"> 
                        <Button 
                            variant="ghost" 
                            onClick={() => setCustomerCurrentPage(Page.PRODUCTS)} 
                            className="flex-1" 
                            size="md" 
                        >
                            Add more
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => setCustomerCurrentPage(Page.ORDER_DETAILS)} 
                            className="flex-1" 
                            size="md" 
                        >
                            Order Details
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const renderOrderDetailsPage = () => {
    const totalUniqueItems = cartProducts.length; // Use cartProducts
    const totalOverallQuantity = cartProducts.reduce((sum, item) => sum + item.quantity, 0); // Use cartProducts
    const today = new Date();
    const minInvoiceDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const maxInvoiceDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    const isConfirmDisabled = 
        (selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT || selectedContactInfoOption === ADD_NEW_CONTACT_OPTION_VALUE) ||
        (selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE) ||
        (!isBillingSameAsShipping && (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedBillingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) ||
        (isAdvanceOrder && !selectedInvoiceDate);

    const handleShippingAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === ADD_NEW_ADDRESS_OPTION_VALUE) {
            setSelectedShippingAddressOption(ADD_NEW_ADDRESS_DISPLAY_TEXT);
            setShippingAddressModalContext('shipping');
            setIsAddShippingAddressModalOpen(true);
        } else {
            setSelectedShippingAddressOption(value);
        }
    };

    const handleBillingAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === ADD_NEW_ADDRESS_OPTION_VALUE) {
            setSelectedBillingAddressOption(ADD_NEW_ADDRESS_DISPLAY_TEXT);
            setShippingAddressModalContext('billing');
            setIsAddShippingAddressModalOpen(true);
        } else {
            setSelectedBillingAddressOption(value);
        }
    };
    
    const handleContactInfoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === ADD_NEW_CONTACT_OPTION_VALUE) {
            setSelectedContactInfoOption(ADD_NEW_CONTACT_DISPLAY_TEXT);
            setIsAddContactInfoModalOpen(true);
        } else {
            setSelectedContactInfoOption(value);
        }
    };

    const handleOpenOrderConfirmModal = () => {
        if (isConfirmDisabled) {
            let message = "Please complete all required fields: ";
            if (selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT || selectedContactInfoOption === ADD_NEW_CONTACT_OPTION_VALUE) message += "Contact Info, ";
            if (selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE) message += "Shipping Address, ";
            if (!isBillingSameAsShipping && (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedBillingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) message += "Billing Address, ";
            if (isAdvanceOrder && !selectedInvoiceDate) message += "Invoice Date, ";
            showToast(message.slice(0, -2) + ".");
            return;
        }
        setIsOrderConfirmModalOpen(true);
    };

    const handleAdvanceOrderToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsAdvanceOrder(e.target.checked);
        if (!e.target.checked) {
            setSelectedInvoiceDate(null);
        }
    };

    const formatDateOnly = (date: Date | null | string): string => {
        if (!date) return 'N/A';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return 'Invalid Date';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    return (
        <div className="flex flex-col h-full bg-neutral-light"> 
            <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex items-center">
                <Button variant="ghost" onClick={() => setCustomerCurrentPage(Page.CART)} className="mr-2 p-2">
                    <Icon name="chevronLeft" className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-semibold text-neutral-darker flex-grow">Order Details</h1>
            </div>

            <div className="flex-grow overflow-y-auto p-4 pb-28">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold text-neutral-darker mb-1">Order Summary</h2>
                    <p className="text-sm text-neutral-dark">Total Unique Items: {totalUniqueItems}</p>
                    <p className="text-sm text-neutral-dark">Total Quantity: {totalOverallQuantity}</p>
                    <p className="text-md font-semibold text-neutral-darker mt-1">Estimated Total: <span className="text-primary">${totalCartPrice.toFixed(2)}</span></p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-4">
                    <div className="border-b border-neutral-light pb-4 mb-4">
                        <div className="flex items-center">
                            <input 
                                type="checkbox"
                                id="advanceOrder"
                                checked={isAdvanceOrder}
                                onChange={handleAdvanceOrderToggle}
                                className="h-4 w-4 text-primary border-neutral-DEFAULT rounded focus:ring-primary mr-2"
                            />
                            <label htmlFor="advanceOrder" className="text-sm font-medium text-neutral-darker">Advance Order</label>
                        </div>
                        <p className="text-xs text-neutral-dark mt-1 ml-6">
                            Order Date: {formatDateOnly(today)}
                        </p>
                        {!isAdvanceOrder && (
                            <p className="text-xs text-neutral-dark mt-0.5 ml-6">Invoice Date same as Order Date</p>
                        )}
                        {isAdvanceOrder && (
                            <div className="mt-2 ml-6">
                                <DatePicker
                                    label="Invoice Date:"
                                    selectedDate={selectedInvoiceDate}
                                    onChange={setSelectedInvoiceDate}
                                    minDate={minInvoiceDate}
                                    maxDate={maxInvoiceDate}
                                    id="invoiceDate"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="shopName" className="block text-sm font-medium text-neutral-dark mb-1">Shop Name</label>
                        <select
                            id="shopName"
                            value={selectedOrderShopLocation}
                            onChange={(e) => setSelectedOrderShopLocation(e.target.value as ShopLocation)}
                            className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-white text-neutral-darker"
                        >
                            {ShopLocations.map(shop => (
                                <option key={shop} value={shop}>{shop}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="shippingAddress" className="block text-sm font-medium text-neutral-dark mb-1">Shipping Address</label>
                        <select
                            id="shippingAddress"
                            value={selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT ? ADD_NEW_ADDRESS_OPTION_VALUE : selectedShippingAddressOption}
                            onChange={handleShippingAddressChange}
                            className={`w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-white ${
                                selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT ? 'text-neutral-dark' : 'text-neutral-darker'
                            }`}
                        >
                            {availableShippingAddresses.map(addr => (
                                <option 
                                    key={addr} 
                                    value={addr === ADD_NEW_ADDRESS_DISPLAY_TEXT ? ADD_NEW_ADDRESS_OPTION_VALUE : addr}
                                    className={addr === ADD_NEW_ADDRESS_DISPLAY_TEXT ? 'italic text-blue-500' : ''}
                                >
                                    {addr}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center mb-2">
                             <input 
                                type="checkbox"
                                id="sameAsShipping"
                                checked={isBillingSameAsShipping}
                                onChange={(e) => setIsBillingSameAsShipping(e.target.checked)}
                                className="h-4 w-4 text-primary border-neutral-DEFAULT rounded focus:ring-primary mr-2"
                            />
                            <label htmlFor="sameAsShipping" className="text-sm font-medium text-neutral-darker">Billing address is the same as shipping address</label>
                        </div>

                        {isBillingSameAsShipping ? (
                            <div>
                                <h3 className="text-sm font-medium text-neutral-dark mb-1">Billing Address</h3>
                                <p className="text-sm text-neutral-darker p-2 bg-neutral-light rounded-md break-words">
                                    {selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT ? "Please select a shipping address" : selectedShippingAddressOption}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="billingAddress" className="block text-sm font-medium text-neutral-dark mb-1">Billing Address</label>
                                <select
                                    id="billingAddress"
                                    value={selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT ? ADD_NEW_ADDRESS_OPTION_VALUE : selectedBillingAddressOption}
                                    onChange={handleBillingAddressChange}
                                    className={`w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-white ${
                                        selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT ? 'text-neutral-dark' : 'text-neutral-darker'
                                    }`}
                                >
                                    {billingAddressOptions.map(addr => (
                                        <option 
                                            key={addr} 
                                            value={addr === ADD_NEW_ADDRESS_DISPLAY_TEXT ? ADD_NEW_ADDRESS_OPTION_VALUE : addr}
                                            className={addr === ADD_NEW_ADDRESS_DISPLAY_TEXT ? 'italic text-blue-500' : ''}
                                        >
                                            {addr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="contactInfo" className="block text-sm font-medium text-neutral-dark mb-1">Contact Person & Contact Number</label>
                        <select
                            id="contactInfo"
                            value={selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT ? ADD_NEW_CONTACT_OPTION_VALUE : selectedContactInfoOption}
                            onChange={handleContactInfoChange}
                             className={`w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-white ${
                                selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT ? 'text-neutral-dark' : 'text-neutral-darker'
                            }`}
                        >
                            {availableContactInfos.map(contact => (
                                <option 
                                    key={contact} 
                                    value={contact === ADD_NEW_CONTACT_DISPLAY_TEXT ? ADD_NEW_CONTACT_OPTION_VALUE : contact}
                                    className={contact === ADD_NEW_CONTACT_DISPLAY_TEXT ? 'italic text-blue-500' : ''}
                                >
                                    {contact}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-neutral-dark mb-2">Attachments (Optional)</h3>
                        <div className="space-y-3">
                            <div>
                                {attachedPhoto ? (
                                    <div className="flex items-center justify-between p-2 bg-neutral-light rounded-md">
                                        <span className="text-sm text-neutral-darker truncate flex items-center" title={attachedPhoto.name}>
                                            <Icon name="camera" className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="truncate">{attachedPhoto.name}</span>
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={handleRemovePhoto} className="p-1 text-red-500 flex-shrink-0">
                                            <Icon name="xCircle" className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button variant="ghost" onClick={handleAttachPhotoClick} className="w-full justify-start border border-neutral-DEFAULT hover:bg-neutral-light px-3 py-2 text-neutral-darker">
                                        <Icon name="camera" className="w-5 h-5 mr-2" /> Attach Photo
                                    </Button>
                                )}
                                <input
                                    type="file"
                                    ref={photoInputRef}
                                    onChange={handlePhotoSelected}
                                    accept="image/*"
                                    className="hidden"
                                    aria-label="Attach photo"
                                />
                            </div>

                            <div>
                                {attachedDocument ? (
                                    <div className="flex items-center justify-between p-2 bg-neutral-light rounded-md">
                                        <span className="text-sm text-neutral-darker truncate flex items-center" title={attachedDocument.name}>
                                            <Icon name="paperclip" className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="truncate">{attachedDocument.name}</span>
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={handleRemoveDocument} className="p-1 text-red-500 flex-shrink-0">
                                            <Icon name="xCircle" className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button variant="ghost" onClick={handleAttachDocumentClick} className="w-full justify-start border border-neutral-DEFAULT hover:bg-neutral-light px-3 py-2 text-neutral-darker">
                                        <Icon name="paperclip" className="w-5 h-5 mr-2" /> Attach Purchase Order
                                    </Button>
                                )}
                                <input
                                    type="file"
                                    ref={documentInputRef}
                                    onChange={handleDocumentSelected}
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" 
                                    className="hidden"
                                    aria-label="Attach purchase order"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {cartProducts.length > 0 && ( // Use cartProducts here
                 <div className="bg-white border-t border-neutral-DEFAULT p-3 sticky bottom-0 z-10 w-full"> 
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-md font-semibold text-neutral-darker">Estimated Total:</span>
                        <span className="text-xl font-bold text-primary">${totalCartPrice.toFixed(2)}</span>
                    </div>
                    <Button 
                        variant="success" 
                        onClick={handleOpenOrderConfirmModal} 
                        className="w-full"
                        size="md"
                        disabled={isConfirmDisabled}
                    >
                        Confirm Order
                    </Button>
                </div>
            )}
             {cartProducts.length === 0 && ( // Use cartProducts here
                <div className="bg-white border-t border-neutral-DEFAULT p-3 sticky bottom-0 z-10 w-full"> 
                    <p className="text-center text-neutral-dark mb-2 text-sm">Your cart is empty. Please add items to proceed.</p>
                     <Button 
                        variant="primary" 
                        onClick={() => setCustomerCurrentPage(Page.CART)} 
                        className="w-full"
                        size="md" 
                    >
                        Back to Cart
                    </Button>
                </div>
            )}
        </div>
    );
};


const renderCreateTemplatePage = () => {
    const handleRemoveFromDraft = (productId: string) => {
      setCurrentDraftTemplateItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleToggleDay = (day: DayOfWeek) => {
        setCurrentDraftTemplateDays(prevDays => 
            prevDays.includes(day) ? prevDays.filter(d => d !== day) : [...prevDays, day]
        );
    };
  
    const isDraftActive = newTemplateName.trim() !== '' || 
                          currentDraftTemplateItems.length > 0 || 
                          currentDraftTemplateDays.length > 0 ||
                          currentDraftTemplateShop !== undefined ||
                          !!editingTemplateId;
  
    return (
      <div className="p-4"> 
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => {
            setCustomerCurrentPage(Page.TEMPLATES);
          }} className="mr-2 p-2">
            <Icon name="chevronLeft" className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-neutral-darker">
            {editingTemplateId ? 'Edit Template' : 'Create New Template'}
          </h1>
        </div>
  
        <div className="mb-4">
          <label htmlFor="templateName" className="block text-sm font-medium text-neutral-dark mb-1">Template Name</label>
          <input
            type="text"
            id="templateName"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="e.g., Monthly Staples, Quick Meals"
            className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-neutral-darker text-white placeholder-neutral-400"
          />
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-dark mb-1">Select Day(s)</label>
            <div className="flex flex-wrap gap-2">
                {DaysOfWeek.map(day => (
                    <Button
                        key={day}
                        variant={currentDraftTemplateDays.includes(day) ? 'primary' : 'ghost'}
                        onClick={() => handleToggleDay(day)}
                        size="sm"
                        className="flex-grow sm:flex-grow-0"
                    >
                        {day}
                    </Button>
                ))}
            </div>
        </div>

        <div className="mb-4">
            <label htmlFor="templateShop" className="block text-sm font-medium text-neutral-dark mb-1">For Shop</label>
            <select
                id="templateShop"
                value={currentDraftTemplateShop || ''}
                onChange={(e) => setCurrentDraftTemplateShop(e.target.value as ShopLocation || undefined)}
                className={`w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary bg-white ${
                    currentDraftTemplateShop ? 'text-neutral-darker' : 'text-neutral-dark'
                }`}
            >
                <option value="" className="text-neutral-dark">Select Shop...</option>
                {ShopLocations.map(shop => (
                    <option key={shop} value={shop} className="text-neutral-darker">{shop}</option>
                ))}
            </select>
        </div>
  
        <h2 className="text-lg font-semibold text-neutral-darker mb-2">Items in Template ({currentDraftTemplateItems.filter(i => i.quantity > 0).length})</h2>
        {currentDraftTemplateItems.filter(item => item.quantity > 0).length === 0 ? (
          <div className="text-center py-6 bg-neutral-light rounded-lg">
            <Icon name="list" className="w-12 h-12 text-neutral-DEFAULT mx-auto mb-3"/>
            <p className="text-neutral-dark">No items added yet.</p>
            <p className="text-xs text-neutral-dark mt-1">Go to Products, select "For Template" mode, and add items.</p>
            <Button variant="secondary" onClick={() => {
                setProductPageMode("TEMPLATE"); 
                setCustomerCurrentPage(Page.PRODUCTS);
            }} className="mt-3">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {currentDraftTemplateItems.filter(item => item.quantity > 0).map(item => (
              <div key={item.product.id} className="flex items-center bg-white p-2 rounded-lg shadow">
                <div className="flex-grow">
                  <h4 className="text-sm font-semibold text-neutral-darker">{item.product.name}</h4>
                  <p className="text-xs text-neutral-dark">{item.product.uom}</p>
                  <p className="text-xs text-neutral-dark">Quantity: {item.quantity}</p>
                </div>
                <div className="flex flex-col items-end ml-2">
                    <Button size="sm" variant="danger" onClick={() => handleRemoveFromTemplateDraft(item.product.id)} className="p-1">
                        <Icon name="trash" className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-3 space-y-2">
            <Button 
                variant="primary" 
                onClick={handleFinalizeTemplate} 
                className="w-full" 
                size="md"
                disabled={!newTemplateName.trim() || currentDraftTemplateItems.filter(i => i.quantity > 0).length === 0}
            >
            <Icon name="save" className="w-4 h-4 mr-1.5"/> {editingTemplateId ? "Save Changes" : "Save Template"}
            </Button>
            <Button 
                variant="ghost" 
                onClick={() => {
                    setProductPageMode("TEMPLATE");
                    setCustomerCurrentPage(Page.PRODUCTS);
                }} 
                className="w-full text-neutral-darker" 
                size="md"
            >
            Continue Adding Products
            </Button>
            {isDraftActive && (
            <Button 
                variant="danger" 
                onClick={handleDiscardDraft}
                className="w-full" 
                size="md"
            >
                <Icon name="trash" className="w-4 h-4 mr-1.5"/> Discard Draft
            </Button>
            )}
        </div>
      </div>
    );
  };
  
const renderTemplatesPage = () => {
    const hasActiveDraft = currentDraftTemplateItems.length > 0 || 
                           !!newTemplateName.trim() || 
                           currentDraftTemplateDays.length > 0 ||
                           currentDraftTemplateShop !== undefined ||
                           !!editingTemplateId;
    const hasStagedButNoDraftContext = stagedForTemplateItems.length > 0 && 
                                      !editingTemplateId && 
                                      currentDraftTemplateItems.length === 0 && 
                                      !newTemplateName.trim() &&
                                      currentDraftTemplateDays.length === 0 &&
                                      currentDraftTemplateShop === undefined;


    const mainButtonText = editingTemplateId ? `Resume Editing '${savedTemplates.find(t=> t.id === editingTemplateId)?.name || 'Template'}'` 
                           : (newTemplateName.trim() || currentDraftTemplateItems.length > 0 || currentDraftTemplateDays.length > 0 || currentDraftTemplateShop) ? `Resume Draft (${currentDraftTemplateItems.filter(i=>i.quantity > 0).length})` 
                           : hasStagedButNoDraftContext ? `Draft from Staged (${stagedForTemplateItems.length})` 
                           : "Create New";
    
    const mainButtonIcon: IconName = (editingTemplateId || newTemplateName.trim() || currentDraftTemplateItems.length > 0 || currentDraftTemplateDays.length > 0 || currentDraftTemplateShop) ? "edit" 
                                      : hasStagedButNoDraftContext ? "list" 
                                      : "plus";


    const mainButtonAction = () => {
        if (hasStagedButNoDraftContext && !editingTemplateId && currentDraftTemplateItems.length === 0 && !newTemplateName.trim()) {
             setCurrentDraftTemplateItems(stagedForTemplateItems.map(p => ({ product: p, quantity: 1 })));
        }
        setCustomerCurrentPage(Page.CREATE_TEMPLATE);
    };

    const UNASSIGNED_SHOP_GROUP_LABEL = "Other Templates";
    const sortedTemplates = [...savedTemplates].sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    const groupedTemplates = sortedTemplates.reduce((acc, template) => {
        const groupKey = template.shop || UNASSIGNED_SHOP_GROUP_LABEL;
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(template);
        return acc;
    }, {} as Record<string, Template[]>);

    const groupOrder = [...ShopLocations, UNASSIGNED_SHOP_GROUP_LABEL];


    const renderTemplateCard = (template: Template) => {
        const uniqueItemCount = template.items.length;
        return (
          <div key={template.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-primary cursor-pointer hover:underline" onClick={() => handleViewTemplateDetails(template.id)}>{template.name}</h3>
                    <p className="text-sm text-neutral-dark">{uniqueItemCount} unique item{uniqueItemCount === 1 ? '' : 's'}</p>
                    {template.days && template.days.length > 0 && <p className="text-xs text-neutral-dark">Days: {template.days.join(', ')}</p>}
                    {template.shop && <p className="text-xs text-neutral-dark">Shop: {template.shop}</p>}
                    <div className="text-xs text-neutral-dark mt-1 space-y-0.5">
                        <p>Template created on: {formatDateForDisplay(template.createdAt)}</p>
                        <p>Created by: Praveen</p>
                        {template.updatedAt && <p>Template last updated on: {formatDateForDisplay(template.updatedAt)}</p>}
                        {template.lastUsedAt && <p>Template last used for order on: {formatDateForDisplay(template.lastUsedAt)}</p>}
                    </div>
                </div>
                <div className="flex space-x-1">
                    <Button variant="ghost" onClick={() => handleEditTemplate(template.id)} size="sm" className="p-1 text-neutral-dark hover:text-primary" title="Edit Template">
                        <Icon name="edit" className="w-5 h-5"/>
                    </Button>
                    <Button variant="ghost" onClick={() => handleDeleteTemplate(template.id)} size="sm" className="p-1 text-red-500 hover:text-red-700" title="Delete Template">
                        <Icon name="trash" className="w-5 h-5"/>
                    </Button>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-light grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleUseTemplate(template.id)} className="col-span-1">
                <Icon name="shoppingCart" className="w-4 h-4 mr-1"/> Add All
              </Button>
              <Button variant="tertiary" size="sm" onClick={() => handleInitiateConfigureTemplateForCart(template)} className="col-span-1">
                <Icon name="settings" className="w-4 h-4 mr-1"/> Configure & Add
              </Button>
               <Button variant="ghost" size="sm" onClick={() => handleViewTemplateDetails(template.id)} className="col-span-2 sm:col-span-1 text-primary"> 
                <Icon name="eye" className="w-4 h-4 mr-1"/> View Details
              </Button>
            </div>
          </div>
        );
    };

    return (
    <div className="p-4"> 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-neutral-darker">My Templates</h1>
        <Button variant="primary" onClick={mainButtonAction}>
          <Icon name={mainButtonIcon} className="w-5 h-5 mr-1" /> 
          {mainButtonText}
        </Button>
      </div>
      {savedTemplates.length === 0 && !hasActiveDraft && !hasStagedButNoDraftContext ? ( 
        <div className="text-center py-10">
            <Icon name="template" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
            <p className="text-neutral-dark text-xl">No templates saved yet.</p>
            <p className="text-sm text-neutral-dark mt-1">Create templates for frequently ordered items, or stage some products to start a draft.</p>
        </div>
      ) : (
        <>
            {groupOrder.map(groupKey => {
                const templatesInGroup = groupedTemplates[groupKey];
                if (!templatesInGroup || templatesInGroup.length === 0) return null;

                return (
                    <div key={groupKey} className="mb-6">
                        <h2 className="text-xl font-semibold text-neutral-darker mt-4 mb-3 pb-1 border-b border-neutral-DEFAULT">
                            {groupKey}
                        </h2>
                        <div className="space-y-4">
                            {templatesInGroup.map(template => renderTemplateCard(template))}
                        </div>
                    </div>
                );
            })}
             {Object.keys(groupedTemplates).length === 0 && (hasActiveDraft || hasStagedButNoDraftContext) && (
                <div className="text-center py-10">
                    <p className="text-neutral-dark text-lg">No saved templates yet, but you have an active draft or staged items.</p>
                </div>
            )}
        </>
      )}
    </div>
    );
};

const renderViewTemplateDetailsPage = () => {
    const template = savedTemplates.find(t => t.id === viewingTemplateId);
    if (!template) {
      return (
        <div className="p-4 text-center"> 
          <p className="text-neutral-darker">Template not found.</p>
          <Button onClick={() => setCustomerCurrentPage(Page.TEMPLATES)} className="mt-4">Back to Templates</Button>
        </div>
      );
    }
  
    const templateItemsDetails: ProductInCart[] = template.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return { ...product, quantity: item.quantity };
    });
  
    const uniqueItemCount = template.items.length;
  
    return (
      <div className="p-4"> 
        <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setCustomerCurrentPage(Page.TEMPLATES)} className="mr-2 p-2">
                <Icon name="chevronLeft" className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-semibold text-neutral-darker truncate" title={template.name}>{template.name}</h1>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <p className="text-sm text-neutral-dark">Template created on: {formatDateForDisplay(template.createdAt)}</p>
            <p className="text-sm text-neutral-dark mt-1">Created by: Praveen</p>
            {template.updatedAt && <p className="text-sm text-neutral-dark mt-1">Template last updated on: {formatDateForDisplay(template.updatedAt)}</p>}
            {template.lastUsedAt && <p className="text-sm text-neutral-dark mt-1">Template last used for order on: {formatDateForDisplay(template.lastUsedAt)}</p>}
            
            {template.days && template.days.length > 0 && <p className="text-sm text-neutral-dark mt-2">Applicable Days: <span className="font-medium">{template.days.join(', ')}</span></p>}
            {template.shop && <p className="text-sm text-neutral-dark mt-1">Designated Shop: <span className="font-medium">{template.shop}</span></p>}
            
            <p className="text-lg font-semibold text-neutral-darker mt-2">{uniqueItemCount} unique item{uniqueItemCount === 1 ? '' : 's'}</p>
        </div>

        <h2 className="text-xl font-semibold text-neutral-darker mb-3">Items in this Template</h2>
        {templateItemsDetails.length === 0 ? (
          <p className="text-neutral-dark">This template is empty.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {templateItemsDetails.map(item => (
              <div key={item.id} className="flex items-center bg-white p-3 rounded-lg shadow">
                {showProductImages && <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4"/>}
                <div className="flex-grow">
                  <h4 className="text-md font-semibold text-neutral-darker">{item.name}</h4>
                  <p className="text-sm text-neutral-dark">UOM: {item.uom}</p>
                  <p className="text-sm text-neutral-dark">Quantity: {item.quantity}</p> 
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="primary" onClick={() => handleUseTemplate(template.id)} size="lg">
                <Icon name="shoppingCart" className="w-5 h-5 mr-2"/> Add All to Cart
            </Button>
            <Button variant="secondary" onClick={() => handleEditTemplate(template.id)} size="lg">
                <Icon name="edit" className="w-5 h-5 mr-2"/> Edit
            </Button>
            <Button variant="danger" onClick={() => handleDeleteTemplate(template.id)} size="lg">
                 <Icon name="trash" className="w-5 h-5 mr-2"/> Delete
            </Button>
        </div>
      </div>
    );
  };
  

  const renderOrderConfirmationPage = () => {
    const order = currentOrderDetails; 
  
    if (!order) {
      return (
        <div className="p-4 text-center"> 
          <Icon name="receipt" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
          <p className="text-xl text-neutral-darker font-semibold">No order details to display.</p>
          <Button onClick={() => setCustomerCurrentPage(Page.PRODUCTS)} className="mt-6">Continue Shopping</Button>
          <Button variant="ghost" onClick={() => setCustomerCurrentPage(Page.ORDER_HISTORY)} className="mt-3">View Order History</Button>
        </div>
      );
    }
  
    return (
      <div className="p-4"> 
        <div className="text-center mb-8 pt-4">
            <Icon name="checkCircle" className="w-20 h-20 text-green-500 mx-auto mb-4"/>
            <h1 className="text-3xl font-bold text-neutral-darker">Order Confirmed!</h1>
            <p className="text-neutral-dark mt-1">Thank you for your purchase.</p>
        </div>
  
        <div className="bg-white p-5 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-neutral-darker mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm text-neutral-darker">
            <div className="flex justify-between"><span>Order ID:</span> <span className="font-medium">#{order.id}</span></div>
            <div className="flex justify-between"><span>Order Date:</span> <span className="font-medium">{formatDateForDisplay(order.orderDate)}</span></div>
            {order.invoiceDate && order.invoiceDate !== order.orderDate && (
                 <div className="flex justify-between"><span>Invoice Date:</span> <span className="font-medium">{formatDateForDisplay(order.invoiceDate)}</span></div>
            )}
            <div className="flex justify-between"><span>Status:</span> <span className="font-medium px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">{order.status}</span></div>
            {order.shopLocation && <div className="flex justify-between"><span>Shop:</span> <span className="font-medium">{order.shopLocation}</span></div>}
            {order.shippingAddress && <div className="flex justify-between"><span>Shipping To:</span> <span className="font-medium text-right break-all">{order.shippingAddress}</span></div>}
            {order.billingAddress && <div className="flex justify-between"><span>Billing To:</span> <span className="font-medium text-right break-all">{order.billingAddress}</span></div>}
            {order.contactNumber && <div className="flex justify-between"><span>Contact:</span> <span className="font-medium">{order.contactNumber}</span></div>}
            {order.customerType && <div className="flex justify-between"><span>Customer Type:</span> <span className="font-medium">{order.customerType}</span></div>}
            
            {/* Modification Information */}
            {order.isModified && (!order.modificationRequests || order.modificationRequests.length === 0) && (
              <>
                <div className="flex justify-between"><span>Order Modified:</span> <span className="font-medium text-orange-600">Yes</span></div>
                {order.modificationDate && <div className="flex justify-between"><span>Modified Date:</span> <span className="font-medium">{formatDateForDisplay(order.modificationDate)}</span></div>}
                {order.originalTotalPrice && (
                  <div className="flex justify-between"><span>Original Total:</span> <span className="font-medium line-through text-neutral-dark">${order.originalTotalPrice.toFixed(2)}</span></div>
                )}
                {order.modificationSummary && (
                  <div className="flex justify-between"><span>Changes:</span> <span className="font-medium text-right break-words text-sm text-orange-600">{order.modificationSummary}</span></div>
                )}
              </>
            )}

                          {/* Show modification request count if any */}
              {hasAnyModificationRequests(order) && (
                                            <div className="flex justify-between"><span>Modification Requests:</span> <span className="font-medium text-blue-600">{getTotalModificationRequestsCount(order)} Request{getTotalModificationRequestsCount(order) > 1 ? 's' : ''}</span></div>
            )}
            
            {order.attachedPhotoName && (
                <div className="flex justify-between items-center">
                    <span>Attached Photo:</span>
                    <span className="font-medium text-neutral-darker flex items-center text-right break-all">
                        <Icon name="camera" className="w-4 h-4 mr-1 flex-shrink-0 text-neutral-dark" />
                        {order.attachedPhotoName}
                    </span>
                </div>
            )}
            {order.attachedDocumentName && (
                <div className="flex justify-between items-center">
                    <span>Attached Purchase Order:</span>
                    <span className="font-medium text-neutral-darker flex items-center text-right break-all">
                        <Icon name="paperclip" className="w-4 h-4 mr-1 flex-shrink-0 text-neutral-dark" />
                        {order.attachedDocumentName}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-neutral-light">
                <span className="text-lg font-semibold">Estimated Total:</span> 
                <span className="text-2xl font-bold text-primary">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-darker mb-3 mt-6">Items Ordered:</h3>
        <div className="space-y-3">
          {(() => {
            // Create enhanced items with modification details
            const createEnhancedItems = () => {
              if (!order.modificationRequests || order.modificationRequests.length === 0) {
                // No modifications, show items normally
                return order.items.map(item => ({ 
                  ...item, 
                  modificationType: 'none' as const,
                  originalQuantity: null,
                  requestInfo: null
                }));
              }

              // Find the most recent modification request to show changes (regardless of status)
              const allRequests = order.modificationRequests
                .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
              
              if (allRequests.length === 0) {
                // No requests, show current items normally
                return order.items.map(item => ({ 
                  ...item, 
                  modificationType: 'none' as const,
                  originalQuantity: null,
                  requestInfo: null
                }));
              }

              const latestRequest = allRequests[0];
              const originalItems = order.items; // Current items (after modification)
              const requestedItems = latestRequest.requestedItems;

              // Create item comparison maps
              const originalItemsMap = new Map(originalItems.map(item => [item.id, item]));
              const requestedItemsMap = new Map(requestedItems.map(item => [item.id, item]));

              const enhancedItems: Array<{
                id: string;
                name: string; 
                description: string;
                price: number;
                imageUrl: string;
                category: string;
                uom: string;
                quantity: number;
                modificationType: 'none' | 'added' | 'removed' | 'quantityChanged';
                originalQuantity: number | null;
                requestInfo: { requestDate: string; status: string } | null;
              }> = [];

              // Since order.items represents the current state (after modifications),
              // we need to figure out what the original state was before modifications
              // For now, let's assume we're showing what was requested vs what is current

              // Add all current items first
              originalItems.forEach(currentItem => {
                const requestedItem = requestedItemsMap.get(currentItem.id);
                
                if (!requestedItem) {
                  // Item exists in current order but not in request - this means it was supposed to be removed
                  enhancedItems.push({
                    ...currentItem,
                    modificationType: 'removed',
                    originalQuantity: currentItem.quantity,
                    requestInfo: { requestDate: latestRequest.requestDate, status: latestRequest.status }
                  });
                } else if (requestedItem.quantity !== currentItem.quantity) {
                  // Quantity was changed
                  enhancedItems.push({
                    ...currentItem,
                    modificationType: 'quantityChanged',
                    originalQuantity: requestedItem.quantity, // What was requested
                    requestInfo: { requestDate: latestRequest.requestDate, status: latestRequest.status }
                  });
                } else {
                  // No change
                  enhancedItems.push({
                    ...currentItem,
                    modificationType: 'none',
                    originalQuantity: null,
                    requestInfo: null
                  });
                }
              });

              // Add items that were requested but don't exist in current order (were added)
              requestedItems.forEach(requestedItem => {
                const currentItem = originalItemsMap.get(requestedItem.id);
                if (!currentItem) {
                  // This item was added in the request
                  enhancedItems.push({
                    ...requestedItem,
                    modificationType: 'added',
                    originalQuantity: null,
                    requestInfo: { requestDate: latestRequest.requestDate, status: latestRequest.status }
                  });
                }
              });

              // Sort: modified items first, then normal items
              return enhancedItems.sort((a, b) => {
                const aIsModified = a.modificationType !== 'none';
                const bIsModified = b.modificationType !== 'none';
                
                if (aIsModified && !bIsModified) return -1;
                if (!aIsModified && bIsModified) return 1;
                
                // Both modified or both normal, maintain original order
                return 0;
              });
            };

            const enhancedItems = createEnhancedItems();

            return enhancedItems.map(item => (
              <div key={item.id} className={`flex items-center p-3 rounded-lg shadow ${
                item.modificationType === 'added' ? 'bg-green-50 border-l-4 border-green-400' :
                item.modificationType === 'removed' ? 'bg-red-50 border-l-4 border-red-400' :
                item.modificationType === 'quantityChanged' ? 'bg-blue-50 border-l-4 border-blue-400' :
                'bg-white'
              }`}>
                {/* Modification indicator */}
                {item.modificationType !== 'none' && (
                  <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm">
                    {item.modificationType === 'added' && (
                      <div className="bg-green-500 w-full h-full rounded-full flex items-center justify-center">
                        <span>+</span>
                      </div>
                    )}
                    {item.modificationType === 'removed' && (
                      <div className="bg-red-500 w-full h-full rounded-full flex items-center justify-center">
                        <span>−</span>
                      </div>
                    )}
                    {item.modificationType === 'quantityChanged' && (
                      <div className="bg-blue-500 w-full h-full rounded-full flex items-center justify-center">
                        <span>↕</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Product image */}
              {showProductImages && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-3"/>}
                
                {/* Product details */}
              <div className="flex-grow">
                  <p className={`font-semibold text-sm ${
                    item.modificationType === 'removed' ? 'line-through text-red-600' :
                    item.modificationType === 'added' ? 'text-green-700' :
                    'text-neutral-darker'
                  }`}>
                    {item.name}
                  </p>
                <p className="text-xs text-neutral-dark">UOM: {item.uom}</p>
                  
                  {/* Quantity display with modification details */}
                  <div className="text-xs text-neutral-dark">
                    {item.modificationType === 'quantityChanged' ? (
                      <span>
                        Qty: <span className="line-through text-red-500">{item.originalQuantity}</span>{' '}
                        <span className="text-green-600 font-medium">→ {item.quantity}</span>
                      </span>
                    ) : item.modificationType === 'removed' ? (
                      <span className="line-through text-red-600">Qty: {item.quantity}</span>
                    ) : (
                      <span className={item.modificationType === 'added' ? 'text-green-700 font-medium' : ''}>
                        Qty: {item.quantity}
                      </span>
                    )}
              </div>
                  
                  {/* Modification info */}
                  {item.requestInfo && (
                    <p className="text-xs text-blue-600 mt-1">
                      {item.modificationType === 'added' && '✅ Added in modification'}
                      {item.modificationType === 'removed' && '❌ Removed in modification'}
                      {item.modificationType === 'quantityChanged' && '📝 Quantity updated'}
                    </p>
                  )}
            </div>
              </div>
            ));
          })()}
        </div>
  
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="primary" onClick={() => setCustomerCurrentPage(Page.PRODUCTS)} size="lg">
            Continue Shopping
          </Button>
          <Button variant="ghost" onClick={() => setCustomerCurrentPage(Page.ORDER_HISTORY)} size="lg" className="text-neutral-darker">
            View Order History
          </Button>
        </div>
      </div>
    );
  };
  
  const renderOrderHistoryPage = () => (
    <div className="p-4"> 
      <h1 className="text-2xl font-semibold text-neutral-darker mb-6">Order History</h1>
      {orders.length === 0 ? (
         <div className="text-center py-10">
            <Icon name="receipt" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
            <p className="text-neutral-dark text-xl">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(order => {
            const existingTicket = allSupportTickets.find(ticket => ticket.orderId === order.id);
            return (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center space-x-2">
                    <h2 
                        className="text-md font-semibold text-primary cursor-pointer hover:underline" 
                        onClick={() => { setCurrentOrderDetails(order); setCustomerCurrentPage(Page.ORDER_CONFIRMATION);}}
                    >
                        Order ID: #{order.id}
                    </h2>
                      {order.modificationRequests && order.modificationRequests.length > 0 && (() => {
                        const pendingRequests = order.modificationRequests.filter(req => req.status === 'pending');
                        const processedRequests = order.modificationRequests.filter(req => req.status !== 'pending');
                        
                        return (
                          <div className="flex flex-wrap gap-1">
                            {pendingRequests.length > 0 && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {pendingRequests.length === 1 ? 'Request Pending' : `${pendingRequests.length} Requests Pending`}
                              </span>
                            )}
                            {processedRequests.length > 0 && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {processedRequests.length} Processed
                              </span>
                            )}
                          </div>
                        );
                      })()}
                                             {order.isModified && hasNoModificationRequests(order) && (
                         <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                           Modified
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-neutral-dark">Order Date: {formatDateForDisplay(order.orderDate)}</p>
                     {order.invoiceDate && order.invoiceDate !== order.orderDate && (
                        <p className="text-xs text-neutral-dark">Invoice Date: {formatDateForDisplay(order.invoiceDate)}</p>
                     )}
                     {order.modificationRequests && order.modificationRequests.length > 0 && (
                        <div className="space-y-1">
                          {order.modificationRequests.slice(0, 3).map((request, index) => (
                            <div key={request.id}>
                              <p className="text-xs text-blue-600">
                                Request #{index + 1}: {formatDateForDisplay(request.requestDate)}
                                <span className={`ml-2 px-1 rounded ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {request.status}
                                </span>
                              </p>
                              {request.processedDate && (
                                <p className="text-xs text-green-600">
                                  {request.status === 'accepted' ? 'Approved' : 'Processed'}: {formatDateForDisplay(request.processedDate)}
                                </p>
                              )}
                            </div>
                          ))}
                                                      {getTotalModificationRequestsCount(order) > 3 && (
                                                            <p className="text-xs text-gray-500">+ {getTotalModificationRequestsCount(order) - 3} more requests</p>
                          )}
                        </div>
                     )}
                     {order.isModified && order.modificationDate && (!order.modificationRequests || order.modificationRequests.length === 0) && (
                        <p className="text-xs text-orange-600">Modified: {formatDateForDisplay(order.modificationDate)}</p>
                     )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Confirmed' || order.status === 'To be packed' || order.status === 'To ship' || order.status === 'Billed in Insmart' ? 'bg-blue-100 text-blue-700' : 
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700' // Includes new statuses
                  }`}>
                    {order.status}
                </span>
              </div>
              <p className="text-sm text-neutral-darker">Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              {order.shopLocation && <p className="text-xs text-neutral-dark mt-1">Shop: {order.shopLocation}</p>}
              {order.shippingAddress && <p className="text-xs text-neutral-dark mt-0.5">Shipping: {order.shippingAddress}</p>}
              {order.customerType && <p className="text-xs text-neutral-dark mt-0.5">Customer Type: {order.customerType}</p>}
              <div className="mt-3 pt-3 border-t border-neutral-light flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleReorder(order.id)}
                    className="flex-1"
                >
                  <Icon name="refreshCcw" className="w-4 h-4 mr-1"/> Reorder
                </Button>
                {canModifyOrder(order) && (
                  <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleModifyOrder(order.id)}
                      className="flex-1"
                  >
                    <Icon name="edit" className="w-4 h-4 mr-1"/> Modify Order
                  </Button>
                )}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setCurrentOrderDetails(order); setCustomerCurrentPage(Page.ORDER_CONFIRMATION);}}
                    className="flex-1 text-neutral-darker"
                >
                   <Icon name="eye" className="w-4 h-4 mr-1"/> View Details
                </Button>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                {existingTicket ? (
                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleOpenViewTicketModal(existingTicket)}
                        className="flex-1"
                        leftIcon={<Icon name="ticket" className="w-4 h-4" />}
                    >
                        View Ticket ({existingTicket.issues.length} Issue{existingTicket.issues.length === 1 ? '' : 's'})
                    </Button>
                ) : (
                    <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleOpenCreateTicketModal(order)}
                        className="flex-1"
                        leftIcon={<Icon name="ticket" className="w-4 h-4" />}
                    >
                        Create Ticket
                    </Button>
                )}
                <div className="relative group">
                    <Icon name="info" className="w-5 h-5 text-neutral-dark cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs
                                    invisible group-hover:visible 
                                    bg-neutral-darker text-white text-xs rounded py-1 px-2 z-10 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Users are allowed to create tickets within 24 hours from time of delivery.
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full 
                                        w-0 h-0 
                                        border-x-4 border-x-transparent 
                                        border-t-4 border-t-neutral-darker"></div>
                    </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
  const renderModifyOrderPage = () => {
    if (!orderBeingModified) {
      return (
        <div className="p-4 text-center"> 
          <Icon name="receipt" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
          <p className="text-xl text-neutral-darker font-semibold">No order to modify.</p>
          <Button onClick={() => setCustomerCurrentPage(Page.ORDER_HISTORY)} className="mt-6">Back to Order History</Button>
        </div>
      );
    }

    const modificationProducts = modificationCartItems
      .map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        return product ? { ...product, quantity: cartItem.quantity } : null;
      })
      .filter((item): item is ProductInCart => item !== null);

    const totalModificationPrice = modificationProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalUniqueItems = modificationProducts.length;
    const totalOverallQuantity = modificationProducts.reduce((sum, item) => sum + item.quantity, 0);

    const handleUpdateModificationQuantity = (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        setModificationCartItems(modificationCartItems.filter(item => item.productId !== productId));
        showToast('Item removed from order');
      } else {
        setModificationCartItems(modificationCartItems.map(item => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    };

    const handleAddItemToModification = (productId: string, quantity: number = 1) => {
      const existingIndex = modificationCartItems.findIndex(item => item.productId === productId);
      if (existingIndex >= 0) {
        // If item already exists, add quantities
        const updatedItems = [...modificationCartItems];
        updatedItems[existingIndex].quantity += quantity;
        setModificationCartItems(updatedItems);
      } else {
        // If new item, add it
        setModificationCartItems([...modificationCartItems, { productId, quantity }]);
      }
      
      const product = products.find(p => p.id === productId);
      showToast(`${product?.name} added to order modification`);
    };

    const handleScrollToExistingItem = (productId: string) => {
      // Clear the search input so user can search for next item
      setModificationSearchQuery('');
      
      // Find the element with the product ID and scroll to it
      const element = document.querySelector(`[data-product-id="${productId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a red blinking border effect
        element.classList.add('animate-pulse', 'border-4', 'border-red-500', 'rounded-lg');
        // Create a more pronounced blinking effect
        const blinkInterval = setInterval(() => {
          element.classList.toggle('border-red-500');
          element.classList.toggle('border-red-300');
        }, 300);
        
        setTimeout(() => {
          clearInterval(blinkInterval);
          element.classList.remove('animate-pulse', 'border-4', 'border-red-500', 'border-red-300', 'rounded-lg');
        }, 2000);
      }
    };

    // Filter products based on search query
    const searchResults = products.filter(product => 
      modificationSearchQuery ? 
        product.name.toLowerCase().includes(modificationSearchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(modificationSearchQuery.toLowerCase())
      : false
    ).slice(0, 10); // Limit to 10 results for performance

    const handleSaveOrderModification = () => {
      if (modificationProducts.length === 0) {
        alert('Cannot save an empty order. Please add items or cancel the modification.');
        return;
      }
      
      // Show the modification summary modal first
      handleOpenModificationSummary(modificationProducts, totalModificationPrice);
    };



    const handleCancelModification = () => {
      setOrderBeingModified(null);
      setModificationCartItems([]);
      setIsInModificationMode(false);
      setModificationSearchQuery('');
      setShowAddItemsSection(false);
      setCartItems([]); // Clear any items that might be in regular cart
      setCustomerCurrentPage(Page.ORDER_HISTORY);
    };



    return (
      <div className="flex flex-col h-full bg-neutral-light"> 
        <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex items-center">
          <Button variant="ghost" onClick={handleCancelModification} className="mr-2 p-2">
            <Icon name="chevronLeft" className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-neutral-darker flex-grow">
            Modify Order #{orderBeingModified.id}
          </h1>
        </div>

        <div className="flex-grow overflow-y-auto p-4 pb-28">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold text-neutral-darker mb-1">Modification Summary</h2>
            <p className="text-sm text-neutral-dark">Total Unique Items: {totalUniqueItems}</p>
            <p className="text-sm text-neutral-dark">Total Quantity: {totalOverallQuantity}</p>
            <p className="text-md font-semibold text-neutral-darker mt-1">
              New Total: <span className="text-primary">${totalModificationPrice.toFixed(2)}</span>
            </p>
            <p className="text-sm text-neutral-dark mt-1">
              Original Total: <span className="line-through">${orderBeingModified.totalPrice.toFixed(2)}</span>
            </p>
          </div>
          
          {/* Add Items Section */}
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="p-4 border-b border-neutral-light">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-neutral-darker">Add Items</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddItemsSection(!showAddItemsSection)}
                  leftIcon={<Icon name={showAddItemsSection ? "minus" : "plus"} className="w-4 h-4" />}
                >
                  {showAddItemsSection ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            
            {showAddItemsSection && (
              <div className="p-4">
                <div className="relative mb-4">
                  <input
                    ref={modificationSearchInputRef}
                    type="text"
                    placeholder="Search for products to add..."
                    value={modificationSearchQuery}
                    onChange={(e) => setModificationSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary"
                  />
                  <Icon name="search" className="absolute left-3 top-2.5 w-5 h-5 text-neutral-dark" />
                </div>
                
                {modificationSearchQuery && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map(product => {
                        const isAlreadyInOrder = modificationCartItems.some(item => item.productId === product.id);
                        
                        // Check if this product has pending modification requests
                        const existingRequests = orderBeingModified.modificationRequests || [];
                        const pendingRequests = existingRequests.filter(req => req.status === 'pending');
                        
                        // Helper function to check if an item is involved in any pending request
                        const isItemInvolvedInPendingRequest = (productId: string): boolean => {
                          return pendingRequests.some(request => {
                            // Check if item is in the requested items (being kept/modified)
                            const isInRequestedItems = request.requestedItems.some(item => item.id === productId);
                            
                            // Check if item was removed (was in current order but not in requested items)
                            const isInCurrentOrder = orderBeingModified.items.some(item => item.id === productId);
                            const isRemovedInRequest = isInCurrentOrder && !isInRequestedItems;
                            
                            return isInRequestedItems || isRemovedInRequest;
                          });
                        };
                        
                        const hasPendingRequest = isItemInvolvedInPendingRequest(product.id);
                        
                        return (
                          <div key={product.id} className={`flex items-center justify-between p-3 border border-neutral-light rounded-lg ${
                            hasPendingRequest ? 'opacity-50 bg-gray-50' : 'hover:bg-neutral-light'
                          }`}>
                            <div className="flex-grow">
                              <h4 className={`font-medium ${hasPendingRequest ? 'text-gray-400' : 'text-neutral-darker'}`}>{product.name}</h4>
                              <p className={`text-sm ${hasPendingRequest ? 'text-gray-400' : 'text-neutral-dark'}`}>{product.category} • {product.uom} • ${product.price.toFixed(2)}</p>
                              {hasPendingRequest && (
                                <p className="text-xs text-yellow-600 mt-1">⚠️ Has pending modification request</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {isAlreadyInOrder && !hasPendingRequest && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">In Order</span>
                              )}
                              {hasPendingRequest && (
                                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Pending Request</span>
                              )}
                              <Button 
                                variant={isAlreadyInOrder && !hasPendingRequest ? "secondary" : "primary"}
                                size="sm"
                                disabled={hasPendingRequest}
                                onClick={() => {
                                  if (hasPendingRequest) return;
                                  isAlreadyInOrder ? handleScrollToExistingItem(product.id) : handleAddItemToModification(product.id);
                                }}
                                leftIcon={<Icon name={isAlreadyInOrder && !hasPendingRequest ? "edit" : "plus"} className="w-4 h-4" />}
                              >
                                {hasPendingRequest ? "Disabled" : (isAlreadyInOrder ? "Adjust quantity" : "Add")}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-neutral-dark py-4">No products found matching "{modificationSearchQuery}"</p>
                    )}
                  </div>
                )}
                
                {!modificationSearchQuery && (
                  <p className="text-center text-neutral-dark py-4">Start typing to search for products...</p>
                )}
              </div>
            )}
          </div>

          {/* Current Items in Order */}
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="p-4 border-b border-neutral-light">
              <h2 className="text-lg font-semibold text-neutral-darker">Items in Order ({modificationProducts.length})</h2>
            </div>
            
            {modificationProducts.length > 0 ? (
              <div className="space-y-3 p-4">
                {(() => {
                  // Identify items with pending modification requests
                  const existingRequests = orderBeingModified.modificationRequests || [];
                  const pendingRequests = existingRequests.filter(req => req.status === 'pending');
                  
                  // Helper function to check if an item is involved in any pending request
                  const isItemInvolvedInPendingRequest = (productId: string): boolean => {
                    return pendingRequests.some(request => {
                      // Check if item is in the requested items (being kept/modified)
                      const isInRequestedItems = request.requestedItems.some(item => item.id === productId);
                      
                      // Check if item was removed (was in current order but not in requested items)
                      const isInCurrentOrder = orderBeingModified.items.some(item => item.id === productId);
                      const isRemovedInRequest = isInCurrentOrder && !isInRequestedItems;
                      
                      return isInRequestedItems || isRemovedInRequest;
                    });
                  };

                  return modificationProducts.map(item => {
                    const hasPendingRequest = isItemInvolvedInPendingRequest(item.id);
                    
                    return (
                      <div key={item.id} data-product-id={item.id} className={`transition-colors duration-200 ${
                        hasPendingRequest ? 'opacity-50' : ''
                      }`}>
                        {hasPendingRequest && (
                          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center text-yellow-700">
                              <Icon name="info" className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                This item has a pending modification request. Changes are disabled until admin processes the request.
                              </span>
                            </div>
                          </div>
                        )}
                        <div className={hasPendingRequest ? 'pointer-events-none' : ''}>
                          <CartItemDisplay 
                            item={item}
                            onUpdateQuantity={hasPendingRequest ? () => {} : (productId, newQuantity) => handleUpdateModificationQuantity(productId, newQuantity)}
                            onRemoveItem={hasPendingRequest ? () => {} : (productId) => handleUpdateModificationQuantity(productId, 0)}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Icon name="shoppingCart" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                <p className="text-neutral-dark text-lg">No items in this order.</p>
                <p className="text-sm text-neutral-dark mt-2">Use the search above to add items.</p>
              </div>
            )}
          </div>
        </div>

        {modificationProducts.length > 0 && (
          <div className="bg-white border-t border-neutral-DEFAULT p-3 sticky bottom-0 z-10 w-full"> 
            <div className="flex justify-between items-center mb-2">
              <span className="text-md font-semibold text-neutral-darker">New Total:</span>
              <span className="text-xl font-bold text-primary">${totalModificationPrice.toFixed(2)}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                onClick={handleCancelModification} 
                className="flex-1"
                size="md"
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={handleSaveOrderModification} 
                className="flex-1"
                size="md"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
        
        {modificationProducts.length === 0 && (
          <div className="bg-white border-t border-neutral-DEFAULT p-3 sticky bottom-0 z-10 w-full"> 
            <Button 
              variant="ghost" 
              onClick={handleCancelModification} 
              className="w-full"
              size="md" 
            >
              Cancel Modification
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Helper functions for delivery information
  const formatTimeRemaining = (targetTime: Date): string => {
    const diff = targetTime.getTime() - currentTime.getTime();
    if (diff <= 0) return "0m0s";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h${minutes}m${seconds}s`;
    }
    return `${minutes}m${seconds}s`;
  };

  const getTodayNoonTime = (): Date => {
    const today = new Date(currentTime);
    today.setHours(12, 0, 0, 0);
    return today;
  };

  const getNextNoonTime = (): Date => {
    const today = new Date(currentTime);
    today.setHours(12, 0, 0, 0);
    
    // If current time is after 12 PM today, get tomorrow's 12 PM
    if (currentTime >= today) {
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      return tomorrow;
    }
    
    // Otherwise, return today's 12 PM
    return today;
  };

  const getTodayTuasDeadline = (): Date => {
    const today = new Date(currentTime);
    today.setHours(16, 30, 0, 0);
    return today;
  };

  const getNextTuasDeadline = (): Date => {
    const today = new Date(currentTime);
    today.setHours(16, 30, 0, 0);
    
    // If current time is after 4:30 PM today, get tomorrow's 4:30 PM
    if (currentTime >= today) {
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(16, 30, 0, 0);
      return tomorrow;
    }
    
    // Otherwise, return today's 4:30 PM
    return today;
  };

  const getTomorrowDate = (): string => {
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTodayDate = (): string => {
    return currentTime.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDeliveryDateForNextNoon = (): string => {
    const nextNoon = getNextNoonTime();
    // For normal locations, delivery is the same day as the deadline
    return nextNoon.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getShortDeliveryDateForNextNoon = (): string => {
    const nextNoon = getNextNoonTime();
    // For banner, show short format like "7 Jul"
    return nextNoon.toLocaleDateString('en-SG', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDeliveryDateForNextTuasDeadline = (): string => {
    const nextTuasDeadline = getNextTuasDeadline();
    const deliveryDate = new Date(nextTuasDeadline);
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    return deliveryDate.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
const renderProfilePage = () => {
    const ProfileInfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <p className="text-neutral-darker"><span className="font-medium text-neutral-dark">{label}:</span> {value}</p>
    );

    const CollapsibleCard: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; footer?: React.ReactNode }> = 
    ({ title, isOpen, onToggle, children, footer }) => (
        <div className="bg-white rounded-lg shadow mb-4">
            <button 
                onClick={onToggle} 
                className="flex justify-between items-center w-full text-left p-4 hover:bg-neutral-light rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                aria-expanded={isOpen}
            >
                <h3 className="text-md font-semibold text-neutral-darker">{title}</h3>
                <Icon name="chevronDown" className={`w-5 h-5 text-neutral-dark transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="p-4 border-t border-neutral-DEFAULT space-y-2 text-sm">
                        {children}
                    </div>
                    {footer && (
                        <div className="p-4 border-t border-neutral-DEFAULT">
                            {footer}
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const handleShopInfoUpdateRequest = (shopKey: 'shopTuasUpdateRequestSent' | 'shopBoonLayUpdateRequestSent', shopName: string) => {
        setProfileToggles(prev => ({ ...prev, [shopKey]: true }));
        showToast(`Update request for ${shopName} sent.`);
    };

    return (
        <div className="p-4 bg-neutral-light min-h-full"> 
            <h1 className="text-2xl font-semibold text-neutral-darker mb-6">Profile & Settings</h1>

            <div className="mb-6">
                <button 
                    onClick={() => handleProfileToggle('generalInfoSection')}
                    className="flex justify-between items-center w-full text-left py-3 px-1 mb-3 focus:outline-none"
                    aria-expanded={profileToggles.generalInfoSection}
                >
                    <h2 className="text-xl font-semibold text-primary">General Information</h2>
                    <Icon name="chevronDown" className={`w-6 h-6 text-primary transform transition-transform duration-200 ${profileToggles.generalInfoSection ? 'rotate-180' : ''}`} />
                </button>
                {profileToggles.generalInfoSection && (
                    <div className="pl-2 border-l-2 border-primary-light">
                        <CollapsibleCard 
                            title="User Information" 
                            isOpen={profileToggles.userInfoCard} 
                            onToggle={() => handleProfileToggle('userInfoCard')}
                        >
                            <ProfileInfoItem label="Name of User" value="Guest User" />
                            <ProfileInfoItem label="User Email Address" value="guest@example.com" />
                            <ProfileInfoItem label="User Phone Number" value="+65 9123 4567" />
                        </CollapsibleCard>

                        <CollapsibleCard 
                            title="Organization Details" 
                            isOpen={profileToggles.orgDetailsCard} 
                            onToggle={() => handleProfileToggle('orgDetailsCard')}
                        >
                            <ProfileInfoItem label="Organization Name" value="Al-Sheika" />
                            <ProfileInfoItem label="Owner Name" value="Mani" />
                            <ProfileInfoItem label="Owner Phone Number" value="+65 8468 2040" />
                        </CollapsibleCard>

                        <CollapsibleCard 
                            title="Manager Details" 
                            isOpen={profileToggles.managerDetailsCard} 
                            onToggle={() => handleProfileToggle('managerDetailsCard')}
                        >
                            <ProfileInfoItem label="Manager Name" value="Murali" />
                            <ProfileInfoItem label="Manager Phone Number" value="+65 8170 7358" />
                            <ProfileInfoItem label="Managing Shop(s)" value="Al-Sheika Tuas & Al-Sheika Boon Lay" />
                        </CollapsibleCard>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <button 
                    onClick={() => handleProfileToggle('shopDetailsSection')}
                    className="flex justify-between items-center w-full text-left py-3 px-1 mb-3 focus:outline-none"
                    aria-expanded={profileToggles.shopDetailsSection}
                >
                    <h2 className="text-xl font-semibold text-primary">Shop Details</h2>
                    <Icon name="chevronDown" className={`w-6 h-6 text-primary transform transition-transform duration-200 ${profileToggles.shopDetailsSection ? 'rotate-180' : ''}`} />
                </button>
                {profileToggles.shopDetailsSection && (
                     <div className="pl-2 border-l-2 border-primary-light">
                        <CollapsibleCard 
                            title="Shop: Al-Sheika Tuas" 
                            isOpen={profileToggles.shopTuasCard} 
                            onToggle={() => handleProfileToggle('shopTuasCard')}
                            footer={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShopInfoUpdateRequest('shopTuasUpdateRequestSent', 'Al-Sheika Tuas')}
                                    disabled={profileToggles.shopTuasUpdateRequestSent}
                                    className="w-full text-primary border border-primary hover:bg-primary-light hover:text-white disabled:bg-neutral-light disabled:text-neutral-dark disabled:border-neutral-DEFAULT"
                                >
                                    {profileToggles.shopTuasUpdateRequestSent ? "Request Sent" : "Request to update info"}
                                </Button>
                            }
                        >
                            <ProfileInfoItem label="Shop Name" value="Al-Sheika Tuas" />
                            <ProfileInfoItem label="Shop Address" value="123 Application Road, #10-10, Singapore 246810" />
                            <ProfileInfoItem label="Name of PIC (Ordering)" value="Praveen" />
                            <ProfileInfoItem label="Phone Number (Whatsapp) of PIC (Ordering)" value="+65 9876 5432" />
                            <ProfileInfoItem label="Name of PIC (Payments)" value="Praveen" />
                            <ProfileInfoItem label="Phone Number (Whatsapp) of PIC (Payments)" value="+65 9876 5432" />
                            <ProfileInfoItem label="Payment type" value="COD" />
                        </CollapsibleCard>

                        <CollapsibleCard 
                            title="Shop: Al-Sheika Boon Lay" 
                            isOpen={profileToggles.shopBoonLayCard} 
                            onToggle={() => handleProfileToggle('shopBoonLayCard')}
                            footer={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShopInfoUpdateRequest('shopBoonLayUpdateRequestSent', 'Al-Sheika Boon Lay')}
                                    disabled={profileToggles.shopBoonLayUpdateRequestSent}
                                    className="w-full text-primary border border-primary hover:bg-primary-light hover:text-white disabled:bg-neutral-light disabled:text-neutral-dark disabled:border-neutral-DEFAULT"
                                >
                                    {profileToggles.shopBoonLayUpdateRequestSent ? "Request Sent" : "Request to update info"}
                                </Button>
                            }
                        >
                            <ProfileInfoItem label="Shop Name" value="Al-Sheika Boon Lay" />
                            <ProfileInfoItem label="Shop Address" value="456 Order Road, #05-05, Singapore 135791" />
                            <ProfileInfoItem label="Name of PIC (Ordering)" value="Eswari" />
                            <ProfileInfoItem label="Phone Number (Whatsapp) of PIC (Ordering)" value="+65 9075 0347" />
                            <ProfileInfoItem label="Name of PIC (Payments)" value="Murali" />
                            <ProfileInfoItem label="Phone Number (Whatsapp) of PIC (Payments)" value="+65 8170 7358" />
                            <ProfileInfoItem label="Payment type" value="B2B" />
                        </CollapsibleCard>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <button 
                    onClick={() => handleProfileToggle('deliveryInfoSection')}
                    className="flex justify-between items-center w-full text-left py-3 px-1 mb-3 focus:outline-none"
                    aria-expanded={profileToggles.deliveryInfoSection}
                >
                    <h2 className="text-xl font-semibold text-primary">Delivery Information</h2>
                    <Icon name="chevronDown" className={`w-6 h-6 text-primary transform transition-transform duration-200 ${profileToggles.deliveryInfoSection ? 'rotate-180' : ''}`} />
                </button>
                {profileToggles.deliveryInfoSection && (
                    <div className="pl-2 border-l-2 border-primary-light">
                        <div className="bg-white rounded-lg shadow mb-4">
                            <div className="p-4">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-neutral-darker mb-3 flex items-center">
                                        <Icon name="calendar" className="w-5 h-5 mr-2 text-blue-500" />
                                        Current Time
                                    </h3>
                                    <p className="text-neutral-dark">
                                        {currentTime.toLocaleTimeString('en-SG', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true 
                                        })} - {getTodayDate()}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-neutral-darker mb-4 flex items-center">
                                        <Icon name="home" className="w-5 h-5 mr-2 text-green-500" />
                                        For Normal Locations
                                    </h3>
                                    
                                    {/* Dynamic countdown for next 12 PM deadline */}
                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center mb-2">
                                            <Icon name="info" className="w-4 h-4 mr-2 text-blue-600" />
                                            <span className="font-semibold text-blue-800">Next Order Deadline:</span>
                                        </div>
                                        <p className="text-blue-700 ml-6 font-medium">
                                            ⏰ {formatTimeRemaining(getNextNoonTime())} left for orders that will be delivered on {getDeliveryDateForNextNoon()}
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center mb-2">
                                            <Icon name="checkCircle" className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="font-medium text-green-800">If order is sent before 12:00 PM</span>
                                        </div>
                                        <p className="text-green-700 ml-6">Delivered: Same day</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Icon name="info" className="w-4 h-4 mr-2 text-blue-600" />
                                            <span className="font-medium text-blue-800">If order is sent after 12:00 PM</span>
                                        </div>
                                        <p className="text-blue-700 ml-6">Delivered: Next day</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-neutral-darker mb-4 flex items-center">
                                        <Icon name="layoutGrid" className="w-5 h-5 mr-2 text-orange-500" />
                                        For Special Locations
                                    </h3>
                                    
                                    {/* Dynamic countdown for next Tuas deadline */}
                                    <div className="bg-red-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center mb-2">
                                            <Icon name="info" className="w-4 h-4 mr-2 text-red-600" />
                                            <span className="font-semibold text-red-800">Next Tuas Deadline:</span>
                                        </div>
                                        <p className="text-red-700 ml-6 font-medium">
                                            ⏰ {formatTimeRemaining(getNextTuasDeadline())} left for orders that will be delivered on {getDeliveryDateForNextTuasDeadline()}
                                        </p>
                                    </div>

                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <Icon name="layoutGrid" className="w-4 h-4 mr-2 text-orange-600" />
                                            <span className="font-semibold text-orange-800">Tuas:</span>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <p className="text-orange-700">
                                                🕐 Our delivery driver leaves at 8:00 AM
                                            </p>
                                            <p className="text-orange-700">
                                                📦 For next day delivery
                                            </p>
                                            <p className="text-orange-700">
                                                ⏰ Please send your order before 4:30 PM the day before delivery
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-neutral-darker mb-4 flex items-center">
                                        <Icon name="settings" className="w-5 h-5 mr-2 text-purple-500" />
                                        Special Orders
                                    </h3>
                                    
                                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center mb-2">
                                            <Icon name="settings" className="w-4 h-4 mr-2 text-purple-600" />
                                            <span className="font-medium text-purple-800">For orders that include grinding</span>
                                        </div>
                                        <p className="text-purple-700 ml-6">⏱️ 2 working days</p>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Icon name="settings" className="w-4 h-4 mr-2 text-purple-600" />
                                            <span className="font-medium text-purple-800">For orders that include roasted grinding</span>
                                        </div>
                                        <p className="text-purple-700 ml-6">⏱️ 3 working days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
             <div className="mt-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-neutral-darker mb-3">App Management</h2>
                <Button 
                    variant="danger" 
                    onClick={() => {
                        if(window.confirm("Are you sure you want to clear all app data? This includes cart, templates, order history, and support tickets.")) {
                        localStorage.clear();
                        setCartItems([]);
                        setStagedForTemplateItems([]);
                        setCurrentDraftTemplateItems([]);
                        setNewTemplateName('');
                        setCurrentDraftTemplateDays([]);
                        setCurrentDraftTemplateShop(undefined);
                        setSavedTemplates([]);
                        setOrders([]);
                        setAllSupportTickets([]);
                        setSelectedCategories([]);
                        setActiveSort('default');
                        setSearchQuery('');
                        setProductPageMode('ORDER');
                        setEditingTemplateId(null); 
                        setSelectedOrderShopLocation(ShopLocations[0]);
                        setAvailableShippingAddresses([DEFAULT_SHIPPING_ADDRESS_1, DEFAULT_SHIPPING_ADDRESS_2, ADD_NEW_ADDRESS_DISPLAY_TEXT]);
                        setSelectedShippingAddressOption(DEFAULT_SHIPPING_ADDRESS_1);
                        setIsBillingSameAsShipping(true);
                        setSelectedBillingAddressOption(DEFAULT_SHIPPING_ADDRESS_1);
                        setAvailableContactInfos([DEFAULT_CONTACT_INFO_STRING, ADD_NEW_CONTACT_DISPLAY_TEXT]);
                        setSelectedContactInfoOption(DEFAULT_CONTACT_INFO_STRING);
                        setAttachedPhoto(null);
                        setAttachedDocument(null);
                        if (photoInputRef.current) photoInputRef.current.value = "";
                        if (documentInputRef.current) documentInputRef.current.value = "";
                        setIsAdvanceOrder(false);
                        setSelectedInvoiceDate(null);
                        setOrderIdCounter(1);
                        setProfileToggles({
                            generalInfoSection: false, userInfoCard: false, orgDetailsCard: false, managerDetailsCard: false,
                            shopDetailsSection: false, shopTuasCard: false, shopBoonLayCard: false,
                            shopTuasUpdateRequestSent: false, shopBoonLayUpdateRequestSent: false,
                            deliveryInfoSection: false,
                        });
                        setVisibleAdminOrderColumns(ALL_ADMIN_ORDER_TABLE_COLUMNS.filter(c => c.defaultVisible).map(c => c.id));
                        setShowProductImages(false); 
                        setProductPendingOrderQuantityProductId(null); 
                        setProductPendingTemplateQuantityProductId(null);
                        setTemplateToConfigureForCart(null);
                        setConfiguredTemplateItems([]);
                        setCurrentAdminOrderManagementSubTab(ADMIN_ORDER_MANAGEMENT_SUB_TABS[0]);
                        setCurrentAdminUserManagementSubTab(ADMIN_USER_MANAGEMENT_SUB_TABS[0]);
                        setCustomerCurrentPage(Page.PRODUCTS); 
                        setAdminCurrentPage(Page.ADMIN_DASHBOARD); 
                        setPanelDisplayMode('split'); 
                        showToast("All app data cleared.");
                        }
                    }}
                    className="w-full"
                    >
                    Clear All App Data
                </Button>
                <p className="text-xs text-neutral-dark mt-2 text-center">This will reset the application to its initial state.</p>
            </div>
        </div>
    );
};


const getColumnConfig = (id: AdminOrderTableColumnId): AdminOrderTableColumnConfig | undefined => {
    return ALL_ADMIN_ORDER_TABLE_COLUMNS.find(col => col.id === id);
};

const handleCellMouseDown = (e: React.MouseEvent<HTMLTableCellElement>, orderId: string, columnId: AdminOrderTableColumnId, initialValue: any) => {
    const actionButton = (e.target as HTMLElement).closest('button[data-action], span[data-action-wrapper]');
    if (actionButton) { 
        return; 
    }

    const colConfig = getColumnConfig(columnId);
    if (!colConfig || !colConfig.isEditable) return;

    setInlineEditMouseDownPos({ x: e.clientX, y: e.clientY });
};

const handleCellMouseUp = (
    e: React.MouseEvent<HTMLTableCellElement>, 
    orderId: string, 
    columnId: AdminOrderTableColumnId, 
    initialValue: any
) => {
    const actionButton = (e.target as HTMLElement).closest('button[data-action], span[data-action-wrapper]');
    if (actionButton) { 
        setInlineEditMouseDownPos(null);
        return; 
    }

    const colConfig = getColumnConfig(columnId);
    if (!colConfig || !colConfig.isEditable) return;
    if (!inlineEditMouseDownPos) return;

    // Check for internal billing hold when trying to edit shipping date
    if (columnId === 'shippingDate') {
        const order = orders.find(o => o.id === orderId);
        if (order && isOrderShopOnBillingHold(order)) {
            setInlineEditMouseDownPos(null);
            setIsInternalBillingHoldWarningModalOpen(true);
            return;
        }
    }

    const deltaX = Math.abs(e.clientX - inlineEditMouseDownPos.x);
    const deltaY = Math.abs(e.clientY - inlineEditMouseDownPos.y);

    if (deltaX < DRAG_THRESHOLD && deltaY < DRAG_THRESHOLD) { 
        const tdElement = e.currentTarget as HTMLElement;
        let preparedInitialValue = initialValue;
        
        if (columnId === 'shippingDate' && initialValue) {
            preparedInitialValue = new Date(initialValue);
        } else if (columnId === 'customerType' && !initialValue) {
            preparedInitialValue = DEFAULT_CUSTOMER_TYPE;
        }
        
        setEditingCellInfo({
            orderId,
            columnId,
            initialValue: preparedInitialValue, 
            cellElement: tdElement,
        });
        setInlineEditValue(columnId === 'billedInInsmartBy' && preparedInitialValue === undefined ? '' : preparedInitialValue ?? '');
    }
    setInlineEditMouseDownPos(null);
};


const handleSaveInlineEdit = () => {
    if (!editingCellInfo) return;

    const { orderId, columnId } = editingCellInfo;
    const orderBeingEdited = orders.find(o => o.id === orderId);
    if (!orderBeingEdited) {
        setEditingCellInfo(null);
        return;
    }

    let valueToSave = inlineEditValue;
    
    // If we're assigning a biller via inline edit from Ungrouped
    if (columnId === 'billedInInsmartBy' && valueToSave && !orderBeingEdited.billedInInsmartBy && currentAdminOrderManagementSubTab === 'To Bill in Insmart') {
        checkAndHandleAssignmentPriority([orderId], valueToSave as AdminStaffName, 'inlineEdit');
        setEditingCellInfo(null); // Close inline editor, priority modal will handle from here
        return;
    }

    // Standard save if not triggering priority check or if priority check already handled
    let statusToUpdate: OrderStatus | undefined = undefined;
    let billedDateToSet: string | undefined = undefined;

    if (columnId === 'shippingDate') {
        if (inlineEditValue instanceof Date) {
            // Validate shipping date before proceeding
            if (!validateShippingDate(inlineEditValue, [orderId], 'inline')) {
                return; // Validation failed, modal shown, wait for user decision
            }
            
        valueToSave = inlineEditValue.toISOString();
        if (orderBeingEdited && orderBeingEdited.status === 'To select date' && valueToSave) {
            statusToUpdate = 'To pick person for billing in Insmart';
            }
        } else if (inlineEditValue === null) {
            // Clearing shipping date
            valueToSave = undefined; // Set to undefined to clear the field
            // If clearing shipping date and order was 'To pick person for billing in Insmart', revert to 'To select date'
            if (orderBeingEdited && orderBeingEdited.status === 'To pick person for billing in Insmart' && !orderBeingEdited.billedInInsmartBy) {
                statusToUpdate = 'To select date';
            }
        }
    } else if (columnId === 'billedInInsmartBy') {
        if (valueToSave === '') { 
            valueToSave = undefined; // Clear the biller
        }
        if (orderBeingEdited) {
            if (valueToSave && orderBeingEdited.status === 'To pick person for billing in Insmart') {
                statusToUpdate = 'Order delegated for billing';
            } else if (!valueToSave && (orderBeingEdited.status === 'Order delegated for billing' || orderBeingEdited.status === 'Billing in progress')) {
                statusToUpdate = 'To pick person for billing in Insmart';
            }
        }
    } else if (columnId === 'status' && valueToSave === 'Billed in Insmart') {
        billedDateToSet = new Date().toISOString();
    }
    
    setOrders(prevOrders =>
        prevOrders.map(o => {
            if (o.id === orderId) {
                const updatedFields: Partial<Order> = { [columnId]: valueToSave };
                if (statusToUpdate) {
                    updatedFields.status = statusToUpdate;
                }
                if (billedDateToSet !== undefined) { 
                    updatedFields.billedDate = billedDateToSet;
                }
                return { ...o, ...updatedFields };
            }
            return o;
        })
    );
    showToast(`Order #${orderId} updated.`);
    setEditingCellInfo(null);
};

const calculatePopupPosition = (cellElement: HTMLElement | null): React.CSSProperties => {
    if (!cellElement) return { display: 'none' };
    
    const orderId = cellElement.dataset.orderId;
    const columnId = cellElement.dataset.columnId;
    let currentCellElement = cellElement;

    if (orderId && columnId) {
        const liveCell = document.querySelector(`td[data-order-id="${orderId}"][data-column-id="${columnId}"]`) as HTMLElement;
        if (liveCell) {
            currentCellElement = liveCell;
        }
    }
    
    const rect = currentCellElement.getBoundingClientRect();
    return {
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 2}px`,
        left: `${rect.left + window.scrollX}px`,
        minWidth: `${rect.width}px`, 
    };
};

const handleQuickAssignBiller = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); 
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // This is assigning a specific order from its quick assign button (not bulk)
    // The target is this single order, to DEFAULT_LOGGED_IN_ADMIN_STAFF
    checkAndHandleAssignmentPriority([orderId], DEFAULT_LOGGED_IN_ADMIN_STAFF, 'quickAssign');
};


const handleStartBilling = (orderId: string) => {
    const isAnotherOrderBeingBilledByCurrentUser = orders.some(
        o => o.id !== orderId && o.status === 'Billing in progress' && o.billedInInsmartBy === DEFAULT_LOGGED_IN_ADMIN_STAFF
    );

    if (isAnotherOrderBeingBilledByCurrentUser) {
        showToast("Please complete or cancel the current billing task before starting a new one.");
        return;
    }

    setOrders(prevOrders => 
        prevOrders.map(o => 
            o.id === orderId && o.status === 'Order delegated for billing' 
            ? { ...o, status: 'Billing in progress' } 
            : o
        )
    );
    showToast(`Billing started for Order #${orderId}.`);
};

const handleCompleteBilling = (orderId: string) => {
     setOrders(prevOrders => 
        prevOrders.map(o => 
            o.id === orderId && o.status === 'Billing in progress'
            ? { ...o, status: 'Billed in Insmart', billedDate: new Date().toISOString() } 
            : o
        )
    );
    showToast(`Billing completed for Order #${orderId}.`);
};

const handleCancelBilling = (orderId: string) => {
    setOrders(prevOrders => 
        prevOrders.map(o => 
            o.id === orderId && o.status === 'Billing in progress'
            ? { ...o, status: 'Order delegated for billing' } 
            : o
        )
    );
    showToast(`Billing cancelled for Order #${orderId}.`);
};


// --- New handlers for Quick Update Shipping Date ---
const handleOpenQuickUpdateShippingDateModal = () => {
    if (adminSelectedOrderIds.length > 0) {
        // Filter out orders with internal billing hold
        const eligibleOrderIds = adminSelectedOrderIds.filter(orderId => {
            const order = orders.find(o => o.id === orderId);
            return order && !isOrderShopOnBillingHold(order);
        });

        if (eligibleOrderIds.length === 0) {
            setIsInternalBillingHoldWarningModalOpen(true);
            return;
        }

        if (eligibleOrderIds.length < adminSelectedOrderIds.length) {
            const holdCount = adminSelectedOrderIds.length - eligibleOrderIds.length;
            showToast(`${holdCount} order(s) skipped due to internal billing hold. Proceeding with ${eligibleOrderIds.length} eligible order(s).`);
            setAdminSelectedOrderIds(eligibleOrderIds);
        }

        setQuickShippingDateToUpdate(null); // Reset date
        setIsQuickUpdateShippingDateModalOpen(true);
    } else {
        showToast("No orders selected for quick update.");
    }
};

const handleSaveQuickUpdateShippingDate = () => {
    if (adminSelectedOrderIds.length === 0) {
        showToast("No orders selected.");
        return;
    }

    // Handle clearing shipping date (when quickShippingDateToUpdate is null)
    if (quickShippingDateToUpdate === null) {
        setOrders(prevOrders =>
            prevOrders.map(order => {
                if (adminSelectedOrderIds.includes(order.id)) {
                    const updatedOrder = { ...order, shippingDate: undefined };
                    // If clearing shipping date and order was 'To pick person for billing in Insmart', revert to 'To select date'
                    if (updatedOrder.status === 'To pick person for billing in Insmart' && !updatedOrder.billedInInsmartBy) {
                        updatedOrder.status = 'To select date';
                    }
                    return updatedOrder;
                }
                return order;
            })
        );
        showToast(`${adminSelectedOrderIds.length} order(s) shipping date cleared.`);
        setAdminSelectedOrderIds([]);
        setIsQuickUpdateShippingDateModalOpen(false);
        setQuickShippingDateToUpdate(null);
        return;
    }

    // Validate shipping date before proceeding
    if (!validateShippingDate(quickShippingDateToUpdate, adminSelectedOrderIds, 'quick')) {
        return; // Validation failed, modal shown, wait for user decision
    }

    const newShippingDate = quickShippingDateToUpdate.toISOString();
    setOrders(prevOrders =>
        prevOrders.map(order => {
            if (adminSelectedOrderIds.includes(order.id)) {
                const updatedOrder = { ...order, shippingDate: newShippingDate };
                if (updatedOrder.status === 'To select date') {
                    updatedOrder.status = 'To pick person for billing in Insmart';
                }
                return updatedOrder;
            }
            return order;
        })
    );
    showToast(`${adminSelectedOrderIds.length} order(s) updated with new shipping date.`);
    setAdminSelectedOrderIds([]);
    setIsQuickUpdateShippingDateModalOpen(false);
    setQuickShippingDateToUpdate(null);
};

const handleQuickAssignToMe = () => {
    if (adminSelectedOrderIds.length === 0) {
        showToast("No orders selected to assign.");
        return;
    }
    // For "Quick Assign to Me", the intended biller is always DEFAULT_LOGGED_IN_ADMIN_STAFF
    checkAndHandleAssignmentPriority(adminSelectedOrderIds, DEFAULT_LOGGED_IN_ADMIN_STAFF, 'quickAssign');
};

// Shipping Date Confirmation Modal Handlers
const handleShippingDateConfirmCancel = () => {
    setIsShippingDateConfirmModalOpen(false);
    setShippingDateConfirmData(null);
};

const handleShippingDateConfirmProceed = () => {
    if (!shippingDateConfirmData) return;
    
    const { selectedDate, orderIds, context, originalData } = shippingDateConfirmData;
    
    // Proceed with the original update based on context
    if (context === 'inline') {
        // For inline edit, we need to continue the save process
        const { orderId } = editingCellInfo!;
        const orderBeingEdited = orders.find(o => o.id === orderId);
        if (!orderBeingEdited) return;
        
        let statusToUpdate: OrderStatus | undefined = undefined;
        const valueToSave = selectedDate.toISOString();
        
        if (orderBeingEdited.status === 'To select date' && valueToSave) {
            statusToUpdate = 'To pick person for billing in Insmart';
        }
        
        setOrders(prevOrders =>
            prevOrders.map(o => {
                if (o.id === orderId) {
                    const updatedFields: Partial<Order> = { shippingDate: valueToSave };
                    if (statusToUpdate) {
                        updatedFields.status = statusToUpdate;
                    }
                    return { ...o, ...updatedFields };
                }
                return o;
            })
        );
        showToast(`Order #${orderId} updated.`);
        setEditingCellInfo(null);
        
    } else if (context === 'bulk') {
        // For bulk update, call performBulkUpdate with the original data
        performBulkUpdate(orderIds, originalData.fields, originalData.flags);
        
    } else if (context === 'quick') {
        // For quick update, continue with the original quick update process
        const newShippingDate = selectedDate.toISOString();
        setOrders(prevOrders =>
            prevOrders.map(order => {
                if (orderIds.includes(order.id)) {
                    const updatedOrder = { ...order, shippingDate: newShippingDate };
                    if (updatedOrder.status === 'To select date') {
                        updatedOrder.status = 'To pick person for billing in Insmart';
                    }
                    return updatedOrder;
                }
                return order;
            })
        );
        showToast(`${orderIds.length} order(s) updated with new shipping date.`);
        setAdminSelectedOrderIds([]);
        setIsQuickUpdateShippingDateModalOpen(false);
        setQuickShippingDateToUpdate(null);
    }
    
    // Close confirmation modal
    setIsShippingDateConfirmModalOpen(false);
    setShippingDateConfirmData(null);
};

// Pending Modification Request Modal Handlers
const handlePendingModificationCancel = () => {
    setIsPendingModificationModalOpen(false);
    setPendingModificationOrder(null);
};

const handlePendingModificationCheckNow = () => {
    setIsPendingModificationModalOpen(false);
    setPendingModificationOrder(null);
    setCurrentAdminOrderManagementSubTab('Modification Requests');
};

const billTabSortFn = (a:Order, b:Order): number => {
    const statusSortOrderForBillingTab: OrderStatus[] = [
        'Billing in progress',
        'Order delegated for billing',
        'To pick person for billing in Insmart',
        'Billed in Insmart' 
    ];
    const getStatusSortValue = (status: OrderStatus): number => {
        const index = statusSortOrderForBillingTab.indexOf(status);
        return index === -1 ? statusSortOrderForBillingTab.length : index;
    };

    const statusOrderA = getStatusSortValue(a.status);
    const statusOrderB = getStatusSortValue(b.status);
    if (statusOrderA !== statusOrderB) {
        return statusOrderA - statusOrderB;
    }

    const shippingDateA = a.shippingDate ? new Date(a.shippingDate).getTime() : Infinity;
    const shippingDateB = b.shippingDate ? new Date(b.shippingDate).getTime() : Infinity;
    if (shippingDateA !== shippingDateB) {
        return shippingDateA - shippingDateB;
    }
    
    const scheduleA = getShipmentSchedule(a);
    const scheduleB = getShipmentSchedule(b);
    if (scheduleA !== scheduleB) {
        return scheduleA - scheduleB;
    }

    const invoiceDateA = new Date(a.invoiceDate || a.orderDate).getTime();
    const invoiceDateB = new Date(b.invoiceDate || b.orderDate).getTime();
    if (invoiceDateA !== invoiceDateB) {
        return invoiceDateA - invoiceDateB;
    }

    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(); // Older orders first
};

// Support Tickets Page
const renderSupportTicketsPage = () => {
    const handleViewTicket = (ticket: SupportTicket) => {
        setTicketToView(ticket);
        setIsViewTicketModalOpen(true);
    };

    const handleBackToProfile = () => {
        setCurrentPage(Page.PROFILE);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Open': return 'bg-red-100 text-red-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 bg-neutral-light min-h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button 
                        variant="ghost" 
                        onClick={handleBackToProfile}
                        className="mr-3 p-2"
                        title="Back to Profile"
                    >
                        <Icon name="chevronLeft" className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-semibold text-neutral-darker">Support Tickets</h1>
                </div>
                <div className="text-sm text-neutral-dark">
                    {allSupportTickets.length} Total Tickets
                </div>
            </div>

            {allSupportTickets.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Icon name="ticket" className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
                    <h3 className="text-lg font-medium text-neutral-darker mb-2">No Support Tickets</h3>
                    <p className="text-neutral-dark">
                        You haven't created any support tickets yet. You can create tickets from your order history.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-DEFAULT">
                            <thead className="bg-neutral-light">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Ticket ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Created Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Issues
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-light">
                                {allSupportTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-neutral-lightest">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darker">
                                            #{ticket.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-darker">
                                            <button
                                                onClick={() => {
                                                    // Find the order and navigate to order history
                                                    const order = orders.find(o => o.id === ticket.orderId);
                                                    if (order) {
                                                        setIsViewingPastOrder(true);
                                                        setOrderToView(order);
                                                        setCurrentPage(Page.ORDER_CONFIRMATION);
                                                    }
                                                }}
                                                className="text-primary hover:text-primary-dark underline"
                                            >
                                                #{ticket.orderId}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-darker">
                                            {formatDate(ticket.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-darker">
                                            {ticket.issues.length} issue{ticket.issues.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewTicket(ticket)}
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                <Icon name="eye" className="w-4 h-4 mr-1" />
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Admin Support Tickets Page
const renderAdminSupportTicketsPage = () => {
    const handleViewTicket = (ticket: SupportTicket) => {
        setTicketToView(ticket);
        setIsViewTicketModalOpen(true);
    };

    const handleViewIssue = (issue: TicketIssue & {
        ticketId: string;
        orderId: string;
        ticketCreatedAt: string;
        ticketStatus: string;
    }) => {
        setIssueToView(issue);
        setIsViewIssueModalOpen(true);
    };

    const handleCloseViewIssueModal = () => {
        setIsViewIssueModalOpen(false);
        setIssueToView(null);
    };

    const handleBackToDashboard = () => {
        setAdminCurrentPage(Page.ADMIN_DASHBOARD);
    };

    const handleUpdateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
        setAllSupportTickets(prev => 
            prev.map(ticket => 
                ticket.id === ticketId 
                    ? { ...ticket, status: newStatus }
                    : ticket
            )
        );
        showToast(`Ticket #${ticketId} status updated to ${newStatus}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Open': return 'bg-red-100 text-red-800 border-red-200';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusOptions = (currentStatus: SupportTicket['status']) => {
        const allStatuses: SupportTicket['status'][] = ['Open', 'In Progress', 'Resolved', 'Closed'];
        return allStatuses.filter(status => status !== currentStatus);
    };

    // Flatten tickets to show one issue per row
    const flattenedIssues = allSupportTickets.flatMap(ticket => 
        ticket.issues.map(issue => ({
            ...issue,
            ticketId: ticket.id,
            ticketStatus: ticket.status,
            ticketCreatedAt: ticket.createdAt,
            orderId: ticket.orderId,
            fullTicket: ticket
        }))
    );

    const openIssuesCount = flattenedIssues.filter(issue => issue.ticketStatus === 'Open').length;
    const inProgressIssuesCount = flattenedIssues.filter(issue => issue.ticketStatus === 'In Progress').length;
    const resolvedIssuesCount = flattenedIssues.filter(issue => issue.ticketStatus === 'Resolved').length;
    const closedIssuesCount = flattenedIssues.filter(issue => issue.ticketStatus === 'Closed').length;

    return (
        <div className="p-4 bg-neutral-light min-h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button 
                        variant="ghost" 
                        onClick={handleBackToDashboard}
                        className="mr-3 p-2"
                        title="Back to Dashboard"
                    >
                        <Icon name="chevronLeft" className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-semibold text-neutral-darker">Admin Support Tickets</h1>
                </div>
                <div className="text-sm text-neutral-dark">
                    {flattenedIssues.length} Total Issues ({allSupportTickets.length} Tickets)
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full">
                            <Icon name="ticket" className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-neutral-dark">Open</p>
                            <p className="text-xl font-bold text-neutral-darker">{openIssuesCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-full">
                            <Icon name="refreshCcw" className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-neutral-dark">In Progress</p>
                            <p className="text-xl font-bold text-neutral-darker">{inProgressIssuesCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Icon name="checkCircle" className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-neutral-dark">Resolved</p>
                            <p className="text-xl font-bold text-neutral-darker">{resolvedIssuesCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
                    <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full">
                            <Icon name="xCircle" className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-neutral-dark">Closed</p>
                            <p className="text-xl font-bold text-neutral-darker">{closedIssuesCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {flattenedIssues.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Icon name="ticket" className="w-16 h-16 mx-auto mb-4 text-neutral-light" />
                    <h3 className="text-lg font-medium text-neutral-darker mb-2">No Support Issues</h3>
                    <p className="text-neutral-dark">
                        No support issues have been reported yet. Customers can create tickets from their order history.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-DEFAULT">
                            <thead className="bg-neutral-light">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Issue Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Issue Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Created Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-light">
                                {flattenedIssues.map((issue, index) => {
                                    const relatedOrder = orders.find(order => order.id === issue.orderId);
                                    
                                    // Helper function to get issue details
                                    const getIssueDetails = (issue: any) => {
                                        switch(issue.issueType) {
                                            case 'Order Delay':
                                                return issue.issueDescription || 'Order delivery delayed';
                                            case 'Missing Item':
                                                return `Missing ${issue.relatedProductIds?.length || 0} item(s)`;
                                            case 'Incorrect item':
                                                return `Wrong item(s) received`;
                                            case 'Incorrect quantity':
                                                return `Expected ${issue.quantityInOrder}, received ${issue.quantityReceived}`;
                                            case 'Damaged item':
                                                return `Damaged item(s) received`;
                                            default:
                                                return issue.issueType;
                                        }
                                    };

                                    return (
                                        <tr key={`${issue.ticketId}-${issue.id}-${index}`} className="hover:bg-neutral-lightest">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-darker">
                                                <button
                                                    onClick={() => {
                                                        if (relatedOrder) {
                                                            setOrderToView(relatedOrder);
                                                            setAdminCurrentPage(Page.ADMIN_VIEW_ORDER_PDF);
                                                        }
                                                    }}
                                                    className="text-primary hover:text-primary-dark underline"
                                                >
                                                    #{issue.orderId}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-darker">
                                                <span className="font-medium">{issue.issueType}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-neutral-darker max-w-xs truncate">
                                                {getIssueDetails(issue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-darker">
                                                {formatDate(issue.ticketCreatedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(issue.ticketStatus)}`}>
                                                        {issue.ticketStatus}
                                                    </span>
                                                    <select
                                                        value={issue.ticketStatus}
                                                        onChange={(e) => handleUpdateTicketStatus(issue.ticketId, e.target.value as SupportTicket['status'])}
                                                        className="text-xs border border-neutral-DEFAULT rounded px-2 py-1 bg-white"
                                                    >
                                                        <option value={issue.ticketStatus}>{issue.ticketStatus}</option>
                                                        {getStatusOptions(issue.ticketStatus).map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewIssue(issue)}
                                                        className="text-primary hover:text-primary-dark"
                                                    >
                                                        <Icon name="eye" className="w-4 h-4 mr-1" />
                                                        View Issue
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Admin Product Catalog Page
const renderAdminProductCatalogPage = () => {
  const handleSelectProduct = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      setAdminSelectedProductIds(prev => [...prev, productId]);
    } else {
      setAdminSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAllProducts = (isSelected: boolean) => {
    if (isSelected) {
      setAdminSelectedProductIds(products.map(p => p.id));
    } else {
      setAdminSelectedProductIds([]);
    }
  };

  const handleOpenAddProductModal = () => {
    setNewProductForm({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      uom: '',
      vendor: '',
      costPrice: 0,
      retailPrice: 0,
      minimartPrice: 0,
      wholesalePrice: 0,
      shopCat1Price: 0,
      shopCat3Price: 0,
      attachedImageFile: null,
    });
    setAddProductCurrentStep(1);
    setIsAddProductModalOpen(true);
  };

  // Price validation function
  const validatePriceHierarchy = (prices: {
    costPrice?: number;
    shopCat1Price?: number;
    shopCat2Price?: number;
    shopCat3Price?: number;
    wholesalePrice?: number;
    minimartPrice?: number;
    retailPrice?: number;
  }): { isValid: boolean; errorMessage?: string } => {
    const {
      costPrice = 0,
      shopCat1Price = 0,
      shopCat2Price = 0,
      shopCat3Price = 0,
      wholesalePrice = 0,
      minimartPrice = 0,
      retailPrice = 0
    } = prices;

    // Skip validation if all prices are 0 (except shop cat 2 which is required)
    const nonZeroPrices = [costPrice, shopCat1Price, shopCat3Price, wholesalePrice, minimartPrice, retailPrice].filter(p => p > 0);
    if (nonZeroPrices.length === 0) {
      return { isValid: true };
    }

    // Check hierarchy: Cost Price < Shop Cat 1 Price < Shop Cat 2 Price < Shop Cat 3 Price < Wholesale Price < Minimart Price < Retail Price
    if (costPrice > 0 && shopCat1Price > 0 && costPrice >= shopCat1Price) {
      return { isValid: false, errorMessage: 'Cost Price must be less than Shop Cat 1 Price' };
    }
    if (shopCat1Price > 0 && shopCat2Price > 0 && shopCat1Price >= shopCat2Price) {
      return { isValid: false, errorMessage: 'Shop Cat 1 Price must be less than Shop Cat 2 Price' };
    }
    if (shopCat2Price > 0 && shopCat3Price > 0 && shopCat2Price >= shopCat3Price) {
      return { isValid: false, errorMessage: 'Shop Cat 2 Price must be less than Shop Cat 3 Price' };
    }
    if (shopCat3Price > 0 && wholesalePrice > 0 && shopCat3Price >= wholesalePrice) {
      return { isValid: false, errorMessage: 'Shop Cat 3 Price must be less than Wholesale Price' };
    }
    if (wholesalePrice > 0 && minimartPrice > 0 && wholesalePrice >= minimartPrice) {
      return { isValid: false, errorMessage: 'Wholesale Price must be less than Minimart Price' };
    }
    if (minimartPrice > 0 && retailPrice > 0 && minimartPrice >= retailPrice) {
      return { isValid: false, errorMessage: 'Minimart Price must be less than Retail Price' };
    }

    return { isValid: true };
  };

  const handleSaveNewProduct = () => {
    console.log('handleSaveNewProduct called'); // Debug log
    console.log('Form data:', newProductForm); // Debug log
    
    // Basic validation
    if (!newProductForm.name || !newProductForm.uom || !newProductForm.category || !newProductForm.price) {
      console.log('Validation failed - missing required fields:', {
        name: !newProductForm.name,
        uom: !newProductForm.uom,
        category: !newProductForm.category,
        price: !newProductForm.price
      });
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Price hierarchy validation
    const priceValidation = validatePriceHierarchy({
      costPrice: newProductForm.costPrice,
      shopCat1Price: newProductForm.shopCat1Price,
      shopCat2Price: newProductForm.price, // Shop Cat 2 is stored as 'price'
      shopCat3Price: newProductForm.shopCat3Price,
      wholesalePrice: newProductForm.wholesalePrice,
      minimartPrice: newProductForm.minimartPrice,
      retailPrice: newProductForm.retailPrice
    });

    if (!priceValidation.isValid) {
      console.log('Price validation failed:', priceValidation.errorMessage);
      showToast(priceValidation.errorMessage || 'Invalid price hierarchy', 'error');
      return;
    }

    console.log('All validation passed, creating product...');

    // Generate a unique product ID
    const newProductId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new product object
    const newProduct: Product = {
      id: newProductId,
      name: newProductForm.name,
      description: newProductForm.description || '',
      price: newProductForm.price || 0,
      imageUrl: newProductForm.imageUrl || '',
      category: newProductForm.category || '',
      uom: newProductForm.uom || '',
      vendor: newProductForm.vendor || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF, // Set who added the product
      updatedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF, // Set who last updated
    };

    console.log('New product created:', newProduct);

    // Add to products array
    setProducts([...products, newProduct]);

    // Close modal and reset form
    setIsAddProductModalOpen(false);
    setAddProductCurrentStep(1);
    setNewProductForm({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      uom: '',
      vendor: '',
      costPrice: 0,
      retailPrice: 0,
      minimartPrice: 0,
      wholesalePrice: 0,
      shopCat1Price: 0,
      shopCat3Price: 0,
      attachedImageFile: null,
    });

    // Show success message
    showToast(`Product "${newProduct.name}" added successfully!`, 'success');
    console.log('Product saved successfully');
  };

  const handleOpenEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setNewProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      uom: product.uom,
      vendor: product.vendor || '',
      costPrice: 0, // These would need to be stored in the Product interface eventually
      retailPrice: 0,
      minimartPrice: 0,
      wholesalePrice: 0,
      shopCat1Price: 0,
      shopCat3Price: 0,
      attachedImageFile: null,
    });
    setAddProductCurrentStep(1);
    setIsEditProductModalOpen(true);
  };

  const handleSaveEditProduct = () => {
    if (!editingProduct) return;

    // Basic validation
    if (!newProductForm.name || !newProductForm.uom || !newProductForm.category || !newProductForm.price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Price hierarchy validation
    const priceValidation = validatePriceHierarchy({
      costPrice: newProductForm.costPrice,
      shopCat1Price: newProductForm.shopCat1Price,
      shopCat2Price: newProductForm.price, // Shop Cat 2 is stored as 'price'
      shopCat3Price: newProductForm.shopCat3Price,
      wholesalePrice: newProductForm.wholesalePrice,
      minimartPrice: newProductForm.minimartPrice,
      retailPrice: newProductForm.retailPrice
    });

    if (!priceValidation.isValid) {
      showToast(priceValidation.errorMessage || 'Invalid price hierarchy', 'error');
      return;
    }

    // Update the product
    const updatedProduct: Product = {
      ...editingProduct,
      name: newProductForm.name,
      description: newProductForm.description || '',
      price: newProductForm.price || 0,
      imageUrl: newProductForm.imageUrl || '',
      category: newProductForm.category || '',
      uom: newProductForm.uom || '',
      vendor: newProductForm.vendor || '',
      updatedAt: new Date().toISOString(),
      updatedBy: DEFAULT_LOGGED_IN_ADMIN_STAFF, // Set who updated the product
    };

    // Update products array
    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));

    // Close modal and reset form
    setIsEditProductModalOpen(false);
    setAddProductCurrentStep(1);
    setEditingProduct(null);
    setNewProductForm({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      uom: '',
      vendor: '',
      costPrice: 0,
      retailPrice: 0,
      minimartPrice: 0,
      wholesalePrice: 0,
      shopCat1Price: 0,
      shopCat3Price: 0,
      attachedImageFile: null,
    });

    // Show success message
    showToast(`Product "${updatedProduct.name}" updated successfully!`, 'success');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const columnsToRender = ALL_ADMIN_PRODUCT_TABLE_COLUMNS.filter(col => 
    visibleAdminProductColumns.includes(col.id)
  );

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-darker">Product Catalog Management</h1>
        <p className="text-neutral-dark mt-1">Manage products, prices, and inventory details</p>
      </div>

      {/* Controls Bar */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-neutral-light">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleOpenAddProductModal}
              leftIcon={<Icon name="plus" className="w-4 h-4" />}
            >
              Add Product
            </Button>
            
            {adminSelectedProductIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-dark">
                  {adminSelectedProductIds.length} selected
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Icon name="edit" className="w-4 h-4" />}
                >
                  Bulk Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Icon name="trash" className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProductColumnSelectModalOpen(true)}
              leftIcon={<Icon name="columns" className="w-4 h-4" />}
            >
              Columns
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-neutral-dark">
          <span>Total Products: <span className="font-semibold text-neutral-darker">{products.length}</span></span>
          <span>Categories: <span className="font-semibold text-neutral-darker">{new Set(products.map(p => p.category)).size}</span></span>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-DEFAULT">
          <thead className="bg-neutral-light">
            <tr>
              {columnsToRender.map((colConfig, index) => (
                <th 
                  key={colConfig.id}
                  scope="col"
                  className={`px-3 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider ${
                    index <= 2 ? 'sticky bg-neutral-light' : ''
                  }`}
                  style={{ 
                    minWidth: colConfig.minWidth,
                    left: index === 0 ? 0 : index === 1 ? '50px' : index === 2 ? '130px' : 'auto',
                    zIndex: index <= 2 ? 10 : 1
                  }}
                >
                  {colConfig.id === 'select' ? (
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light"
                      checked={products.length > 0 && adminSelectedProductIds.length === products.length}
                      onChange={(e) => handleSelectAllProducts(e.target.checked)}
                      aria-label="Select all products"
                    />
                  ) : (
                    colConfig.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-light">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-neutral-lightest transition-colors duration-150">
                {columnsToRender.map((colConfig, index) => {
                  let cellValue: any;
                  switch(colConfig.id) {
                    case 'productName': cellValue = product.name; break;
                    case 'uom': cellValue = product.uom; break;
                    case 'vendor': cellValue = product.vendor || 'N/A'; break;
                    case 'costPrice': cellValue = ''; break; // Leave blank for now
                    case 'retailPrice': cellValue = ''; break; // Leave blank for now
                    case 'minimartPrice': cellValue = ''; break; // Leave blank for now
                    case 'wholesalePrice': cellValue = ''; break; // Leave blank for now
                    case 'shopCat3Price': cellValue = ''; break; // Leave blank for now
                    case 'shopCat2Price': cellValue = `$${product.price.toFixed(2)}`; break; // Use existing price
                    case 'shopCat1Price': cellValue = ''; break; // Leave blank for now
                    case 'category': cellValue = product.category; break;
                    case 'createdAt': cellValue = formatDate(product.createdAt); break;
                    case 'addedBy': cellValue = product.addedBy || 'N/A'; break;
                    case 'updatedAt': cellValue = formatDate(product.updatedAt); break;
                    case 'updatedBy': cellValue = product.updatedBy || 'N/A'; break;
                    default: cellValue = null;
                  }

                  return (
                    <td 
                      key={`${product.id}-${colConfig.id}`}
                      className={`px-3 py-4 whitespace-nowrap text-sm ${
                        index <= 2 ? 'sticky bg-white' : ''
                      }`}
                      style={{ 
                        minWidth: colConfig.minWidth,
                        left: index === 0 ? 0 : index === 1 ? '50px' : index === 2 ? '130px' : 'auto',
                        zIndex: index <= 2 ? 10 : 1
                      }}
                    >
                      {(() => {
                        switch(colConfig.id) {
                          case 'select':
                            return (
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light"
                                checked={adminSelectedProductIds.includes(product.id)}
                                onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                                aria-label={`Select product ${product.name}`}
                              />
                            );
                          case 'productImage':
                            return (
                              <div className="flex items-center">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-md object-cover border border-neutral-light"
                                />
                              </div>
                            );
                          case 'productName':
                            return (
                              <div className="flex items-center">
                                <div>
                                  <div className="font-medium text-neutral-darker">{product.name}</div>
                                  <div className="text-xs text-neutral-dark truncate max-w-xs">{product.description}</div>
                                </div>
                              </div>
                            );
                          case 'actions':
                            return (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditProductModal(product)}
                                  className="p-1.5"
                                  title="Edit Product"
                                >
                                  <Icon name="edit" className="w-4 h-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1.5"
                                  title="Delete Product"
                                >
                                  <Icon name="trash" className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            );
                          default:
                            return <span className="text-neutral-darker">{cellValue}</span>;
                        }
                      })()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Icon name="package" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-darker mb-2">No Products Found</h3>
            <p className="text-neutral-dark mb-4">Get started by adding your first product to the catalog.</p>
            <Button
              variant="primary"
              onClick={handleOpenAddProductModal}
              leftIcon={<Icon name="plus" className="w-4 h-4" />}
            >
              Add First Product
            </Button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title={`Add New Product - Step ${addProductCurrentStep} of ${productModalSteps.length}`}
        size="lg"
        footer={
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {addProductCurrentStep > 1 && (
                <Button variant="ghost" onClick={handleAddProductPrevStep}>
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsAddProductModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
            {addProductCurrentStep < productModalSteps.length ? (
              <Button
                variant="primary"
                onClick={handleAddProductNextStep}
                disabled={
                  addProductCurrentStep === 1 && 
                  (!newProductForm.name || !newProductForm.uom || !newProductForm.category)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSaveNewProduct}
                disabled={!newProductForm.name || !newProductForm.uom || !newProductForm.category || !newProductForm.price}
              >
                Add Product
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step Title and Progress */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-darker mb-1">
              {productModalSteps[addProductCurrentStep - 1]?.title}
            </h3>
            <p className="text-sm text-neutral-dark mb-2">
              Step {addProductCurrentStep} of {productModalSteps.length}
            </p>
            <p className="text-xs text-neutral-dark mb-3">
              {productModalSteps[addProductCurrentStep - 1]?.description}
            </p>
            
            <div className="w-full bg-neutral-light rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(addProductCurrentStep / productModalSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Product Information */}
          {addProductCurrentStep === 1 && (
            <div className="space-y-4">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setNewProductForm({
                        ...newProductForm, 
                        attachedImageFile: file,
                        imageUrl: imageUrl
                      });
                    }
                  }}
                />
                {newProductForm.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={newProductForm.imageUrl} 
                      alt="Product preview" 
                      className="w-20 h-20 object-cover rounded-md border border-neutral-light"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Product Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newProductForm.name || ''}
                  onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newProductForm.description || ''}
                  onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {/* UOM and Vendor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Unit of Measure (UOM) *</label>
                  <select
                    className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.uom || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, uom: e.target.value})}
                    required
                  >
                    <option value="">Select UOM</option>
                    <option value="125g">125g</option>
                    <option value="250g">250g</option>
                    <option value="500g">500g</option>
                    <option value="1kg">1kg</option>
                    <option value="600mL">600mL</option>
                    <option value="1L">1L</option>
                    <option value="25kg">25kg</option>
                    <option value="30kg">30kg</option>
                    <option value="pcs">pcs</option>
                    <option value="boxes">boxes</option>
                    <option value="bags">bags</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Vendor</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.vendor || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, vendor: e.target.value})}
                    placeholder="Enter vendor name"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Category *</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newProductForm.category || ''}
                  onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Rice">Rice</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Spices">Spices</option>
                  <option value="Oil">Oil</option>
                  <option value="Flour">Flour</option>
                  <option value="Dry Fruits">Dry Fruits</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Canned Goods">Canned Goods</option>
                  <option value="Condiments">Condiments</option>
                  <option value="Sweets">Sweets</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Household">Household</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {addProductCurrentStep === 2 && (
            <div className="space-y-4">
              {/* Cost Price */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.costPrice || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, costPrice: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Default Price (Shop Cat 2) */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Shop Cat 2 Price *</label>
                <p className="text-xs text-neutral-dark mb-2">Default Price unless specified in User Management</p>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.price || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Remaining Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.retailPrice || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, retailPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Minimart Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.minimartPrice || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, minimartPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Wholesale Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.wholesalePrice || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, wholesalePrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Shop Cat 3 Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.shopCat3Price || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, shopCat3Price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Shop Cat 1 Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.shopCat1Price || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, shopCat1Price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}


        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        title={`Edit Product - Step ${addProductCurrentStep} of ${productModalSteps.length}`}
        size="lg"
        footer={
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {addProductCurrentStep > 1 && (
                <Button variant="ghost" onClick={handleAddProductPrevStep}>
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsEditProductModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
            {addProductCurrentStep < productModalSteps.length ? (
              <Button
                variant="primary"
                onClick={handleAddProductNextStep}
                disabled={
                  addProductCurrentStep === 1 && 
                  (!newProductForm.name || !newProductForm.uom || !newProductForm.category)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSaveEditProduct}
                disabled={!newProductForm.name || !newProductForm.uom || !newProductForm.category || !newProductForm.price}
              >
                Update Product
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step Title and Progress */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-darker mb-1">
              {productModalSteps[addProductCurrentStep - 1]?.title}
            </h3>
            <p className="text-sm text-neutral-dark mb-2">
              Step {addProductCurrentStep} of {productModalSteps.length}
            </p>
            <p className="text-xs text-neutral-dark mb-3">
              {productModalSteps[addProductCurrentStep - 1]?.description}
            </p>
            
            <div className="w-full bg-neutral-light rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(addProductCurrentStep / productModalSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Product Information */}
          {addProductCurrentStep === 1 && (
            <div className="space-y-4">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setNewProductForm({
                        ...newProductForm, 
                        attachedImageFile: file,
                        imageUrl: imageUrl
                      });
                    }
                  }}
                />
                {newProductForm.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={newProductForm.imageUrl} 
                      alt="Product preview" 
                      className="w-20 h-20 object-cover rounded-md border border-neutral-light"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Product Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newProductForm.name || ''}
                  onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newProductForm.description || ''}
                  onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {/* UOM and Vendor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Unit of Measure (UOM) *</label>
                  <select
                    className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.uom || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, uom: e.target.value})}
                    required
                  >
                    <option value="">Select UOM</option>
                    <option value="125g">125g</option>
                    <option value="250g">250g</option>
                    <option value="500g">500g</option>
                    <option value="1kg">1kg</option>
                    <option value="600mL">600mL</option>
                    <option value="1L">1L</option>
                    <option value="25kg">25kg</option>
                    <option value="30kg">30kg</option>
                    <option value="pcs">pcs</option>
                    <option value="boxes">boxes</option>
                    <option value="bags">bags</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Vendor</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.vendor || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, vendor: e.target.value})}
                    placeholder="Enter vendor name"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Category *</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newProductForm.category || ''}
                  onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Rice">Rice</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Spices">Spices</option>
                  <option value="Oil">Oil</option>
                  <option value="Flour">Flour</option>
                  <option value="Dry Fruits">Dry Fruits</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Canned Goods">Canned Goods</option>
                  <option value="Condiments">Condiments</option>
                  <option value="Sweets">Sweets</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Household">Household</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {addProductCurrentStep === 2 && (
            <div className="space-y-4">
              {/* Cost Price */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.costPrice || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, costPrice: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Default Price (Shop Cat 2) */}
              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Shop Cat 2 Price *</label>
                <p className="text-xs text-neutral-dark mb-2">Default Price unless specified in User Management</p>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.price || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Remaining Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.retailPrice || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, retailPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Minimart Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.minimartPrice || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, minimartPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Wholesale Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.wholesalePrice || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, wholesalePrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darker mb-1">Shop Cat 3 Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={newProductForm.shopCat3Price || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, shopCat3Price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-darker mb-1">Shop Cat 1 Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={newProductForm.shopCat1Price || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, shopCat1Price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}


        </div>
      </Modal>
    </div>
  );
};

const renderAdminDashboardPage = () => {
    return (
        <div className="p-4"> 
            <h1 className="text-2xl font-semibold text-neutral-darker mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    onClick={() => handleAdminNavigate(Page.ADMIN_ORDER_MANAGEMENT)}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center text-primary mb-3">
                        <Icon name="packageCheck" className="w-8 h-8 mr-3"/>
                        <h2 className="text-xl font-semibold">Order Management</h2>
                    </div>
                    <p className="text-neutral-dark">View, manage, and process customer orders.</p>
                    <p className="text-neutral-darker font-bold mt-2">{orders.length} Total Orders</p>
                </div>
                 <div 
                    onClick={() => handleAdminNavigate(Page.ADMIN_USER_MANAGEMENT)}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center text-primary mb-3">
                        <Icon name="user" className="w-8 h-8 mr-3"/>
                        <h2 className="text-xl font-semibold">User Management</h2>
                    </div>
                    <p className="text-neutral-dark">Manage user accounts and permissions.</p>
                </div>
                 <div 
                    onClick={() => handleAdminNavigate(Page.ADMIN_PRODUCT_CATALOG)}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center text-primary mb-3">
                        <Icon name="list" className="w-8 h-8 mr-3"/>
                        <h2 className="text-xl font-semibold">Product Catalog</h2>
                    </div>
                    <p className="text-neutral-dark">Manage product details and categories.</p>
                    <p className="text-neutral-darker font-bold mt-2">{products.length} Total Products</p>
                </div>
                 <div 
                     className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:bg-neutral-lightest transition-all duration-200"
                     onClick={() => handleAdminNavigate(Page.ADMIN_SUPPORT_TICKETS)}
                 >
                     <div className="flex items-center text-neutral-dark mb-3">
                        <Icon name="ticket" className="w-8 h-8 mr-3"/>
                        <h2 className="text-xl font-semibold">Support Tickets</h2>
                    </div>
                    <p className="text-neutral-dark">View and manage customer support tickets.</p>
                    <p className="text-neutral-darker font-bold mt-2">{allSupportTickets.length} Open Tickets</p>
                 </div>
            </div>
        </div>
    );
};

const AdminOrderTable: React.FC<{
    ordersToDisplay: Order[];
    groupTitle?: string;
    effectiveVisibleColumns: AdminOrderTableColumnId[];
    isUngroupedBilling?: boolean;
    isInternalBillingHold?: boolean;
}> = ({ ordersToDisplay, groupTitle, effectiveVisibleColumns, isUngroupedBilling = false, isInternalBillingHold = false }) => {
    const isAllInGroupSelected = ordersToDisplay.length > 0 && ordersToDisplay.every(o => adminSelectedOrderIds.includes(o.id));

    const columnsToRender = ALL_ADMIN_ORDER_TABLE_COLUMNS.filter(colConfig => effectiveVisibleColumns.includes(colConfig.id));

    return (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            {groupTitle && (
                <h2 className="text-lg font-semibold text-neutral-darker p-3 bg-neutral-lightest border-b border-neutral-DEFAULT">
                    {groupTitle} ({ordersToDisplay.length})
                </h2>
            )}
            <table className="min-w-full divide-y divide-neutral-DEFAULT">
                <thead className="bg-neutral-light">
                    <tr>
                        {columnsToRender.map(colConfig => (
                            <th 
                                key={colConfig.id} 
                                scope="col" 
                                className="px-1 py-1.5 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" 
                                style={{minWidth: colConfig.minWidth}}
                            >
                                {colConfig.id === 'select' ? (
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light"
                                        checked={isAllInGroupSelected}
                                        onChange={(e) => handleAdminSelectAllOrdersInGroup(e.target.checked, ordersToDisplay)}
                                        aria-label={`Select all orders in ${groupTitle || 'current view'}`}
                                    />
                                ) : (
                                    colConfig.label
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-light">
                    {ordersToDisplay.map(order => {
                        const modificationStatus = getModificationRequestStatus(order);
                        return (
                        <tr 
                            key={order.id} 
                            className={`
                                ${order.status === 'Billing in progress' ? 'bg-amber-100 hover:bg-amber-200' : 
                                  order.status === 'Billed in Insmart' ? 'bg-green-100 hover:bg-green-200' :
                                  adminSelectedOrderIds.includes(order.id) ? 'bg-primary-light bg-opacity-20' : ''} 
                                ${doesOrderExceedCreditLimit(order) && !modificationStatus ? 'border-2 border-red-500' : 
                                  doesOrderExceedCreditLimit(order) && modificationStatus ? `border-2 border-red-500 border-l-8 ${modificationStatus.borderColor}` :
                                  modificationStatus ? `border-l-8 ${modificationStatus.borderColor}` : ''}
                                hover:bg-neutral-lightest transition-colors duration-150
                            `}
                        >
                            {columnsToRender.map(colConfig => {
                                let cellValue: any;
                                switch(colConfig.id) {
                                    case 'orderId': cellValue = `#${order.id}`; break;
                                    case 'customerOrderDate': cellValue = order.orderDate; break;
                                    case 'customerInvoiceRequestDate': cellValue = order.invoiceDate || order.orderDate; break;
                                    case 'billedDate': cellValue = order.billedDate; break;
                                    case 'customer': cellValue = order.contactNumber?.split(' - ')[0] || 'N/A'; break;
                                    case 'shop': cellValue = order.shopLocation || 'N/A'; break;
                                    case 'total': cellValue = order.totalPrice; break;
                                    case 'status': cellValue = order.status; break;
                                    case 'billedInInsmartBy': cellValue = order.billedInInsmartBy; break;
                                    case 'shippingDate': cellValue = order.shippingDate; break;
                                    case 'packedBy': cellValue = order.packedBy || 'N/A'; break;
                                    case 'deliveredBy': cellValue = order.deliveredBy || 'N/A'; break;
                                    case 'customerType': cellValue = order.customerType || DEFAULT_CUSTOMER_TYPE; break;
                                    case 'shipmentRegion': cellValue = order.shopLocation === ShopLocations[0] ? 'Tuas' : order.shopLocation === ShopLocations[1] ? 'Boon Lay' : 'N/A'; break;
                                    case 'shipmentSchedule': cellValue = getShipmentSchedule(order) !== 99 ? String(getShipmentSchedule(order)) : 'N/A' ; break;
                                    default: cellValue = null;
                                }

                                const isAdvanceInvoiceDate = colConfig.id === 'customerInvoiceRequestDate' && order.invoiceDate && order.orderDate &&
                                                             new Date(order.invoiceDate).toDateString() !== new Date(order.orderDate).toDateString();
                                
                                const cellClasses = `px-1 py-1.5 whitespace-nowrap text-sm text-neutral-darker relative ${colConfig.isEditable && order.status !== 'Billing in progress' && order.status !== 'Billed in Insmart' ? 'cursor-pointer hover:bg-neutral-light' : ''} ${isAdvanceInvoiceDate ? 'text-red-500' : ''}`;


                                return (
                                    <td 
                                        key={`${order.id}-${colConfig.id}`} 
                                        className={cellClasses} 
                                        style={{minWidth: colConfig.minWidth}}
                                        onMouseDown={ (colConfig.isEditable && order.status !== 'Billing in progress' && order.status !== 'Billed in Insmart') ? (e) => handleCellMouseDown(e, order.id, colConfig.id, cellValue) : undefined}
                                        onMouseUp={ (colConfig.isEditable && order.status !== 'Billing in progress' && order.status !== 'Billed in Insmart') ? (e) => handleCellMouseUp(e, order.id, colConfig.id, cellValue) : undefined}
                                        data-order-id={order.id}
                                        data-column-id={colConfig.id}
                                    >
                                        {(() => {
                                            switch(colConfig.id) {
                                                case 'select':
                                                    return <input 
                                                                type="checkbox" 
                                                                className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light"
                                                                checked={adminSelectedOrderIds.includes(order.id)}
                                                                onChange={(e) => handleAdminSelectOrder(order.id, e.target.checked)}
                                                                aria-label={`Select order ${order.id}`}
                                                            />;
                                                case 'orderId': 
                                                    return (
                                                        <div className="flex items-center space-x-0.5">
                                                            <span>#{order.id}</span>
                                                            {modificationStatus && (
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center justify-center w-4 h-4 hover:bg-gray-100 rounded cursor-pointer"
                                                                    title={`${modificationStatus.totalCount} modification request${modificationStatus.totalCount > 1 ? 's' : ''} - ${
                                                                        modificationStatus.type === 'pending' ? `${modificationStatus.pendingCount} pending` :
                                                                        modificationStatus.type === 'processed' ? `${modificationStatus.processedCount} processed` :
                                                                        `${modificationStatus.pendingCount} pending, ${modificationStatus.processedCount} processed`
                                                                    } (Click to view details)`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCurrentAdminOrderManagementSubTab('Modification Requests');
                                                                    }}
                                                                >
                                                                    <Icon name="edit" className={`w-3 h-3 ${modificationStatus.iconColor}`}/>
                                                                </button>
                                                            )}
                                                            <span data-action-wrapper className="inline-flex items-center justify-center w-5 h-5">
                                                                <Button 
                                                                    data-action="view-pdf"
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="p-0.5" 
                                                                    title="View Order PDF"
                                                                    onClick={(e) => { e.stopPropagation(); handleViewOrderPdf(order); }}
                                                                >
                                                                    <Icon name="eye" className="w-3.5 h-3.5 text-primary"/>
                                                                </Button>
                                                            </span>
                                                            {currentAdminOrderManagementSubTab === 'To Bill in Insmart' && order.billedInInsmartBy && order.status === 'Order delegated for billing' && (
                                                                <span data-action-wrapper className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-neutral-400 hover:border-neutral-600 transition-colors">
                                                                    <Button
                                                                        data-action="start-billing"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="p-0.5 text-green-600 hover:text-green-700"
                                                                        title="Start Billing"
                                                                        onClick={(e) => {e.stopPropagation(); handleStartBilling(order.id);}}
                                                                    >
                                                                        <Icon name="play" className="w-3 h-3"/>
                                                                    </Button>
                                                                </span>
                                                            )}
                                                            {currentAdminOrderManagementSubTab === 'To Bill in Insmart' && order.billedInInsmartBy && order.status === 'Billing in progress' && (
                                                                 <span data-action-wrapper className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-neutral-400 hover:border-neutral-600 transition-colors">
                                                                    <Button
                                                                        data-action="complete-billing"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="p-0.5 text-blue-600 hover:text-blue-700"
                                                                        title="Complete Billing"
                                                                        onClick={(e) => {e.stopPropagation(); handleCompleteBilling(order.id);}}
                                                                    >
                                                                        <Icon name="check" className="w-3 h-3"/>
                                                                    </Button>
                                                                </span>
                                                            )}
                                                            {currentAdminOrderManagementSubTab === 'To Bill in Insmart' && order.billedInInsmartBy && order.status === 'Billing in progress' && (
                                                                 <span data-action-wrapper className="ml-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border border-neutral-400 hover:border-neutral-600 transition-colors">
                                                                    <Button
                                                                        data-action="cancel-billing"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="p-0.5 text-red-500 hover:text-red-600"
                                                                        title="Cancel Billing"
                                                                        onClick={(e) => {e.stopPropagation(); handleCancelBilling(order.id);}}
                                                                    >
                                                                        <Icon name="xCircle" className="w-3.5 h-3.5"/>
                                                                    </Button>
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                case 'customerOrderDate': 
                                                    return formatSimpleDate(order.orderDate);
                                                case 'customerInvoiceRequestDate':
                                                    return formatSimpleDate(order.invoiceDate || order.orderDate);
                                                case 'billedDate':
                                                    return order.billedDate ? formatSimpleDate(order.billedDate) : 'N/A';
                                                case 'customer': return <span title={order.contactNumber}>{order.contactNumber?.split(' - ')[0] || 'N/A'}</span>;
                                                case 'shop': return order.shopLocation || 'N/A';
                                                case 'total': 
                                                    const exceedsLimit = doesOrderExceedCreditLimit(order);
                                                    return (
                                                        <div className="flex items-center space-x-1">
                                                            <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                                                            {exceedsLimit && (
                                                                <button
                                                                    type="button"
                                                                    className="p-1 hover:bg-red-50 rounded"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        setCreditLimitModalOrder(order);
                                                                        setIsCreditLimitModalOpen(true);
                                                                    }}
                                                                    title="Order exceeds credit limit - click for details"
                                                                >
                                                                    <Icon 
                                                                        name="info" 
                                                                        className="w-5 h-5 text-red-500" 
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                case 'status': return order.status;
                                                case 'billedInInsmartBy': 
                                                    if (isUngroupedBilling && !order.billedInInsmartBy) { 
                                                        return (
                                                            <div className="flex items-center space-x-1">
                                                                <span>N/A</span>
                                                                <span data-action-wrapper className="inline-flex items-center justify-center w-5 h-5">
                                                                    <Button 
                                                                        data-action="quick-assign"
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="p-0.5 text-primary hover:text-primary-dark" 
                                                                        title={`Assign to ${DEFAULT_LOGGED_IN_ADMIN_STAFF}`}
                                                                        onClick={(e) => handleQuickAssignBiller(e, order.id)}
                                                                    >
                                                                        <Icon name="user" className="w-3.5 h-3.5"/>
                                                                    </Button>
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                    return order.billedInInsmartBy || 'N/A'; 
                                                case 'shippingDate': return order.shippingDate ? formatSimpleDate(order.shippingDate) : 'N/A';
                                                case 'packedBy': return order.packedBy || 'N/A';
                                                case 'deliveredBy': return order.deliveredBy || 'N/A';
                                                case 'customerType': return order.customerType || DEFAULT_CUSTOMER_TYPE;
                                                case 'shipmentRegion': return order.shopLocation === ShopLocations[0] ? 'Tuas' : order.shopLocation === ShopLocations[1] ? 'Boon Lay' : 'N/A';
                                                case 'shipmentSchedule': return getShipmentSchedule(order) !== 99 ? String(getShipmentSchedule(order)) : 'N/A';
                                                default: return null;
                                            }
                                        })()}
                                    </td>
                                )
                            })}
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const renderAdminOrderManagementPage = () => {
    let baseSortedOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    
    let toPickDate_ungroupedOrders: Order[] = [];
    let toPickDate_groupedOrdersByDate: Record<string, Order[]> = {};
    let toPickDate_sortedDateKeys: string[] = [];

    let toBillInsmart_ungroupedOrders: Order[] = [];
    let toBillInsmart_groupedOrdersByBiller: Record<string, Order[]> = {};
    let toBillInsmart_sortedBillerKeys: string[] = [];

    let ordersToDisplayInAllOrdersTab = baseSortedOrders; 

    let effectiveTableColumns = [...visibleAdminOrderColumns];
    if (currentAdminOrderManagementSubTab === 'To Pick Date') {
        if (effectiveTableColumns.includes('status')) { 
            effectiveTableColumns = effectiveTableColumns.filter(id => id !== 'status');
        }
        if (!effectiveTableColumns.includes('shippingDate')) { 
             const statusIndex = effectiveTableColumns.findIndex(id => id === 'total'); 
             if (statusIndex !== -1) {
                 effectiveTableColumns.splice(statusIndex + 1, 0, 'shippingDate');
             } else {
                 effectiveTableColumns.push('shippingDate');
             }
        }
    } else if (currentAdminOrderManagementSubTab === 'To Bill in Insmart') {
        if (!effectiveTableColumns.includes('status')) {
             const totalIndex = effectiveTableColumns.findIndex(id => id === 'total');
             if (totalIndex !== -1) {
                effectiveTableColumns.splice(totalIndex + 1, 0, 'status');
             } else {
                effectiveTableColumns.push('status');
             }
        }
    }
    // Ensure column order from ALL_ADMIN_ORDER_TABLE_COLUMNS is respected for visible columns
    effectiveTableColumns = ALL_ADMIN_ORDER_TABLE_COLUMNS
                                .filter(col => effectiveTableColumns.includes(col.id))
                                .map(col => col.id);


    let toPickDate_internalBillingHoldOrders: Order[] = [];

    if (currentAdminOrderManagementSubTab === 'To Pick Date') {
        const toPickDateOrders = baseSortedOrders.filter(order => order.status === 'To select date' || order.status === 'To pick person for billing in Insmart');
        
        // Separate orders with internal billing hold
        const ordersWithBillingHold = toPickDateOrders.filter(o => isOrderShopOnBillingHold(o));
        const ordersWithoutBillingHold = toPickDateOrders.filter(o => !isOrderShopOnBillingHold(o));
        
        toPickDate_internalBillingHoldOrders = ordersWithBillingHold;
        toPickDate_ungroupedOrders = ordersWithoutBillingHold.filter(o => !o.shippingDate);
        
        const ordersWithShippingDate = ordersWithoutBillingHold.filter(o => !!o.shippingDate);
        toPickDate_groupedOrdersByDate = ordersWithShippingDate.reduce((acc, order) => {
            const dateKey = order.shippingDate!; 
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(order);
            return acc;
        }, {} as Record<string, Order[]>);
        toPickDate_sortedDateKeys = Object.keys(toPickDate_groupedOrdersByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    } else if (currentAdminOrderManagementSubTab === 'To Bill in Insmart') {
        const toBillInsmartCandidateOrders = baseSortedOrders
            .filter(order => !!order.shippingDate && (
                order.status === 'To pick person for billing in Insmart' || 
                order.status === 'Order delegated for billing' || 
                order.status === 'Billing in progress' || 
                order.status === 'Billed in Insmart'
            ))
            .sort(billTabSortFn); 

        toBillInsmart_ungroupedOrders = toBillInsmartCandidateOrders.filter(o => !o.billedInInsmartBy).sort(billTabSortFn);

        const ordersWithBiller = toBillInsmartCandidateOrders.filter(o => !!o.billedInInsmartBy);
        toBillInsmart_groupedOrdersByBiller = ordersWithBiller.reduce((acc, order) => {
            const billerKey = order.billedInInsmartBy!;
            if (!acc[billerKey]) acc[billerKey] = [];
            acc[billerKey].push(order); 
            return acc;
        }, {} as Record<string, Order[]>);
        
         toBillInsmart_sortedBillerKeys = Object.keys(toBillInsmart_groupedOrdersByBiller).sort((a,b) => a.localeCompare(b));
         toBillInsmart_sortedBillerKeys.forEach(key => {
            toBillInsmart_groupedOrdersByBiller[key].sort(billTabSortFn);
         });
    }


    const handlePrintSelected = () => {
        let allCurrentlyDisplayedOrders: Order[] = [];
        if (currentAdminOrderManagementSubTab === 'To Pick Date') {
            allCurrentlyDisplayedOrders = [...toPickDate_internalBillingHoldOrders, ...toPickDate_ungroupedOrders, ...toPickDate_sortedDateKeys.flatMap(key => toPickDate_groupedOrdersByDate[key])];
        } else if (currentAdminOrderManagementSubTab === 'To Bill in Insmart') {
            allCurrentlyDisplayedOrders = [...toBillInsmart_ungroupedOrders, ...toBillInsmart_sortedBillerKeys.flatMap(key => toBillInsmart_groupedOrdersByBiller[key])];
        } else { 
            allCurrentlyDisplayedOrders = ordersToDisplayInAllOrdersTab;
        }
            
        const selectedOrdersToPrint = allCurrentlyDisplayedOrders.filter(o => adminSelectedOrderIds.includes(o.id));
        
        if (selectedOrdersToPrint.length > 0) {
            setOrdersToPrintAdminPdf(selectedOrdersToPrint);
            setAdminCurrentPage(Page.ADMIN_PRINT_ORDERS_PDF);
        } else {
            showToast("No orders selected to print.");
        }
    };
    
    return (
        <div className="p-4 text-neutral-darker">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <h1 className="text-2xl font-semibold">Order Management</h1>
                <div className="flex space-x-2 flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setIsColumnSelectModalOpen(true)}
                        leftIcon={<Icon name="columns" className="w-4 h-4"/>}
                        size="sm"
                        className="text-neutral-darker border border-neutral-DEFAULT"
                    >
                        Columns
                    </Button>
                    {adminSelectedOrderIds.length > 0 && (
                        <>
                            {currentAdminOrderManagementSubTab === 'To Pick Date' && (
                                <Button 
                                    variant="tertiary" 
                                    onClick={handleOpenQuickUpdateShippingDateModal}
                                    leftIcon={<Icon name="calendar" className="w-4 h-4"/>}
                                    size="sm"
                                >
                                    Quick Ship Date ({adminSelectedOrderIds.length})
                                </Button>
                            )}
                            {currentAdminOrderManagementSubTab === 'To Bill in Insmart' && (
                                <Button 
                                    variant="tertiary" 
                                    onClick={handleQuickAssignToMe}
                                    leftIcon={<Icon name="user" className="w-4 h-4"/>}
                                    size="sm"
                                >
                                    Quick Assign to Me ({adminSelectedOrderIds.length})
                                </Button>
                            )}
                            <Button 
                                variant="secondary" 
                                onClick={handleOpenUpdateOrdersModal}
                                leftIcon={<Icon name="edit" className="w-4 h-4"/>}
                                size="sm"
                            >
                                Update Order(s) ({adminSelectedOrderIds.length})
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handlePrintSelected}
                                leftIcon={<Icon name="printer" className="w-4 h-4"/>}
                                size="sm"
                            >
                                Print Selected ({adminSelectedOrderIds.length})
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex border-b border-neutral-DEFAULT">
                    {ADMIN_ORDER_MANAGEMENT_SUB_TABS.map(tab => {
                        let count = 0;
                        if (tab === 'To Pick Date') count = orders.filter(o => o.status === 'To select date' || o.status === 'To pick person for billing in Insmart').length;
                        else if (tab === 'To Bill in Insmart') count = orders.filter(o => !!o.shippingDate && (o.status === 'To pick person for billing in Insmart' || o.status === 'Order delegated for billing' || o.status === 'Billing in progress' || o.status === 'Billed in Insmart')).length;
                        else if (tab === 'Billed to Schedule') count = orders.filter(o => o.status === 'Billed in Insmart').length;
                        else if (tab === 'Schedule') count = 0; // Empty for now
                        else if (tab === 'Accounting related') {
                            count = orders.filter(order => {
                                // Find the shop's payment limit
                                const shop = organizations.flatMap(org => org.shops).find(s => s.name === order.shopLocation);
                                
                                if (!shop || !shop.paymentTerms) return false;
                                
                                // Check if payment terms includes "Amount Limit" (handles both "Amount Limit" and "Amount Limit: $15" formats)
                                const isAmountLimitShop = shop.paymentTerms.includes('Amount Limit');
                                if (!isAmountLimitShop) return false;
                                
                                // Extract amount limit from either amountLimit field or paymentTerms string
                                let limitAmount = 0;
                                if (shop.amountLimit) {
                                    limitAmount = parseFloat(shop.amountLimit.toString());
                                } else if (shop.paymentTerms.startsWith('Amount Limit: $')) {
                                    limitAmount = parseFloat(shop.paymentTerms.replace('Amount Limit: $', ''));
                                }
                                
                                return limitAmount > 0 && order.totalPrice >= limitAmount;
                            }).length;
                        }
        else if (tab === 'Modification Requests') count = orders.filter(hasAnyModificationRequests).length;
                        else if (tab === 'All Orders') count = orders.length;


                        return (
                        <button
                            key={tab}
                            onClick={() => setCurrentAdminOrderManagementSubTab(tab)}
                            className={`px-4 py-2 text-sm font-medium focus:outline-none
                                ${currentAdminOrderManagementSubTab === tab 
                                    ? 'border-b-2 border-primary text-primary' 
                                    : 'text-neutral-dark hover:text-primary-light hover:border-primary-light'
                                }`}
                            aria-current={currentAdminOrderManagementSubTab === tab ? 'page' : undefined}
                        >
                            {tab} {count > 0 && `(${count})`}
                        </button>
                    )}
                    )}
                </div>
            </div>

            {currentAdminOrderManagementSubTab === 'All Orders' && (
                ordersToDisplayInAllOrdersTab.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <Icon name="packageCheck" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                        <p className="text-neutral-dark text-xl">No orders found.</p>
                    </div>
                ) : (
                    <AdminOrderTable ordersToDisplay={ordersToDisplayInAllOrdersTab} effectiveVisibleColumns={effectiveTableColumns} />
                )
            )}

            {currentAdminOrderManagementSubTab === 'To Pick Date' && (
                <>
                    {toPickDate_internalBillingHoldOrders.length === 0 && toPickDate_ungroupedOrders.length === 0 && toPickDate_sortedDateKeys.length === 0 ? (
                         <div className="text-center py-10 bg-white rounded-lg shadow">
                            <Icon name="packageCheck" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                            <p className="text-neutral-dark text-xl">No orders require date selection.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {toPickDate_internalBillingHoldOrders.length > 0 && (
                                <AdminOrderTable ordersToDisplay={toPickDate_internalBillingHoldOrders} groupTitle="Internal Billing Hold" effectiveVisibleColumns={effectiveTableColumns} isInternalBillingHold={true} />
                            )}
                            {toPickDate_ungroupedOrders.length > 0 && (
                                <AdminOrderTable ordersToDisplay={toPickDate_ungroupedOrders} groupTitle="Ungrouped Orders" effectiveVisibleColumns={effectiveTableColumns} />
                            )}
                            {toPickDate_sortedDateKeys.map(dateKey => (
                                <AdminOrderTable 
                                    key={dateKey} 
                                    ordersToDisplay={toPickDate_groupedOrdersByDate[dateKey]} 
                                    groupTitle={`Shipping Date: ${formatSimpleDate(dateKey)}`} 
                                    effectiveVisibleColumns={effectiveTableColumns}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

             {currentAdminOrderManagementSubTab === 'To Bill in Insmart' && (
                <>
                    {toBillInsmart_ungroupedOrders.length === 0 && toBillInsmart_sortedBillerKeys.length === 0 ? (
                         <div className="text-center py-10 bg-white rounded-lg shadow">
                            <Icon name="packageCheck" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                            <p className="text-neutral-dark text-xl">No orders ready for Insmart billing assignment.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {toBillInsmart_ungroupedOrders.length > 0 && (
                                <AdminOrderTable ordersToDisplay={toBillInsmart_ungroupedOrders} groupTitle="Ungrouped (Awaiting Biller Assignment)" effectiveVisibleColumns={effectiveTableColumns} isUngroupedBilling={true}/>
                            )}
                            {toBillInsmart_sortedBillerKeys.map(billerKey => (
                                <AdminOrderTable 
                                    key={billerKey} 
                                    ordersToDisplay={toBillInsmart_groupedOrdersByBiller[billerKey]} 
                                    groupTitle={`Billed by: ${billerKey}`} 
                                    effectiveVisibleColumns={effectiveTableColumns}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {currentAdminOrderManagementSubTab === 'Billed to Schedule' && (() => {
                // Get all orders with "Billed in Insmart" status
                const billedOrders = orders.filter(order => order.status === 'Billed in Insmart');
                
                // Define major sections and their shipment regions
                const majorSections = {
                    'North': ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty'],
                    'North East': ['Punggol', 'Sengkang', 'Hougang', 'Ang Mo Kio'],
                    'North West': ['Jurong East', 'Bukit Batok', 'Chua Chu Kang'],
                    'Tuas': ['Tuas', 'Tuas West', 'Tuas South', 'Tuas Link'],
                    'Central': ['Orchard', 'Newton', 'Bishan', 'Toa Payoh', 'Novena'],
                    'South East': ['Bukit Timah', 'Holland', 'Clementi'],
                    'East': ['Tampines', 'Pasir Ris', 'Bedok', 'Simei', 'Jurong East', 'Taman Jurong', 'Boon Lay', 'Pioneer'],
                    'Changi': ['Changi', 'Changi Village', 'Changi Airport', 'Expo'],
                    'Tekka': ['Little India', 'Tekka', 'Rochor']
                };
                
                // Helper function to get major section and specific region for an order
                const getOrderLocation = (order: Order): { section: string; region: string } => {
                    const location = order.shopLocation || '';
                    
                    // Check specific locations first
                    if (location === ShopLocations[0] || location.includes('Tuas')) {
                        return { section: 'Tuas', region: 'Tuas' };
                    }
                    if (location === ShopLocations[1] || location.includes('Boon Lay')) {
                        return { section: 'East', region: 'Boon Lay' };
                    }
                    
                    // Check each major section
                    for (const [section, regions] of Object.entries(majorSections)) {
                        for (const region of regions) {
                            if (location.includes(region)) {
                                return { section, region };
                            }
                        }
                    }
                    
                    // Check for other common Singapore locations with specific mappings
                    if (location.includes('Jurong East')) return { section: 'North West', region: 'Jurong East' };
                    if (location.includes('Jurong')) return { section: 'East', region: 'Taman Jurong' };
                    if (location.includes('Clementi')) return { section: 'South East', region: 'Clementi' };
                    if (location.includes('Bukit Timah')) return { section: 'South East', region: 'Bukit Timah' };
                    if (location.includes('Holland')) return { section: 'South East', region: 'Holland' };
                    if (location.includes('Pioneer')) return { section: 'East', region: 'Pioneer' };
                    if (location.includes('Bukit Batok')) return { section: 'North West', region: 'Bukit Batok' };
                    if (location.includes('Chua Chu Kang')) return { section: 'North West', region: 'Chua Chu Kang' };
                    
                    return { section: 'Central', region: 'Others' };
                };
                
                // Group orders by major section and then by region
                const ordersBySection: Record<string, Record<string, Order[]>> = {};
                
                // Initialize all sections and regions with empty arrays
                Object.entries(majorSections).forEach(([sectionName, regions]) => {
                    ordersBySection[sectionName] = {};
                    regions.forEach(region => {
                        ordersBySection[sectionName][region] = [];
                    });
                });
                
                // Add orders to their respective sections and regions
                billedOrders.forEach(order => {
                    const { section, region } = getOrderLocation(order);
                    if (!ordersBySection[section]) ordersBySection[section] = {};
                    if (!ordersBySection[section][region]) ordersBySection[section][region] = [];
                    ordersBySection[section][region].push(order);
                });
                
                return (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold text-neutral-darker">Shipment Schedule Board</h2>
                                {adminSelectedOrderIds.length > 0 && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleOpenDriverAssignmentModal}
                                        leftIcon={<Icon name="truck" className="w-4 h-4" />}
                                    >
                                        Assign Driver ({adminSelectedOrderIds.length})
                                    </Button>
                                )}
                            </div>
                            <div className="text-sm text-neutral-dark bg-neutral-lightest rounded-md">
                                <button
                                    onClick={() => setIsSelectionControlsOpen(!isSelectionControlsOpen)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-neutral-light transition-colors"
                                >
                                    <span className="font-medium">Selection Controls</span>
                                    <Icon 
                                        name={isSelectionControlsOpen ? "chevronUp" : "chevronDown"} 
                                        className="w-4 h-4" 
                                    />
                                </button>
                                {isSelectionControlsOpen && (
                                    <div className="px-3 pb-3">
                                        <ul className="text-xs space-y-1">
                                            <li>• <strong>Arrow Keys:</strong> Navigate between cards</li>
                                            <li>• <strong>Shift + Arrow Keys:</strong> Select range (like Excel)</li>
                                            <li>• <strong>Click:</strong> Select single card</li>
                                            <li>• <strong>Column Headers:</strong> Select all orders in a region</li>
                                            <li>• <strong>Van Icon:</strong> Assign driver to individual order</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {billedOrders.length === 0 && (
                            <div className="text-center py-6 mb-6 bg-neutral-lightest rounded-lg">
                                <Icon name="truck" className="w-12 h-12 text-neutral-DEFAULT mx-auto mb-2"/>
                                <p className="text-neutral-dark">No orders ready for shipping.</p>
                            </div>
                        )}
                        
                        {/* Major Sections */}
                        <div className="space-y-6">
                            {Object.entries(majorSections).map(([sectionName, sectionRegions]) => {
                                const sectionOrdersByRegion = ordersBySection[sectionName] || {};
                                const allSectionOrders = Object.values(sectionOrdersByRegion).flat();
                                
                                // Show all sections regardless of whether they have orders
                                
                                return (
                                    <div key={sectionName} className="border border-neutral-DEFAULT rounded-lg overflow-hidden">
                                        {/* Section Header */}
                                        <div className="bg-primary text-white p-3 border-b border-neutral-DEFAULT">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold">{sectionName}</h3>
                                                <span className="bg-white text-primary px-2 py-1 rounded text-sm font-medium">
                                                    {allSectionOrders.length} orders
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Region Headers */}
                                        <div className="bg-neutral-lightest border-b border-neutral-DEFAULT">
                                            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${Math.max(1, sectionRegions.length)}, 1fr)` }}>
                                                {sectionRegions.map(region => {
                                                    const regionOrders = sectionOrdersByRegion[region] || [];
                                                    const allRegionOrdersSelected = regionOrders.length > 0 && regionOrders.every(order => adminSelectedOrderIds.includes(order.id));
                                                    const someRegionOrdersSelected = regionOrders.some(order => adminSelectedOrderIds.includes(order.id));
                                                    
                                                    return (
                                                        <div key={region} className="p-3 border-r border-neutral-DEFAULT last:border-r-0">
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={allRegionOrdersSelected}
                                                                    ref={el => {
                                                                        if (el) el.indeterminate = someRegionOrdersSelected && !allRegionOrdersSelected;
                                                                    }}
                                                                    onChange={(e) => handleColumnSelection(regionOrders, e.target.checked)}
                                                                    className="form-checkbox h-4 w-4 text-primary rounded"
                                                                    title={`Select all orders in ${region}`}
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-sm text-neutral-darker">{region}</div>
                                                                    <div className="text-xs text-neutral-DEFAULT">({regionOrders.length})</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        {/* Region Data Columns */}
                                        <div className="grid gap-0 max-h-80 overflow-y-auto" style={{ gridTemplateColumns: `repeat(${Math.max(1, sectionRegions.length)}, 1fr)` }}>
                                            {sectionRegions.map(region => {
                                                const regionOrders = sectionOrdersByRegion[region] || [];
                                                return (
                                                    <div key={region} className="border-r border-neutral-light last:border-r-0">
                                                        <div className="space-y-1 p-2">
                                                            {regionOrders.length === 0 ? (
                                                                <div className="text-center py-4 text-neutral-DEFAULT text-xs">
                                                                    No orders
                                                                </div>
                                                            ) : (
                                                                regionOrders.map(order => (
                                                                <div 
                                                                    key={order.id}
                                                                    className={`bg-white rounded-md p-2 shadow-sm border-2 transition-all cursor-pointer ${
                                                                        adminSelectedOrderIds.includes(order.id) 
                                                                            ? 'border-primary bg-blue-50 shadow-md' 
                                                                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                                                                    } ${
                                                                        focusedOrderId === order.id 
                                                                            ? 'ring-2 ring-primary ring-opacity-50' 
                                                                            : ''
                                                                    }`}
                                                                    onClick={() => handleOrderClick(order.id)}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="text-sm font-medium text-neutral-darker truncate flex-1">
                                                                            {order.shopLocation || 'Unknown Shop'}
                                                                        </div>
                                                                        <div className="flex items-center space-x-1 ml-2">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setAdminSelectedOrderIds([order.id]);
                                                                                    handleOpenDriverAssignmentModal();
                                                                                }}
                                                                                className="p-1 hover:bg-blue-100 rounded transition-colors bg-gray-50 border border-gray-200"
                                                                                title="Assign Driver"
                                                                            >
                                                                                <Icon name="truck" className="w-4 h-4 text-primary" />
                                                                            </button>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={adminSelectedOrderIds.includes(order.id)}
                                                                                onChange={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleOrderClick(order.id);
                                                                                }}
                                                                                className="form-checkbox h-3 w-3 text-primary rounded"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-neutral-dark">
                                                                        ${order.totalPrice.toFixed(2)}
                                                                    </div>
                                                                    {order.deliveredBy && (
                                                                        <div className="text-xs text-green-600 mt-1">
                                                                            Driver: {order.deliveredBy}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {currentAdminOrderManagementSubTab === 'Schedule' && (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <Icon name="calendar" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                    <p className="text-neutral-dark text-xl">Schedule tab - Coming soon</p>
                    <p className="text-neutral-DEFAULT text-sm mt-2">This section will contain scheduling functionality.</p>
                </div>
            )}

            {currentAdminOrderManagementSubTab === 'Accounting related' && (() => {
                // Filter orders that exceed their shop's payment limit
                const accountingOrders = orders.filter(order => {
                    // Find the shop's payment limit
                    const shop = organizations.flatMap(org => org.shops).find(s => s.name === order.shopLocation);
                    

                    
                    if (!shop || !shop.paymentTerms) return false;
                    
                    // Check if payment terms includes "Amount Limit" (handles both "Amount Limit" and "Amount Limit: $15" formats)
                    const isAmountLimitShop = shop.paymentTerms.includes('Amount Limit');
                    if (!isAmountLimitShop) return false;
                    
                    // Extract amount limit from either amountLimit field or paymentTerms string
                    let limitAmount = 0;
                    if (shop.amountLimit) {
                        limitAmount = parseFloat(shop.amountLimit.toString());
                    } else if (shop.paymentTerms.startsWith('Amount Limit: $')) {
                        limitAmount = parseFloat(shop.paymentTerms.replace('Amount Limit: $', ''));
                    }
                    
                    return limitAmount > 0 && order.totalPrice >= limitAmount;
                });

                // Create custom table data with the required fields
                const accountingTableData = accountingOrders.map(order => {
                    const shop = organizations.flatMap(org => org.shops).find(s => s.name === order.shopLocation);
                    const customerName = order.contactNumber?.split(' - ')[0] || 'N/A';
                    
                    // Extract limit amount using the same logic as filtering
                    let limitAmount = 0;
                    if (shop?.amountLimit) {
                        limitAmount = parseFloat(shop.amountLimit.toString());
                    } else if (shop?.paymentTerms?.startsWith('Amount Limit: $')) {
                        limitAmount = parseFloat(shop.paymentTerms.replace('Amount Limit: $', ''));
                    }
                    
                    // Get PIC of Payment details from shop roles and find user in Individual User Management
                    const picOfPayment = shop?.roles?.['PIC of Payments'];
                    const picName = picOfPayment?.name || 'N/A';
                    const picUser = allAppUsers.find(user => user.name === picName);
                    const picContact = picUser?.contactNumber ? `+65 ${picUser.contactNumber}` : 'N/A';
                    
                    return {
                        ...order,
                        customerName,
                        limitAmount,
                        picName,
                        picContact
                    };
                });

                return accountingTableData.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <Icon name="dollarSign" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                        <p className="text-neutral-dark text-xl">No orders exceed payment limits.</p>
                        <p className="text-neutral-DEFAULT text-sm mt-2">Orders will appear here when they equal or exceed their shop's amount limit.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-light">
                            <h2 className="text-lg font-semibold text-neutral-darker">Orders Exceeding Payment Limits</h2>
                            <p className="text-sm text-neutral-dark mt-1">
                                Orders where the total amount equals or exceeds the shop's payment limit
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-lightest">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Order No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Shop Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Order Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Limit Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Excess Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            PIC of Payment Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            PIC of Payment Contact
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-light">
                                    {accountingTableData.map((order) => (
                                        <tr key={order.id} className="hover:bg-neutral-lightest">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darker">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                {order.shopLocation || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                {order.customerName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                ${order.limitAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="font-medium text-red-600">
                                                    ${(order.totalPrice - order.limitAmount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                {order.picName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                {order.picContact !== 'N/A' ? order.picContact : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {currentAdminOrderManagementSubTab === 'Modification Requests' && (() => {
                // SIMPLE LOGIC: Show ALL orders that have ANY modification requests
                const ordersWithModificationRequests = orders.filter(hasAnyModificationRequests);
                
                // Create individual product request entries - show ALL requests from both arrays
                const productRequestEntries: Array<{
                    orderId: string;
                    orderDate: string;
                    shop: string;
                    requestId: string;
                    requestDate: string;
                    requestStatus: ModificationRequestStatus; // Overall request status
                    itemStatus: ModificationRequestStatus; // Individual item status
                    processedDate?: string;
                    productId: string;
                    productName: string;
                    originalQuantity: number;
                    requestedQuantity: number;
                    changeType: 'added' | 'removed' | 'quantityChanged';
                    unitPrice: number;
                    originalTotalPrice: number;
                    requestedTotalPrice: number;
                }> = [];
                
                ordersWithModificationRequests.forEach(order => {
                    // Process both pending and processed modification requests - show both A and B
                    const allRequests = [
                        ...(order.modificationRequests || []),
                        ...(order.processedModificationRequests || [])
                    ];
                    
                    allRequests.forEach(request => {
                        const requestedItems = request.requestedItems;
                        const isPendingRequest = request.status === 'pending';
                        
                        // Handle removed items based on request status
                        if (isPendingRequest) {
                            // For PENDING requests: use stored pendingRemovedItems
                            const pendingRemovedItems = request.pendingRemovedItems || [];
                            pendingRemovedItems.forEach(removedItem => {
                                productRequestEntries.push({
                                    orderId: order.id,
                                    orderDate: order.orderDate,
                                    shop: order.shopLocation || 'Not specified',
                                    requestId: request.id,
                                    requestDate: request.requestDate,
                                    requestStatus: request.status,
                                    itemStatus: 'pending',
                                    processedDate: undefined,
                                    productId: removedItem.productId,
                                    productName: removedItem.productName,
                                    originalQuantity: removedItem.originalQuantity,
                                    requestedQuantity: 0,
                                    changeType: 'removed',
                                    unitPrice: removedItem.unitPrice,
                                    originalTotalPrice: order.totalPrice,
                                    requestedTotalPrice: request.requestedTotalPrice
                                });
                            });
                        } else {
                            // For PROCESSED requests: use stored processedRemovedItems
                            const processedRemovedItems = request.processedRemovedItems || [];
                            processedRemovedItems.forEach(removedItem => {
                                productRequestEntries.push({
                                    orderId: order.id,
                                    orderDate: order.orderDate,
                                    shop: order.shopLocation || 'Not specified',
                                    requestId: request.id,
                                    requestDate: request.requestDate,
                                    requestStatus: request.status,
                                    itemStatus: removedItem.status,
                                    processedDate: removedItem.processedDate,
                                    productId: removedItem.productId,
                                    productName: removedItem.productName || `Product ${removedItem.productId}`,
                                    originalQuantity: removedItem.originalQuantity || 1,
                                    requestedQuantity: 0,
                                    changeType: 'removed',
                                    unitPrice: removedItem.unitPrice || 0,
                                    originalTotalPrice: order.totalPrice,
                                    requestedTotalPrice: request.requestedTotalPrice
                                });
                            });
                        }
                        
                        // Handle added and quantity changed items 
                        requestedItems.forEach(requestedItem => {
                            let changeType: 'added' | 'removed' | 'quantityChanged';
                            let originalQuantity = 0;
                            let requestedQuantity = requestedItem.quantity;
                            
                            // Use stored change information if available (for both pending and processed)
                            if (requestedItem.changeType) {
                                changeType = requestedItem.changeType;
                                originalQuantity = requestedItem.originalQuantity || 0;
                            } else {
                                // Fallback logic for requests created before the fix
                                if (isPendingRequest) {
                                    // For pending requests: compare with current order items
                                    const currentItems = order.items;
                                    const currentItem = currentItems.find(item => item.id === requestedItem.id);
                                    
                                    if (!currentItem) {
                                        // Item would be added
                                        changeType = 'added';
                                        originalQuantity = 0;
                                    } else if (currentItem.quantity !== requestedItem.quantity) {
                                        // Quantity would be changed
                                        changeType = 'quantityChanged';
                                        originalQuantity = currentItem.quantity;
                                    } else {
                                        // No change for this item, skip
                                        return;
                                    }
                                } else {
                                    // For old processed requests without stored change info, show as generic modification
                                    changeType = 'quantityChanged';
                                    originalQuantity = 0; // Don't try to reconstruct
                                }
                            }
                            
                            productRequestEntries.push({
                                orderId: order.id,
                                orderDate: order.orderDate,
                                shop: order.shopLocation || 'Not specified',
                                requestId: request.id,
                                requestDate: request.requestDate,
                                requestStatus: request.status,
                                itemStatus: requestedItem.itemStatus,
                                processedDate: requestedItem.processedDate,
                                productId: requestedItem.id,
                                productName: requestedItem.name,
                                originalQuantity,
                                requestedQuantity,
                                changeType,
                                unitPrice: requestedItem.price,
                                originalTotalPrice: order.totalPrice,
                                requestedTotalPrice: request.requestedTotalPrice
                            });
                        });
                    });
                });
                
                // Sort by order number first, then by item status (pending items first)
                const sortedProductEntries = productRequestEntries.sort((a, b) => {
                    // First sort by order ID
                    const orderCompare = a.orderId.localeCompare(b.orderId);
                    if (orderCompare !== 0) return orderCompare;
                    
                    // Then sort by item status - pending items first, then accepted/denied
                    const statusOrder = { 'pending': 0, 'accepted': 1, 'denied': 2 };
                    const aStatusOrder = statusOrder[a.itemStatus] ?? 3;
                    const bStatusOrder = statusOrder[b.itemStatus] ?? 3;
                    if (aStatusOrder !== bStatusOrder) return aStatusOrder - bStatusOrder;
                    
                    // Finally sort by request date (most recent first) for items with same order and status
                    return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
                });

                return sortedProductEntries.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <Icon name="edit" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4"/>
                        <p className="text-neutral-dark text-xl">No modification requests found.</p>
                        <p className="text-neutral-DEFAULT text-sm mt-2">Customer modification requests will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-light">
                            <h2 className="text-lg font-semibold text-neutral-darker">Order Modification Requests</h2>
                            <p className="text-sm text-neutral-dark mt-1">
                                Customer requests to modify their orders
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-lightest">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Order Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Change Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Quantity Change
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Request Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-darker uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-light">
                                    {sortedProductEntries.map((entry, index) => {
                                        const getChangeTypeDisplay = (changeType: string, originalQty: number, requestedQty: number) => {
                                            switch (changeType) {
                                                case 'added':
                                                    return { icon: '➕', text: 'Added', bgColor: 'bg-green-50', textColor: 'text-green-700' };
                                                case 'removed':
                                                    return { icon: '❌', text: 'Removed', bgColor: 'bg-red-50', textColor: 'text-red-700' };
                                                case 'quantityChanged':
                                                    const isIncrease = requestedQty > originalQty;
                                                    return { 
                                                        icon: isIncrease ? '📈' : '📉', 
                                                        text: isIncrease ? 'Increased' : 'Decreased',
                                                        bgColor: isIncrease ? 'bg-blue-50' : 'bg-orange-50',
                                                        textColor: isIncrease ? 'text-blue-700' : 'text-orange-700'
                                                    };
                                                default:
                                                    return { icon: '📝', text: 'Modified', bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
                                            }
                                        };

                                        const getRequestStatusBadge = (status: ModificationRequestStatus) => {
                                            switch (status) {
                                                case 'pending':
                                                    return 'bg-yellow-100 text-yellow-800';
                                                case 'accepted':
                                                    return 'bg-green-100 text-green-800';
                                                case 'denied':
                                                    return 'bg-red-100 text-red-800';
                                                default:
                                                    return 'bg-gray-100 text-gray-800';
                                            }
                                        };

                                        const changeDisplay = getChangeTypeDisplay(entry.changeType, entry.originalQuantity, entry.requestedQuantity);

                                        return (
                                            <tr key={`${entry.orderId}-${entry.requestId}-${entry.productId}`} className="hover:bg-neutral-lightest">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-neutral-darker">#{entry.orderId}</span>
                                                        <span className="text-xs text-neutral-dark">{entry.shop}</span>
                                                        <span className="text-xs text-neutral-dark">{formatDateForDisplay(entry.orderDate)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-neutral-darker">{entry.productName}</span>
                                                        <span className="text-xs text-neutral-dark">Unit: ${entry.unitPrice.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeDisplay.bgColor} ${changeDisplay.textColor}`}>
                                                        <span className="mr-1">{changeDisplay.icon}</span>
                                                        {changeDisplay.text}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col">
                                                        {entry.changeType === 'added' && (
                                                            <span className="text-green-600 font-medium">+ {entry.requestedQuantity}</span>
                                                        )}
                                                        {entry.changeType === 'removed' && (
                                                            <span className="text-red-600 font-medium line-through">- {entry.originalQuantity}</span>
                                                        )}
                                                        {entry.changeType === 'quantityChanged' && (
                                                            <div>
                                                                <span className="text-red-500 line-through">{entry.originalQuantity}</span>
                                                                <span className="mx-1">→</span>
                                                                <span className="text-green-600 font-medium">{entry.requestedQuantity}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                                    {formatDateForDisplay(entry.requestDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRequestStatusBadge(entry.itemStatus)}`}>
                                                        {entry.itemStatus.charAt(0).toUpperCase() + entry.itemStatus.slice(1)}
                                                    </span>
                                                    {entry.processedDate && (
                                                        <div className="text-xs text-neutral-dark mt-1">
                                                            {formatDateForDisplay(entry.processedDate)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {entry.itemStatus === 'pending' && (
                                                        <div className="flex justify-center space-x-1">
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleAcceptProductModificationRequest(entry.orderId, entry.requestId, entry.productId)}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleDenyProductModificationRequest(entry.orderId, entry.requestId, entry.productId)}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                Deny
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {entry.itemStatus !== 'pending' && (
                                                        <span className="text-xs text-neutral-dark">
                                                            {entry.itemStatus === 'accepted' ? 'Approved' : 'Denied'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {editingCellInfo && (
                <div 
                    ref={inlineEditPopupRef} 
                    style={calculatePopupPosition(editingCellInfo.cellElement)} 
                    className="absolute z-50 bg-white p-3 shadow-xl rounded-md border border-neutral-DEFAULT min-w-[200px]"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <h4 className="text-sm font-semibold mb-2 text-neutral-darker">
                        Edit {ALL_ADMIN_ORDER_TABLE_COLUMNS.find(c => c.id === editingCellInfo.columnId)?.label || 'Value'}
                    </h4>
                    {editingCellInfo.columnId === 'status' && (
                        <select
                            value={inlineEditValue as OrderStatus || ''}
                            onChange={(e) => setInlineEditValue(e.target.value as OrderStatus)}
                            className="w-full p-2 border border-neutral-DEFAULT rounded-md text-sm bg-white text-neutral-darker"
                            autoFocus
                        >
                            {ADMIN_ORDER_STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    )}
                    {editingCellInfo.columnId === 'billedInInsmartBy' && (
                         <select
                            value={inlineEditValue || ''}
                            onChange={(e) => setInlineEditValue(e.target.value ? e.target.value as AdminStaffName : undefined)}
                            className="w-full p-2 border border-neutral-DEFAULT rounded-md text-sm bg-white text-neutral-darker"
                            autoFocus
                        >
                            <option value="">-- Select Biller --</option>
                            {AdminStaffNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                     {editingCellInfo.columnId === 'shippingDate' && (
                        <DatePicker
                            selectedDate={inlineEditValue instanceof Date ? inlineEditValue : null}
                            onChange={(date) => setInlineEditValue(date)}
                            minDate={new Date()} 
                            id={`inline-edit-shipping-date-${editingCellInfo.orderId}`}
                            initialOpen={true}
                            showClearButton={true}
                        />
                    )}
                    {editingCellInfo.columnId === 'packedBy' && (
                         <select
                            value={inlineEditValue as AdminStaffNamePackedBy || ''}
                            onChange={(e) => setInlineEditValue(e.target.value as AdminStaffNamePackedBy)}
                            className="w-full p-2 border border-neutral-DEFAULT rounded-md text-sm bg-white text-neutral-darker"
                            autoFocus
                        >
                            {AdminStaffNamesPackedBy.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                    {editingCellInfo.columnId === 'deliveredBy' && (
                         <select
                            value={inlineEditValue as AdminStaffNameDeliveredBy || ''}
                            onChange={(e) => setInlineEditValue(e.target.value as AdminStaffNameDeliveredBy)}
                            className="w-full p-2 border border-neutral-DEFAULT rounded-md text-sm bg-white text-neutral-darker"
                            autoFocus
                        >
                            {AdminStaffNamesDeliveredBy.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                     {editingCellInfo.columnId === 'customerType' && (
                         <select
                            value={inlineEditValue as CustomerType || DEFAULT_CUSTOMER_TYPE}
                            onChange={(e) => setInlineEditValue(e.target.value as CustomerType)}
                            className="w-full p-2 border border-neutral-DEFAULT rounded-md text-sm bg-white text-neutral-darker"
                            autoFocus
                        >
                            {CustomerTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    )}
                    <div className="mt-3 flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingCellInfo(null)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={handleSaveInlineEdit}>Save</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const renderOrderPdfLayout = (ordersToDisplay: Order[], isMultiPrint: boolean) => {
    if (!ordersToDisplay || ordersToDisplay.length === 0) {
        return (
            <div className={`p-4 ${isMultiPrint ? '' : 'pt-4'} text-center text-neutral-darker`}>
                <p>No order details to display for PDF view.</p>
                <Button onClick={() => handleAdminNavigate(Page.ADMIN_ORDER_MANAGEMENT)} className="mt-4">
                    Back to Order Management
                </Button>
            </div>
        );
    }

    return (
        <div className={`p-4 ${isMultiPrint ? '' : ''} bg-white print:pt-0 text-neutral-darker`}> 
            {!isMultiPrint && (
                 <div className="mb-4 print:hidden flex justify-between items-center">
                    <Button 
                        variant="ghost" 
                        onClick={() => handleAdminNavigate(Page.ADMIN_ORDER_MANAGEMENT)} 
                        leftIcon={<Icon name="chevronLeft" className="w-5 h-5"/>}
                         className="text-neutral-darker"
                    >
                        Back to Orders
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => window.print()} 
                        leftIcon={<Icon name="printer" className="w-5 h-5"/>}
                    >
                        Print Order
                    </Button>
                </div>
            )}
            {ordersToDisplay.map((order, index) => (
                <div key={order.id} className={`invoice-page bg-white p-6 mx-auto max-w-2xl border border-neutral-darker my-4 shadow-lg print:shadow-none print:border-none print:my-0 ${index < ordersToDisplay.length - 1 ? 'print:page-break-after' : ''}`}>
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-neutral-DEFAULT">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-darkest">Order Invoice</h1>
                            <p className="text-neutral-dark">Al-Sheika Pte Ltd (Placeholder)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-semibold">Order #{order.id}</p>
                            <p className="text-sm text-neutral-dark">Date: {formatSimpleDate(order.orderDate)}</p>
                            {order.invoiceDate && order.invoiceDate !== order.orderDate &&
                                <p className="text-sm text-neutral-dark">Invoice Date: {formatSimpleDate(order.invoiceDate)}</p>
                            }
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                        <div>
                            <h3 className="font-semibold text-neutral-darker mb-1">Bill To:</h3>
                            <p>{order.contactNumber?.split(' - ')[0] || 'N/A'}</p>
                            <p>{order.billingAddress || order.shippingAddress || 'N/A'}</p>
                            <p>{order.contactNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-darker mb-1">Ship To:</h3>
                            <p>{order.contactNumber?.split(' - ')[0] || 'N/A'}</p>
                            <p>{order.shippingAddress || 'N/A'}</p>
                        </div>
                    </div>
                     {order.shopLocation && <p className="text-xs mb-1"><strong>Shop:</strong> {order.shopLocation}</p>}
                     {order.customerType && <p className="text-xs mb-1"><strong>Customer Type:</strong> {order.customerType}</p>}
                     {order.shippingDate && <p className="text-xs mb-1"><strong>Est. Shipping Date:</strong> {formatSimpleDate(order.shippingDate)}</p>}
                     {order.billedDate && <p className="text-xs mb-1"><strong>Billed Date:</strong> {formatSimpleDate(order.billedDate)}</p>}
                     
                     {/* Modification Information in PDF */}
                     {(order.isModified || (order.processedModificationRequests && order.processedModificationRequests.length > 0)) && (() => {
                       const hasLegacyModification = order.isModified && hasNoModificationRequests(order);
                       const hasNewModificationRequests = order.processedModificationRequests && order.processedModificationRequests.length > 0;
                       
                       if (hasLegacyModification || hasNewModificationRequests) {
                         const { changeCount, changesText } = generatePdfChangesFormat(order);
                         const modificationDate = hasLegacyModification ? order.modificationDate : order.processedModificationRequests?.[0]?.processedDate;
                         
                         return (
                           <div className="mt-2 pt-2 border-t border-neutral-light">
                             <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <p className="text-xs mb-1 text-orange-600"><strong>Order Modified:</strong> Yes</p>
                                 {modificationDate && (
                                   <p className="text-xs mb-1"><strong>Modified Date:</strong> {formatDateTimeForPdf(modificationDate)}</p>
                                 )}
                               </div>
                               <div>
                                 {(() => {
                                   // Only show removed items in the changes section
                                   const { removedItems } = generatePdfChangesFormat(order);
                                   if (removedItems.length > 0) {
                                     const removedItemsText = removedItems.join(', ');
                                     return (
                                       <p className="text-xs mb-1"><strong>Item(s) removed:</strong> {removedItemsText}</p>
                                     );
                                   }
                                   return null;
                                 })()}
                               </div>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     })()}


                    <table className="w-full text-left mb-6 text-sm">
                        <thead className="border-b-2 border-neutral-darker">
                            <tr>
                                <th className="py-2 pr-2">#</th>
                                <th className="py-2">Item Description</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Unit Price</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => {
                                const modificationInfo = getItemModificationInfo(order, item.id);
                                
                                return (
                                <tr key={item.id} className="border-b border-neutral-light">
                                    <td className="py-2 pr-2">{idx + 1}</td>
                                        <td className="py-2">
                                            <div>
                                                <div>{item.name} <span className="text-neutral-dark">({item.uom})</span></div>
                                                {modificationInfo.isAddition && (
                                                    <div className="text-xs text-green-600 font-medium mt-0.5">Addition</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2 text-center">
                                            {modificationInfo.hasQuantityChange && modificationInfo.originalQuantity !== null ? (
                                                <div className="flex items-center justify-center space-x-1">
                                                    <span className="line-through text-neutral-dark text-xs">{modificationInfo.originalQuantity}</span>
                                                    <span>{item.quantity}</span>
                                                </div>
                                            ) : (
                                                <span>{item.quantity}</span>
                                            )}
                                        </td>
                                    <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                                    <td className="py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-6">
                        <div className="w-1/2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-dark">Estimated Total:</span>
                                <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t-2 border-neutral-darker">
                                <span>Grand Total:</span>
                                <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    { (order.attachedPhotoName || order.attachedDocumentName) &&
                        <div className="text-xs text-neutral-dark mt-4 pt-2 border-t border-neutral-light">
                            {order.attachedPhotoName && <p>Attached Photo: {order.attachedPhotoName}</p>}
                            {order.attachedDocumentName && <p>Attached Purchase Order: {order.attachedDocumentName}</p>}
                        </div>
                    }
                    <div className="text-center text-xs text-neutral-dark mt-6">
                        Thank you for your business!
                    </div>
                </div>
            ))}
        </div>
    );
};

const renderAdminViewOrderPdfPage = () => {
    return orderToViewAdminPdf ? renderOrderPdfLayout([orderToViewAdminPdf], false) : 
        ( <div className="p-4 pt-4 text-center text-neutral-darker"> <p>No order selected for PDF view.</p> </div> );
};

const renderAdminPrintOrdersPdfPage = () => {
     return (
        <div className="bg-neutral-light print:bg-white">
            <div className="p-4 print:hidden sticky top-0 bg-neutral-light z-50 flex justify-between items-center shadow-sm">
                 <Button 
                    variant="ghost" 
                    onClick={() => handleAdminNavigate(Page.ADMIN_ORDER_MANAGEMENT)} 
                    leftIcon={<Icon name="chevronLeft" className="w-5 h-5"/>}
                    className="text-neutral-darker"
                 >
                    Back to Orders
                </Button>
                <Button 
                    variant="primary" 
                    onClick={() => window.print()} 
                    leftIcon={<Icon name="printer" className="w-5 h-5"/>}
                >
                    Print All ({ordersToPrintAdminPdf.length})
                </Button>
            </div>
            {renderOrderPdfLayout(ordersToPrintAdminPdf, true)}
        </div>
    );
};

const UserManagementTable: React.FC<{ users: AppUser[]; expandedUserIds: string[]; onToggleUserExpansion: (userId: string) => void }> = ({ users, expandedUserIds, onToggleUserExpansion }) => {
    // Group users by organization
    const groupedUsers = users.reduce((acc, user) => {
        const orgKey = user.organization || 'No Organization';
        if (!acc[orgKey]) {
            acc[orgKey] = [];
        }
        acc[orgKey].push(user);
        return acc;
    }, {} as Record<string, AppUser[]>);

    const renderUserTable = (usersToDisplay: AppUser[], groupTitle?: string) => {
                return (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-6">
                {groupTitle && (
                    <h2 className="text-lg font-semibold text-neutral-darker p-3 bg-neutral-lightest border-b border-neutral-DEFAULT">
                        {groupTitle} ({usersToDisplay.length})
                    </h2>
                )}
                            <table className="min-w-full divide-y divide-neutral-DEFAULT">
                                <thead className="bg-neutral-light">
                                    <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '100px'}}>
                                User ID
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '150px'}}>
                                User Name
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '180px'}}>
                                User Contact No. (Whatsapp)
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '120px'}}>
                                Role
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '150px'}}>
                                Linked Organization
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '200px'}}>
                                Linked Shop(s)
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider" style={{minWidth: '80px'}}>
                                Actions
                            </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-light">
                        {usersToDisplay.length === 0 ? (
                                        <tr>
                                <td colSpan={7} className="px-3 py-4 text-center text-sm text-neutral-dark">
                                                No user accounts found.
                                            </td>
                                        </tr>
                                    ) : (
                            usersToDisplay.map(user => {
                                const isExpanded = expandedUserIds.includes(user.id);
                                const isExternalUser = user.organization !== 'Selvi Mills';
                                const isOwnerRole = user.role === 'Owner';
                                const hasRoleShopAssignments = user.roleShopAssignments && user.roleShopAssignments.length > 0;
                                const needsSubRows = isExternalUser && !isOwnerRole && hasRoleShopAssignments;
                                
                                return (
                                    <React.Fragment key={user.id}>
                                        <tr className="hover:bg-neutral-lightest transition-colors duration-150">
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-darker font-medium">
                                                {user.id}
                                            </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-darker">
                                                <div className="flex items-center">
                                                    <Icon name="user" className="w-4 h-4 text-neutral-dark mr-2" />
                                                    {user.name}
                                                    {needsSubRows && (
                                                        <button
                                                            onClick={() => onToggleUserExpansion(user.id)}
                                                            className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                                                        >
                                                            {isExpanded ? 'Hide Details' : 'Show Details'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-darker">
                                                {user.contactNumber ? (
                                                    <div className="flex items-center">
                                                        <Icon name="phone" className="w-4 h-4 text-green-500 mr-2" />
                                                        {user.contactNumber}
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-dark italic">No contact</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                {/* Show role only for internal users or external users with Owner role */}
                                                {(!isExternalUser || isOwnerRole) ? (
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.role === 'Super Admin' ? 'bg-red-100 text-red-800' :
                                                        user.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                                                        user.role === 'Staff' ? 'bg-green-100 text-green-800' :
                                                        user.role === 'Owner' ? 'bg-purple-100 text-purple-800' :
                                                        user.role?.includes('Manager') ? 'bg-yellow-100 text-yellow-800' :
                                                        user.role?.includes('PIC') ? 'bg-orange-100 text-orange-800' :
                                                        'bg-neutral-100 text-neutral-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-dark italic">See details below</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-darker">
                                                <div className="flex items-center">
                                                    <Icon name="building" className="w-4 h-4 text-neutral-dark mr-2" />
                                                    {user.organization}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-neutral-darker">
                                                {/* Show shops for internal users or external users with Owner role */}
                                                {(!isExternalUser || isOwnerRole) ? (
                                                    <>
                                                        {isExternalUser && isOwnerRole ? (
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md">
                                                                <Icon name="layoutGrid" className="w-3 h-3 mr-1" />
                                                                All
                                                            </span>
                                                        ) : user.shops && user.shops.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.shops.map((shop, index) => (
                                                                    <span 
                                                                        key={index} 
                                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-neutral-light text-neutral-darker rounded-md"
                                                                    >
                                                                        <Icon name="layoutGrid" className="w-3 h-3 mr-1" />
                                                                        {shop}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-neutral-dark italic">No shops linked</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-neutral-dark italic">See details below</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEditUserModal(user)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Icon name="edit" className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                        {/* Sub-rows for external users (excluding Owner role) */}
                                        {isExpanded && needsSubRows && user.roleShopAssignments && (
                                            user.roleShopAssignments
                                                .sort((a, b) => {
                                                    // Sort by shop name alphabetically
                                                    const shopA = a.shops[0] || '';
                                                    const shopB = b.shops[0] || '';
                                                    return shopA.localeCompare(shopB);
                                                })
                                                .map((assignment, assignmentIndex) => (
                                                <tr key={`${user.id}-assignment-${assignmentIndex}`} className="bg-blue-50 border-l-4 border-blue-300">
                                                    <td className="px-3 py-2 text-sm text-neutral-dark">
                                                        <span className="text-xs">↳ Role #{assignmentIndex + 1}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-neutral-darker">
                                                        <div className="flex items-center pl-4">
                                                            <Icon name="user" className="w-3 h-3 text-neutral-dark mr-2" />
                                                            <span className="text-xs italic">{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-neutral-dark">
                                                        <span className="text-xs">-</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            assignment.role?.includes('Manager') ? 'bg-yellow-100 text-yellow-800' :
                                                            assignment.role?.includes('PIC') ? 'bg-orange-100 text-orange-800' :
                                                            'bg-neutral-100 text-neutral-800'
                                                        }`}>
                                                            {assignment.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-neutral-dark">
                                                        <span className="text-xs">-</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-neutral-darker">
                                                        <div className="flex flex-wrap gap-1">
                                                            {assignment.shops.map((shop, shopIndex) => (
                                                                <span 
                                                                    key={shopIndex} 
                                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
                                                                >
                                                                    <Icon name="layoutGrid" className="w-3 h-3 mr-1" />
                                                                    {shop}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm">
                                                        {/* Empty Actions cell for sub-rows */}
                                                </td>
                                            </tr>
                                        ))
                                        )}
                                    </React.Fragment>
                                );
                            })
                                    )}
                                </tbody>
                            </table>
            </div>
        );
    };

    return (
        <div className="mt-4">
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-neutral-light">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-neutral-darker">Individual User Management</h2>
                    <Button 
                        variant="primary" 
                        onClick={handleOpenAddUserModal}
                        className="flex items-center gap-2"
                    >
                        <Icon name="plus" className="w-4 h-4" />
                        Add New User
                    </Button>
                </div>
                <p className="text-sm text-neutral-dark">
                    Total Users: <span className="font-semibold">{users.length}</span> | 
                    Organizations: <span className="font-semibold">{Object.keys(groupedUsers).length}</span>
                </p>
            </div>

            {Object.keys(groupedUsers).length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Icon name="users" className="w-16 h-16 text-neutral-DEFAULT mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-darker mb-2">No Users Found</h3>
                    <p className="text-neutral-dark">No user accounts are currently in the system.</p>
                </div>
            ) : (
                Object.entries(groupedUsers).map(([orgName, orgUsers]) => 
                    renderUserTable(orgUsers, orgName)
                )
            )}
        </div>
    );
};

const renderAdminUserManagementPage = () => {
    const renderSubTabContent = () => {
        switch (currentAdminUserManagementSubTab) {
            case 'Individual User Management':
                return <UserManagementTable users={allAppUsers} expandedUserIds={expandedUserIds} onToggleUserExpansion={toggleUserExpansion} />;
            case 'Organization and Shop Management':
                return (
                    <div className="mt-4">
                        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-neutral-light">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-semibold text-neutral-darker">Organization and Shop Management</h2>
                                <Button 
                                    variant="primary" 
                                    onClick={() => setIsAddOrganizationModalOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Icon name="plus" className="w-4 h-4" />
                                    Add New Organization
                                </Button>
                            </div>
                            <p className="text-sm text-neutral-dark">
                                Total Organizations: <span className="font-semibold">{organizations.length}</span> | 
                                Total Shops: <span className="font-semibold">{organizations.reduce((total, org) => total + (org.shops?.length || 0), 0)}</span>
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                          <div className="relative">
                            <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-DEFAULT" />
                            <input
                              type="text"
                              placeholder="Search organizations..."
                              value={organizationSearchQuery}
                              onChange={(e) => setOrganizationSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            {/* Search Results Dropdown */}
                            {organizationSearchQuery.trim() && filteredOrganizations.length > 0 && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-neutral-light rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                {filteredOrganizations.map(org => (
                                  <button
                                    key={org.id}
                                    onClick={() => {
                                      handleOrganizationSelect(org.id);
                                      setOrganizationSearchQuery('');
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-neutral-lightest focus:outline-none focus:bg-neutral-lightest border-b border-neutral-100 last:border-b-0"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Icon name={org.type === 'internal' ? 'building' : 'store'} className={`w-4 h-4 ${org.type === 'internal' ? 'text-blue-600' : 'text-green-600'}`} />
                                      <span className="font-medium text-neutral-darker">{org.name}</span>
                                      <span className="text-xs text-neutral-dark">({org.shops?.length || 0} shops)</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                            {filteredOrganizations.map(org => {
                              // Calculate organization statistics
                              const totalShops = org.shops ? org.shops.length : 0;
                              
                              return (
                              <div key={org.id} className="bg-white rounded-lg shadow-md border border-neutral-light p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <Icon name={org.type === 'internal' ? 'building' : 'store'} className={`w-5 h-5 ${org.type === 'internal' ? 'text-blue-600' : 'text-green-600'}`} />
                                      <h3 className="text-lg font-semibold text-neutral-darker">{org.name}</h3>
                                      <span className="text-sm text-neutral-dark">({totalShops} shops)</span>
                                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${org.type === 'internal' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {org.type === 'internal' ? 'Internal Organization' : 'External Customer'}
                                      </span>
                                    </div>
                                    
                                    {/* Owner Information for External Organizations */}
                                    {org.type === 'external' && (
                                      <div className="bg-purple-50 rounded-lg p-2">
                                        <div className="flex items-center space-x-2">
                                          <Icon name="user" className="w-4 h-4 text-purple-600" />
                                          <span className="text-sm font-semibold text-purple-800">Owner:</span>
                                          <span className="text-sm font-medium text-purple-700">Mani</span>
                                          <span className="text-xs text-purple-600">(ID: 0013)</span>
                                          <span className="text-xs text-purple-600">WhatsApp: +65 8468 2040</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {org.type === 'external' && (
                                      <button 
                                        onClick={() => handleOpenAddShopModal(org.id)}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-green-600 text-green-600 hover:bg-green-50 transition-colors focus:outline-none"
                                      >
                                        <Icon name="plus" className="w-4 h-4 mr-1" />
                                        Add Shop
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => toggleOrg(org.id)} 
                                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                                        org.type === 'internal' 
                                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                          : 'bg-green-600 text-white hover:bg-green-700'
                                      }`}
                                    >
                                      {expandedOrgIds.includes(org.id) ? 'Hide Details' : 'View Details'}
                                    </button>
                                  </div>
                                </div>
                                  
                                  {/* Show shops if org is expanded and has shops */}
                                  {expandedOrgIds.includes(org.id) && org.shops && org.shops.length > 0 && (
                                  <div className="mt-4 space-y-4">
                                    {org.shops.map(shop => (
                                      <div key={shop.id} className="bg-neutral-lightest rounded-lg border border-neutral-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center space-x-3">
                                            <Icon name="layoutGrid" className="w-5 h-5 text-green-600" />
                                            <div>
                                              <h4 className="font-semibold text-neutral-darker">{shop.name}</h4>
                                              <p className="text-sm text-neutral-dark">{(shop as any).address || 'Location details'}</p>
                                              <div className="text-xs text-neutral-DEFAULT mt-1">
                                                <div><span className="font-medium">Region:</span> {(shop as any).shipmentRegion}</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <button 
                                              onClick={() => handleOpenEditShopModal(shop, org.id)}
                                              className="p-2 text-neutral-dark hover:text-primary hover:bg-neutral-lightest rounded-lg transition-colors"
                                              title="Edit shop details"
                                            >
                                              <Icon name="edit" className="w-4 h-4" />
                                            </button>
                                            <button 
                                              onClick={() => handleOpenBillingHoldModal(shop, org.id, shop.internalBillingHold ? 'disable' : 'enable')}
                                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                                shop.internalBillingHold 
                                                  ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300' 
                                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                              }`}
                                              title={`${shop.internalBillingHold ? 'Disable' : 'Enable'} internal billing hold`}
                                            >
                                              Internal billing hold: {shop.internalBillingHold ? 'On' : 'Off'}
                                            </button>
                                            <button 
                                              onClick={() => handleOpenShopOrgManagementModal(shop, org.id, 'move')}
                                              className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 rounded-lg transition-colors border border-blue-300"
                                              title="Move shop to another organization"
                                            >
                                              <Icon name="arrowRight" className="w-4 h-4" />
                                            </button>
                                            <button 
                                              onClick={() => handleOpenShopOrgManagementModal(shop, org.id, 'remove')}
                                              className="p-2 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 rounded-lg transition-colors border border-red-300"
                                              title="Remove shop from organization"
                                            >
                                              <Icon name="trash" className="w-4 h-4" />
                                            </button>
                                            <button 
                                              onClick={() => toggleShop(shop.id)} 
                                              className="px-3 py-1 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none transition-colors"
                                            >
                                              {expandedShopIds.includes(shop.id) ? 'Hide Details' : 'View Details'}
                                            </button>
                                          </div>
                                        </div>

                                        {/* Detailed Information */}
                                        {expandedShopIds.includes(shop.id) && (
                                          <div className="mt-4 space-y-4">
                                            {/* Role Assignments */}
                                            <div className="bg-white rounded-lg p-4 border border-neutral-100">
                                              <h5 className="font-semibold text-neutral-darker mb-3 flex items-center">
                                                <Icon name="users" className="w-4 h-4 mr-2 text-purple-600" />
                                                Role Assignments
                                              </h5>
                                              <div className="space-y-3">
                                                {/* Manager Role */}
                                                <div className="border border-neutral-200 rounded-lg p-2 bg-blue-50 border-l-4 border-l-blue-500">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                      Manager
                                                    </span>
                                                    <span className="text-sm text-neutral-dark">
                                                      {(() => {
                                                        const managerName = (shop as any).roles?.Manager?.name;
                                                        const managerUser = allAppUsers.find(user => user.name === managerName);
                                                        const userContact = managerUser?.contactNumber;
                                                        const userId = managerUser?.id;
                                                        
                                                        return (
                                                          <>
                                                            <span className="font-medium">{managerName || 'Not assigned'}</span>
                                                            {userId && <span className="text-xs text-neutral-DEFAULT ml-1">(ID: {userId})</span>}
                                                            {userContact && userContact !== '' && (
                                                              <span className="ml-2 text-xs text-neutral-DEFAULT">WhatsApp: +65 {userContact}</span>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                    </span>
                                                  </div>
                                                </div>
                                                
                                                {/* PIC of Payments Role */}
                                                <div className="border border-neutral-200 rounded-lg p-2 bg-green-50 border-l-4 border-l-green-500">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                      PIC of Payments
                                                    </span>
                                                    <span className="text-sm text-neutral-dark">
                                                      {(() => {
                                                        const picPaymentName = (shop as any).roles?.['PIC of Payments']?.name;
                                                        const picPaymentUser = allAppUsers.find(user => user.name === picPaymentName);
                                                        const userContact = picPaymentUser?.contactNumber;
                                                        const userId = picPaymentUser?.id;
                                                        
                                                        return (
                                                          <>
                                                            <span className="font-medium">{picPaymentName || 'Not assigned'}</span>
                                                            {userId && <span className="text-xs text-neutral-DEFAULT ml-1">(ID: {userId})</span>}
                                                            {userContact && userContact !== '' && (
                                                              <span className="ml-2 text-xs text-neutral-DEFAULT">WhatsApp: +65 {userContact}</span>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                    </span>
                                                  </div>
                                                </div>
                                                
                                                {/* PIC of Ordering Role */}
                                                <div className="border border-neutral-200 rounded-lg p-2 bg-green-50 border-l-4 border-l-green-500">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                      PIC of Ordering
                                                    </span>
                                                    <span className="text-sm text-neutral-dark">
                                                      {(() => {
                                                        const picOrderingName = (shop as any).roles?.['PIC of Ordering']?.name;
                                                        const picOrderingUser = allAppUsers.find(user => user.name === picOrderingName);
                                                        const userContact = picOrderingUser?.contactNumber;
                                                        const userId = picOrderingUser?.id;
                                                        
                                                        return (
                                                          <>
                                                            <span className="font-medium">{picOrderingName || 'Not assigned'}</span>
                                                            {userId && <span className="text-xs text-neutral-DEFAULT ml-1">(ID: {userId})</span>}
                                                            {userContact && userContact !== '' && (
                                                              <span className="ml-2 text-xs text-neutral-DEFAULT">WhatsApp: +65 {userContact}</span>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Payment */}
                                            <div className="bg-white rounded-lg p-4 border border-neutral-100">
                                              <h5 className="font-semibold text-neutral-darker mb-3 flex items-center">
                                                <Icon name="creditCard" className="w-4 h-4 mr-2 text-green-600" />
                                                Payment
                                              </h5>
                                              <div className="space-y-2 text-sm text-neutral-dark">
                                                <div><span className="font-medium">Payment Terms:</span> {(shop as any).paymentTerms}</div>
                                                <div><span className="font-medium">Customer Type:</span> {(shop as any).customerType || 'Not specified'}</div>
                                              </div>
                                            </div>

                                            {/* Packaging */}
                                            {(shop as any).packaging && (
                                              <div className="bg-white rounded-lg p-4 border border-neutral-100">
                                                <h5 className="font-semibold text-neutral-darker mb-3 flex items-center">
                                                  <Icon name="package" className="w-4 h-4 mr-2 text-orange-600" />
                                                  Packaging
                                                </h5>
                                                <div className="grid grid-cols-2 gap-3 text-sm text-neutral-dark">
                                                  <div><span className="font-medium">Pallet Type:</span> {(shop as any).packaging?.palletType || 'Not specified'}</div>
                                                  <div><span className="font-medium">Label Type:</span> {(shop as any).packaging?.labelType || 'Not specified'}</div>
                                                  <div><span className="font-medium">Packaging Type:</span> {(shop as any).packaging?.packagingType || 'Not specified'}</div>
                                                  <div><span className="font-medium">Weight Type:</span> {(shop as any).packaging?.weightType || 'Not specified'}</div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Parking/Unloading */}
                                            {(shop as any).parkingUnloading && (
                                              <div className="bg-white rounded-lg p-4 border border-neutral-100">
                                                <h5 className="font-semibold text-neutral-darker mb-3 flex items-center">
                                                  <Icon name="truck" className="w-4 h-4 mr-2 text-blue-600" />
                                                  Parking/Unloading
                                                </h5>
                                                <div className="text-sm text-neutral-dark">
                                                  <span className="font-medium">Notes:</span> {(shop as any).parkingUnloading?.notes || 'No special instructions'}
                                                </div>
                                              </div>
                                            )}

                                            {/* Delivery */}
                                            {(shop as any).delivery && (
                                              <div className="bg-white rounded-lg p-4 border border-neutral-100">
                                                <h5 className="font-semibold text-neutral-darker mb-3 flex items-center">
                                                  <Icon name="clock" className="w-4 h-4 mr-2 text-purple-600" />
                                                  Delivery
                                                </h5>
                                                <div className="grid grid-cols-2 gap-3 text-sm text-neutral-dark">
                                                  {(shop as any).delivery?.openTime && (
                                                    <div><span className="font-medium">Open Time:</span> {(shop as any).delivery.openTime}</div>
                                                  )}
                                                  {(shop as any).delivery?.closeTime && (
                                                    <div><span className="font-medium">Close Time:</span> {(shop as any).delivery.closeTime}</div>
                                                  )}
                                                  {(shop as any).delivery?.deliverAfter && (
                                                    <div><span className="font-medium">Deliver After:</span> {(shop as any).delivery.deliverAfter}</div>
                                                  )}
                                                  {(shop as any).delivery?.deliverBefore && (
                                                    <div><span className="font-medium">Deliver Before:</span> {(shop as any).delivery.deliverBefore}</div>
                                                  )}
                                                  {(shop as any).delivery?.closedOn && (shop as any).delivery.closedOn.length > 0 && (
                                                    <div className="col-span-2"><span className="font-medium">Closed On:</span> {(shop as any).delivery.closedOn.join(', ')}</div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                       </div>
                                     ))}
                                   </div>
                                 )}
                               </div>
                               );
                             })}

                        {/* Unlinked Shops Section */}
                        {unlinkedShops.length > 0 && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold text-neutral-darker mb-4 flex items-center">
                              <Icon name="alert" className="w-5 h-5 mr-2 text-orange-600" />
                              Shops not linked to any organization
                            </h3>
                            <div className="space-y-3">
                              {unlinkedShops.map((shop) => (
                                <div key={shop.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold text-neutral-darker">{shop.name}</h4>
                                      <div className="text-sm text-neutral-dark mt-1">
                                        <div><span className="font-medium">Address:</span> {shop.address}</div>
                                        <div><span className="font-medium">Region:</span> {shop.shipmentRegion}</div>
                                        <div><span className="font-medium">Removal Reason:</span> {shop.removalReason === 'Others' ? shop.customRemovalReason : shop.removalReason}</div>
                                        <div><span className="font-medium">Removed At:</span> {new Date(shop.removedAt).toLocaleDateString()}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={() => handleOpenBillingHoldModal(shop, '', shop.internalBillingHold ? 'disable' : 'enable')}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                          shop.internalBillingHold 
                                            ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        }`}
                                        title={`${shop.internalBillingHold ? 'Disable' : 'Enable'} internal billing hold`}
                                      >
                                        Internal billing hold: {shop.internalBillingHold ? 'On' : 'Off'}
                                      </button>
                                                                             <button 
                                         onClick={() => {
                                           // Find external organizations for re-linking
                                           const externalOrgs = organizations.filter(org => org.type === 'external');
                                           if (externalOrgs.length > 0) {
                                             setShopOrgManagementData({ shop, currentOrgId: '', action: 'move' });
                                             setShopOrgForm({
                                               targetOrgId: '',
                                               removalReason: '',
                                               customReason: ''
                                             });
                                             setIsShopOrgManagementModalOpen(true);
                                           } else {
                                             showToast('No external organizations available for re-linking!');
                                           }
                                         }}
                                         className="p-2 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 rounded-lg transition-colors border border-green-300"
                                         title="Re-link shop to an organization"
                                       >
                                         <Icon name="link" className="w-4 h-4" />
                                       </button>
                                       <button 
                                         onClick={() => {
                                           // Remove from unlinked shops permanently
                                           setUnlinkedShops(prev => prev.filter(s => s.id !== shop.id));
                                           showToast(`Shop "${shop.name}" permanently removed!`);
                                         }}
                                         className="p-2 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 rounded-lg transition-colors border border-red-300"
                                         title="Permanently delete shop"
                                       >
                                         <Icon name="trash" className="w-4 h-4" />
                                       </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                    </div>
                );
            case 'User Groups':
                 return (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-neutral-darker mb-3">User Groups</h2>
                        <div className="text-center py-8">
                            <Icon name="users" className="w-12 h-12 text-neutral-DEFAULT mx-auto mb-3" />
                            <p className="text-neutral-dark">User group management (creating, editing, assigning users) is currently under development.</p>
                        </div>
                    </div>
                );
            case 'Activity Logs':
                return (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-neutral-darker mb-3">User Activity Logs</h2>
                         <div className="text-center py-8">
                            <Icon name="list" className="w-12 h-12 text-neutral-DEFAULT mx-auto mb-3" />
                            <p className="text-neutral-dark">Features for viewing user activity logs and audit trails will be available here soon.</p>
                        </div>
                    </div>
                );
            default:
                return <p className="mt-4">Please select a sub-tab.</p>;
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-neutral-darker mb-4">User Management</h1>
            <div className="mb-4">
                <div className="flex border-b border-neutral-DEFAULT">
                    {ADMIN_USER_MANAGEMENT_SUB_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setCurrentAdminUserManagementSubTab(tab)}
                            className={`px-4 py-2 text-sm font-medium focus:outline-none
                                ${currentAdminUserManagementSubTab === tab 
                                    ? 'border-b-2 border-primary text-primary' 
                                    : 'text-neutral-dark hover:text-primary-light hover:border-primary-light'
                                }`}
                            aria-current={currentAdminUserManagementSubTab === tab ? 'page' : undefined}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            {renderSubTabContent()}
        </div>
    );
};


  const renderCustomerPanelContent = () => {
    const isCustomerNavbarVisible = 
        customerCurrentPage !== Page.CART && 
        customerCurrentPage !== Page.ORDER_DETAILS &&
        customerCurrentPage !== Page.ORDER_CONFIRMATION; // Order confirmation is full screen

    const needsCustomerNavbarPadding = isCustomerNavbarVisible;
    const customerPageContainerClasses = `flex-grow ${needsCustomerNavbarPadding ? 'pb-14' : ''} overflow-y-auto bg-neutral-light`;

    return (
        <div className={customerPageContainerClasses}> 
            {(() => {
                switch (customerCurrentPage) {
                    case Page.PRODUCTS: return renderProductsPage();
                    case Page.CART: return renderCartPage();
                    case Page.ORDER_DETAILS: return renderOrderDetailsPage();
                    case Page.TEMPLATES: return renderTemplatesPage();
                    case Page.VIEW_TEMPLATE_DETAILS: return renderViewTemplateDetailsPage();
                    case Page.ORDER_CONFIRMATION: return renderOrderConfirmationPage();
                    case Page.CREATE_TEMPLATE: return renderCreateTemplatePage();
                    case Page.ORDER_HISTORY: return renderOrderHistoryPage();
                    case Page.MODIFY_ORDER: return renderModifyOrderPage();
                    case Page.PROFILE: return renderProfilePage();
                    case Page.SUPPORT_TICKETS: return renderSupportTicketsPage();
                    default:
                        setCustomerCurrentPage(Page.PRODUCTS); 
                        return renderProductsPage();
                }
            })()}
        </div>
    );
  };

  const renderAdminPanelContent = () => {
    const adminPageContainerClasses = "pt-[3.5rem] flex-grow overflow-y-auto bg-neutral-lightest";
    return (
        <div className={adminPageContainerClasses}>
             {(() => {
                switch (adminCurrentPage) {
                    case Page.ADMIN_DASHBOARD: return renderAdminDashboardPage();
                    case Page.ADMIN_ORDER_MANAGEMENT: return renderAdminOrderManagementPage();
                    case Page.ADMIN_USER_MANAGEMENT: return renderAdminUserManagementPage();
                    case Page.ADMIN_PRODUCT_CATALOG: return renderAdminProductCatalogPage();
                    case Page.ADMIN_SUPPORT_TICKETS: return renderAdminSupportTicketsPage();
                    case Page.ADMIN_VIEW_ORDER_PDF: return renderAdminViewOrderPdfPage();
                    case Page.ADMIN_PRINT_ORDERS_PDF: return renderAdminPrintOrdersPdfPage();
                    default: 
                        setAdminCurrentPage(Page.ADMIN_DASHBOARD); 
                        return renderAdminDashboardPage();
                }
            })()}
        </div>
    );
  };
  
  const getPanelLayoutModeClasses = () => {
    switch(panelDisplayMode) {
      case 'customerFocus': return 'customer-focus-mode';
      case 'adminFocus': return 'admin-focus-mode';
      case 'split':
      default: return 'split-mode';
    }
  };

  const handleOpenTemplateFab = () => {
    const draftFromStaged = stagedForTemplateItems.map(p => ({ product: p, quantity: 1 }));

    let mergedDraft = [...currentDraftTemplateItems];
    draftFromStaged.forEach(stagedDraftItem => {
        if (!mergedDraft.some(existingDraft => existingDraft.product.id === stagedDraftItem.product.id)) {
            mergedDraft.push(stagedDraftItem);
        }
    });
    
    if (!editingTemplateId && currentDraftTemplateItems.length === 0 && stagedForTemplateItems.length > 0) {
        setCurrentDraftTemplateItems(draftFromStaged);
    } else if (editingTemplateId || currentDraftTemplateItems.length > 0) {
        setCurrentDraftTemplateItems(mergedDraft);
    }
    setCustomerCurrentPage(Page.CREATE_TEMPLATE);
  };
  

  const itemsForTemplateFabBadge = useMemo(() => {
    if (editingTemplateId || currentDraftTemplateItems.filter(i=>i.quantity > 0).length > 0) { 
        return currentDraftTemplateItems.filter(i=>i.quantity > 0);
    }
    return stagedForTemplateItems; 
  }, [editingTemplateId, currentDraftTemplateItems, stagedForTemplateItems]);


  const shouldShowTemplateFab = 
    (customerCurrentPage === Page.PRODUCTS && productPageMode === 'TEMPLATE' && (currentDraftTemplateItems.filter(i=>i.quantity > 0).length > 0 || productPendingTemplateQuantityProductId)) || 
    (customerCurrentPage === Page.TEMPLATES && itemsForTemplateFabBadge.length > 0 && !editingTemplateId && currentDraftTemplateItems.filter(i=>i.quantity > 0).length === 0 && !newTemplateName.trim() && currentDraftTemplateDays.length === 0 && !currentDraftTemplateShop); 

  const isCustomerNavbarVisible = 
    customerCurrentPage !== Page.CART && 
    customerCurrentPage !== Page.ORDER_DETAILS &&
    customerCurrentPage !== Page.ORDER_CONFIRMATION;
    
  const showFabButtons = panelDisplayMode !== 'adminFocus';
  const cartFabUniqueItemCount = cartProducts.length; 

  const fabBottomSpacingRem = 0.5; 
  let fabActualBottomRem = PANEL_CONTROL_BAR_HEIGHT_REM + fabBottomSpacingRem;
  if (isCustomerNavbarVisible && panelDisplayMode === 'customerFocus') {
    fabActualBottomRem += CUSTOMER_NAVBAR_HEIGHT_REM;
  }
  
  const fabStyle = panelDisplayMode !== 'customerFocus'
    ? { transform: 'translateX(calc(-50vw + 2rem))', bottom: `${PANEL_CONTROL_BAR_HEIGHT_REM + fabBottomSpacingRem}rem` }
    : { bottom: `${fabActualBottomRem}rem` };

  // Add User Modal Handlers
  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
    setNewUserForm({
      name: '',
      contactNumber: '',
      role: 'Staff',
      organization: 'Selvi Mills',
      shops: [],
      userType: 'internal'
    });
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleAddUserFormChange = (field: keyof typeof newUserForm, value: any) => {
    setNewUserForm(prev => {
      if (field === 'userType') {
        if (value === 'external') {
          return { ...prev, userType: value, organization: '', shops: [] };
        } else {
          return { ...prev, userType: value, organization: 'Selvi Mills', shops: [] };
        }
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Get selected external organization
  const selectedExternalOrg = organizations.find(org => org.name === newUserForm.organization);

  const handleAddUser = () => {
    if (!newUserForm.name.trim()) {
      alert('Please enter a user name');
      return;
    }

    if (newUserForm.userType === 'external' && !newUserForm.contactNumber.trim()) {
      alert('Please enter a contact number for external users');
      return;
    }

    if (newUserForm.userType === 'external' && newUserForm.shops.length === 0) {
      alert('Please select at least one shop for external users');
      return;
    }

    const newUserId = `user-${String(allAppUsers.length + 1).padStart(4, '0')}`;
    const newUser: AppUser = {
      id: newUserId,
      name: newUserForm.name.trim(),
      contactNumber: newUserForm.contactNumber.trim(),
      role: newUserForm.role,
      organization: newUserForm.organization,
      shops: newUserForm.shops
    };

    setAllAppUsers(prev => [...prev, newUser]);
    handleCloseAddUserModal();
    showToast(`User "${newUser.name}" added successfully`);
  };

  // Edit User Modal Handlers
  const handleOpenEditUserModal = (user: AppUser) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      contactNumber: user.contactNumber,
      role: user.role as any,
      organization: user.organization,
      shops: user.shops || [],
      userType: user.organization === 'Selvi Mills' ? 'internal' : 'external'
    });
    setIsEditUserModalOpen(true);
  };

  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setEditingUser(null);
    setEditUserForm({
      name: '',
      contactNumber: '',
      role: 'Staff',
      organization: '',
      shops: [],
      userType: 'internal'
    });
  };

  const handleEditUserFormChange = (field: keyof typeof editUserForm, value: any) => {
    setEditUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEditUser = () => {
    if (!editingUser) return;

    if (!editUserForm.name.trim()) {
      alert('Please enter a user name');
      return;
    }

    const updatedUser: AppUser = {
      ...editingUser,
      name: editUserForm.name.trim(),
      contactNumber: editUserForm.contactNumber.trim(),
      role: editUserForm.role,
      organization: editUserForm.organization,
      shops: editUserForm.shops
    };

    setAllAppUsers(prev => prev.map(user => user.id === editingUser.id ? updatedUser : user));
    handleCloseEditUserModal();
    showToast(`User "${updatedUser.name}" updated successfully`);
  };

  // Add Organization Modal handlers
  const handleCloseAddOrganizationModal = () => {
    setIsAddOrganizationModalOpen(false);
    setNewOrganizationForm({
      name: '',
      type: 'external'
    });
  };

  const handleOrganizationFormChange = (field: keyof typeof newOrganizationForm, value: any) => {
    setNewOrganizationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddOrganization = () => {
    if (!newOrganizationForm.name.trim()) {
      showToast('Organization name is required!');
      return;
    }

    // Check if organization already exists
    if (organizations.some(org => org.name.toLowerCase() === newOrganizationForm.name.toLowerCase())) {
      showToast('Organization already exists!');
      return;
    }

    // Generate new organization ID
    const newOrgId = `org-${organizations.length + 1}`;

    // Create new organization
    const newOrganization = {
      id: newOrgId,
      name: newOrganizationForm.name,
      type: newOrganizationForm.type,
      shops: []
    };

    // Add to organizations
    setOrganizations(prev => [...prev, newOrganization]);

    // Show success message
    showToast(`${newOrganizationForm.type === 'internal' ? 'Internal organization' : 'External customer'} "${newOrganizationForm.name}" added successfully!`);

    // Close modal and reset form
    handleCloseAddOrganizationModal();
  };

  // Add Shop Modal handlers
  const handleOpenAddShopModal = (orgId: string) => {
    setSelectedOrgForShop(orgId);
    setIsAddShopModalOpen(true);
  };

  const handleCloseAddShopModal = () => {
    setIsAddShopModalOpen(false);
    setSelectedOrgForShop('');
    setAddShopCurrentStep(1);
    setNewShopForm({
      name: '',
      address: '',
      shipmentRegion: '',
      paymentTerms: '',
      amountLimit: '',
      packaging: {
        palletType: '',
        labelType: '',
        packagingType: '',
        weightType: ''
      },
      parkingUnloading: {
        notes: ''
      },
      delivery: {
        openTime: '',
        closeTime: '',
        deliverAfter: '',
        deliverBefore: '',
        closedOn: []
      }
    });
    setShopRegionSearchQuery('');
  };

  const handleShopFormChange = (field: keyof typeof newShopForm, value: any) => {
    setNewShopForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddShop = () => {
    if (!newShopForm.name.trim()) {
      showToast('Shop name is required!');
      return;
    }

    if (!newShopForm.address.trim()) {
      showToast('Shop address is required!');
      return;
    }

    if (!newShopForm.shipmentRegion.trim()) {
      showToast('Shipment region is required!');
      return;
    }

    if (!newShopForm.paymentTerms.trim()) {
      showToast('Payment terms are required!');
      return;
    }

    if (newShopForm.paymentTerms === 'Amount Limit' && (!newShopForm.amountLimit.trim() || isNaN(parseFloat(newShopForm.amountLimit)))) {
      showToast('Valid amount limit is required!');
      return;
    }

    // Find the organization
    const orgIndex = organizations.findIndex(org => org.id === selectedOrgForShop);
    if (orgIndex === -1) {
      showToast('Organization not found!');
      return;
    }

    // Generate new shop ID
    const allShopIds = organizations.flatMap(org => (org.shops || []).map(shop => shop.id));
    const maxShopNumber = Math.max(...allShopIds.map(id => parseInt(id.split('-')[1]) || 0));
    const newShopId = `shop-${maxShopNumber + 1}`;

    // Create new shop
    const newShop = {
      id: newShopId,
      name: newShopForm.name,
      details: `${newShopForm.name} Location`,
      address: newShopForm.address,
      shipmentRegion: newShopForm.shipmentRegion,
      paymentTerms: newShopForm.paymentTerms === 'Amount Limit' ? `Amount Limit: $${newShopForm.amountLimit}` : newShopForm.paymentTerms,
      primaryContact: organizations[orgIndex].type === 'external' ? '+65 8468 2040 (Mani)' : '',
      packaging: newShopForm.packaging,
      parkingUnloading: newShopForm.parkingUnloading,
      delivery: newShopForm.delivery,
      roles: {
        Manager: { name: 'Not assigned', contact: 'N/A' },
        'PIC of Payments': { name: 'Not assigned', contact: 'N/A' },
        'PIC of Ordering': { name: 'Not assigned', contact: 'N/A' }
      },
      internalBillingHold: false
    };

    // Update organization
    const updatedOrganizations = [...organizations];
    if (!updatedOrganizations[orgIndex].shops) {
      updatedOrganizations[orgIndex].shops = [];
    }
    updatedOrganizations[orgIndex].shops.push(newShop);

    setOrganizations(updatedOrganizations);
    showToast(`Shop "${newShopForm.name}" added successfully!`);
    handleCloseAddShopModal();
  };

  // Edit Shop Modal handlers
  const handleOpenEditShopModal = (shop: any, orgId: string) => {
    setEditingShop({ ...shop, orgId });
    
    // Parse payment terms for editing
    let paymentTerms = shop.paymentTerms || '';
    let amountLimit = '';
    if (paymentTerms.startsWith('Amount Limit: $')) {
      amountLimit = paymentTerms.replace('Amount Limit: $', '');
      paymentTerms = 'Amount Limit';
    }
    
    setEditShopForm({
      name: shop.name,
      address: shop.address || '',
      shipmentRegion: shop.shipmentRegion || '',
      paymentTerms: paymentTerms,
      amountLimit: amountLimit,
      customerType: shop.customerType || '',
      packaging: shop.packaging || {
        palletType: '',
        labelType: '',
        packagingType: '',
        weightType: ''
      },
      parkingUnloading: shop.parkingUnloading || {
        notes: ''
      },
      delivery: shop.delivery || {
        openTime: '',
        closeTime: '',
        deliverAfter: '',
        deliverBefore: '',
        closedOn: []
      }
    });
    setIsEditShopModalOpen(true);
  };

  const handleCloseEditShopModal = () => {
    setIsEditShopModalOpen(false);
    setEditingShop(null);
    setEditShopCurrentStep(1);
    setEditShopForm({
      name: '',
      address: '',
      shipmentRegion: '',
      paymentTerms: '',
      amountLimit: '',
      customerType: '',
      packaging: {
        palletType: '',
        labelType: '',
        packagingType: '',
        weightType: ''
      },
      parkingUnloading: {
        notes: ''
      },
      delivery: {
        openTime: '',
        closeTime: '',
        deliverAfter: '',
        deliverBefore: '',
        closedOn: []
      }
    });
    setEditShopRegionSearchQuery('');
  };

  const handleEditShopFormChange = (field: keyof typeof editShopForm, value: any) => {
    setEditShopForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Shop Organization Management handlers
  const handleOpenShopOrgManagementModal = (shop: any, currentOrgId: string, action: 'move' | 'remove') => {
    setShopOrgManagementData({ shop, currentOrgId, action });
    setShopOrgForm({
      targetOrgId: '',
      removalReason: '',
      customReason: ''
    });
    setIsShopOrgManagementModalOpen(true);
  };

  const handleCloseShopOrgManagementModal = () => {
    setIsShopOrgManagementModalOpen(false);
    setShopOrgManagementData(null);
    setShopOrgForm({
      targetOrgId: '',
      removalReason: '',
      customReason: ''
    });
  };

  const handleShopOrgFormChange = (field: keyof typeof shopOrgForm, value: string) => {
    setShopOrgForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Internal Billing Hold handlers
  const handleOpenBillingHoldModal = (shop: any, orgId: string, action: 'enable' | 'disable') => {
    setBillingHoldAction({ shop, orgId, action });
    setIsBillingHoldModalOpen(true);
  };

  const handleCloseBillingHoldModal = () => {
    setIsBillingHoldModalOpen(false);
    setBillingHoldAction(null);
  };

  const handleConfirmBillingHold = () => {
    if (!billingHoldAction) return;

    const { shop, orgId, action } = billingHoldAction;
    
    // Find the organization and shop
    const updatedOrganizations = [...organizations];
    const orgIndex = updatedOrganizations.findIndex(org => org.id === orgId);
    if (orgIndex !== -1) {
      const shopIndex = updatedOrganizations[orgIndex].shops.findIndex(s => s.id === shop.id);
      if (shopIndex !== -1) {
        // Update the shop's internal billing hold status
        updatedOrganizations[orgIndex].shops[shopIndex] = {
          ...updatedOrganizations[orgIndex].shops[shopIndex],
          internalBillingHold: action === 'enable'
        };
        
        setOrganizations(updatedOrganizations);
        showToast(`Internal billing hold ${action === 'enable' ? 'enabled' : 'disabled'} for ${shop.name}`);
      }
    }
    
    // Also handle unlinked shops
    const updatedUnlinkedShops = [...unlinkedShops];
    const unlinkedShopIndex = updatedUnlinkedShops.findIndex(s => s.id === shop.id);
    if (unlinkedShopIndex !== -1) {
      updatedUnlinkedShops[unlinkedShopIndex] = {
        ...updatedUnlinkedShops[unlinkedShopIndex],
        internalBillingHold: action === 'enable'
      };
      setUnlinkedShops(updatedUnlinkedShops);
      showToast(`Internal billing hold ${action === 'enable' ? 'enabled' : 'disabled'} for ${shop.name}`);
    }
    
    handleCloseBillingHoldModal();
  };

  const handleSaveShopOrgManagement = () => {
    if (!shopOrgManagementData) return;

    const { shop, currentOrgId, action } = shopOrgManagementData;

    if (action === 'move') {
      if (!shopOrgForm.targetOrgId) {
        showToast('Please select a target organization!');
        return;
      }

      // Move shop from current org to target org
      const updatedOrganizations = [...organizations];
      
      // Remove from current organization
      const currentOrgIndex = updatedOrganizations.findIndex(org => org.id === currentOrgId);
      if (currentOrgIndex !== -1) {
        updatedOrganizations[currentOrgIndex].shops = updatedOrganizations[currentOrgIndex].shops?.filter(s => s.id !== shop.id) || [];
      }

      // Add to target organization
      const targetOrgIndex = updatedOrganizations.findIndex(org => org.id === shopOrgForm.targetOrgId);
      if (targetOrgIndex !== -1) {
        if (!updatedOrganizations[targetOrgIndex].shops) {
          updatedOrganizations[targetOrgIndex].shops = [];
        }
        updatedOrganizations[targetOrgIndex].shops.push(shop);
      }

      // If this is a re-linking from unlinked shops, remove from unlinked shops
      if (!currentOrgId) {
        setUnlinkedShops(prev => prev.filter(s => s.id !== shop.id));
      }

      setOrganizations(updatedOrganizations);
      showToast(`Shop "${shop.name}" moved successfully!`);
    } else if (action === 'remove') {
      if (!shopOrgForm.removalReason) {
        showToast('Please select a removal reason!');
        return;
      }

      if (shopOrgForm.removalReason === 'Others' && !shopOrgForm.customReason.trim()) {
        showToast('Please provide a custom reason!');
        return;
      }

      // Remove shop from organization and add to unlinked shops
      const updatedOrganizations = [...organizations];
      
      // Remove from current organization
      const currentOrgIndex = updatedOrganizations.findIndex(org => org.id === currentOrgId);
      if (currentOrgIndex !== -1) {
        updatedOrganizations[currentOrgIndex].shops = updatedOrganizations[currentOrgIndex].shops?.filter(s => s.id !== shop.id) || [];
      }

      // Add removal metadata to shop
      const shopWithRemovalInfo = {
        ...shop,
        removalReason: shopOrgForm.removalReason,
        customRemovalReason: shopOrgForm.removalReason === 'Others' ? shopOrgForm.customReason : undefined,
        removedAt: new Date().toISOString()
      };

      // Add to unlinked shops (we'll create this as a separate array)
      setUnlinkedShops(prev => [...prev, shopWithRemovalInfo]);
      setOrganizations(updatedOrganizations);
      
      const reasonText = shopOrgForm.removalReason === 'Others' ? shopOrgForm.customReason : shopOrgForm.removalReason;
      showToast(`Shop "${shop.name}" removed from organization. Reason: ${reasonText}`);
    }

    handleCloseShopOrgManagementModal();
  };

  const handleSaveEditShop = () => {
    if (!editShopForm.name.trim()) {
      showToast('Shop name is required!');
      return;
    }

    if (!editShopForm.address.trim()) {
      showToast('Shop address is required!');
      return;
    }

    if (!editShopForm.shipmentRegion.trim()) {
      showToast('Shipment region is required!');
      return;
    }

    if (!editShopForm.paymentTerms.trim()) {
      showToast('Payment terms are required!');
      return;
    }

    if (editShopForm.paymentTerms === 'Amount Limit' && (!editShopForm.amountLimit.trim() || isNaN(parseFloat(editShopForm.amountLimit)))) {
      showToast('Valid amount limit is required!');
      return;
    }

    // Find the organization and shop
    const orgIndex = organizations.findIndex(org => org.id === editingShop.orgId);
    if (orgIndex === -1) {
      showToast('Organization not found!');
      return;
    }

    const shopIndex = organizations[orgIndex].shops.findIndex(shop => shop.id === editingShop.id);
    if (shopIndex === -1) {
      showToast('Shop not found!');
      return;
    }

    // Update shop
    const updatedOrganizations = [...organizations];
    updatedOrganizations[orgIndex].shops[shopIndex] = {
      ...updatedOrganizations[orgIndex].shops[shopIndex],
      name: editShopForm.name,
      address: editShopForm.address,
      shipmentRegion: editShopForm.shipmentRegion,
      paymentTerms: editShopForm.paymentTerms === 'Amount Limit' ? `Amount Limit: $${editShopForm.amountLimit}` : editShopForm.paymentTerms,
      customerType: editShopForm.customerType,
      packaging: editShopForm.packaging,
      parkingUnloading: editShopForm.parkingUnloading,
      delivery: editShopForm.delivery,
      details: `${editShopForm.name} Location`
    };

    setOrganizations(updatedOrganizations);
    showToast(`Shop "${editShopForm.name}" updated successfully!`);
    handleCloseEditShopModal();
  };

  return (
    <div className="font-sans bg-neutral-light app-container">
      {toastText && (
        <div 
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 bg-neutral-darker text-white px-4 py-3 rounded-lg shadow-xl z-[100] transition-all duration-${TOAST_FADE_ANIMATION_DURATION} ease-out-cubic
            ${animateToastIn ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 translate-y-[-20px] sm:translate-y-0 sm:translate-x-[20px]'}`}
          role="alert"
          aria-live="assertive"
        >
          {toastText}
        </div>
      )}

      {isCreateTicketModalOpen && orderForTicketCreation && (
        <CreateTicketModal
            isOpen={isCreateTicketModalOpen}
            onClose={handleCloseCreateTicketModal}
            order={orderForTicketCreation}
            onSaveTicket={handleSaveSupportTicket}
            products={products}
        />
      )}

      {isViewTicketModalOpen && ticketToView && orderForTicketCreation && (
        <ViewTicketModal
            isOpen={isViewTicketModalOpen}
            onClose={handleCloseViewTicketModal}
            ticket={ticketToView}
            orderItems={orderForTicketCreation.items} 
            allProducts={products} 
            formatDate={formatDateForDisplay}
        />
      )}

      {isViewIssueModalOpen && issueToView && (
        <ViewIssueModal
            isOpen={isViewIssueModalOpen}
            onClose={() => {
                setIsViewIssueModalOpen(false);
                setIssueToView(null);
            }}
            issue={issueToView}
            orderItems={orders.find(order => order.id === issueToView.orderId)?.items || []} 
            allProducts={products} 
            formatDate={formatDateForDisplay}
        />
      )}

      <Modal
        isOpen={isDiscardConfirmModalOpen}
        onClose={() => setIsDiscardConfirmModalOpen(false)}
        title="Confirm Discard"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDiscardConfirmModalOpen(false)} className="text-neutral-darker">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDiscardDraft}>
              Discard
            </Button>
          </>
        }
      >
        <p className="text-neutral-darker">Are you sure you want to discard this draft? All unsaved changes will be lost.</p>
      </Modal>

       <Modal 
        isOpen={isAddShippingAddressModalOpen}
        onClose={() => {
            setIsAddShippingAddressModalOpen(false);
            setCustomShippingAddressInput({ line1: '', unitNo: '', postalCode: '' });
            if (shippingAddressModalContext === 'shipping' && (selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) {
                const previousValidAddress = availableShippingAddresses.find(
                    addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE
                ) || DEFAULT_SHIPPING_ADDRESS_1;
                setSelectedShippingAddressOption(previousValidAddress);
            } else if (shippingAddressModalContext === 'billing' && (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedBillingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) {
                 const previousValidAddress = availableShippingAddresses.find(
                    addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE && addr !== selectedShippingAddressOption
                ) || billingAddressOptions.find(addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE) || DEFAULT_SHIPPING_ADDRESS_1;
                setSelectedBillingAddressOption(previousValidAddress);
            }
        }}
        title="Add New Shipping Address"
        footer={
          <>
            <Button variant="ghost" className="text-neutral-darker" onClick={() => {
                 setIsAddShippingAddressModalOpen(false);
                 setCustomShippingAddressInput({ line1: '', unitNo: '', postalCode: '' });
                 if (shippingAddressModalContext === 'shipping' && (selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) {
                     const previousValidAddress = availableShippingAddresses.find(
                         addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE
                     ) || DEFAULT_SHIPPING_ADDRESS_1;
                     setSelectedShippingAddressOption(previousValidAddress);
                 } else if (shippingAddressModalContext === 'billing' && (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedBillingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE)) {
                     const previousValidAddress = availableShippingAddresses.find(
                         addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE && addr !== selectedShippingAddressOption
                     ) || billingAddressOptions.find(addr => addr !== ADD_NEW_ADDRESS_DISPLAY_TEXT && addr !== ADD_NEW_ADDRESS_OPTION_VALUE) || DEFAULT_SHIPPING_ADDRESS_1;
                     setSelectedBillingAddressOption(previousValidAddress);
                 }
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCustomShippingAddress}>
              Save Shipping Address
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="addrLine1" className="block text-sm font-medium text-neutral-dark mb-1">Address Line 1</label>
            <input
              type="text"
              id="addrLine1"
              value={customShippingAddressInput.line1}
              onChange={(e) => setCustomShippingAddressInput(prev => ({ ...prev, line1: e.target.value }))}
              placeholder="e.g., Blk 123, Street Name"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>
          <div>
            <label htmlFor="unitNo" className="block text-sm font-medium text-neutral-dark mb-1">Unit No.</label>
            <div className="flex items-center">
                <span className="px-3 py-2 border border-r-0 border-neutral-DEFAULT bg-neutral-light text-neutral-dark rounded-l-lg">#</span>
                <input
                type="text"
                id="unitNo"
                value={customShippingAddressInput.unitNo}
                onChange={(e) => setCustomShippingAddressInput(prev => ({ ...prev, unitNo: e.target.value }))}
                placeholder="e.g., 01-01"
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-r-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
            </div>
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-dark mb-1">Postal Code</label>
             <div className="flex items-center">
                <span className="px-3 py-2 border border-r-0 border-neutral-DEFAULT bg-neutral-light text-neutral-dark rounded-l-lg">Singapore</span>
                <input
                type="text" 
                inputMode="numeric"
                id="postalCode"
                value={customShippingAddressInput.postalCode}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); 
                    if (val.length <= 6) {
                        setCustomShippingAddressInput(prev => ({ ...prev, postalCode: val }));
                    }
                }}
                placeholder="e.g., 123456"
                maxLength={6}
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-r-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddContactInfoModalOpen}
        onClose={() => {
            setIsAddContactInfoModalOpen(false);
            setCustomContactInfoInput({ name: '', number: '', countryCode: DEFAULT_CONTACT_COUNTRY_CODE });
            if (selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT || selectedContactInfoOption === ADD_NEW_CONTACT_OPTION_VALUE) {
                const previousValidContact = availableContactInfos.find(
                    contact => contact !== ADD_NEW_CONTACT_DISPLAY_TEXT && contact !== ADD_NEW_CONTACT_OPTION_VALUE
                ) || DEFAULT_CONTACT_INFO_STRING;
                setSelectedContactInfoOption(previousValidContact);
            }
        }}
        title="Add New Contact Information"
        footer={
          <>
            <Button variant="ghost" className="text-neutral-darker" onClick={() => {
                setIsAddContactInfoModalOpen(false);
                setCustomContactInfoInput({ name: '', number: '', countryCode: DEFAULT_CONTACT_COUNTRY_CODE });
                 if (selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT || selectedContactInfoOption === ADD_NEW_CONTACT_OPTION_VALUE) {
                    const previousValidContact = availableContactInfos.find(
                        contact => contact !== ADD_NEW_CONTACT_DISPLAY_TEXT && contact !== ADD_NEW_CONTACT_OPTION_VALUE
                    ) || DEFAULT_CONTACT_INFO_STRING;
                    setSelectedContactInfoOption(previousValidContact);
                }
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCustomContactInfo}>
              Save Contact
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-neutral-dark mb-1">Contact Name</label>
            <input
              type="text"
              id="contactName"
              value={customContactInfoInput.name}
              onChange={(e) => setCustomContactInfoInput(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., John Doe"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>
          <div>
            <label htmlFor="contactNumberInput" className="block text-sm font-medium text-neutral-dark mb-1">Contact Number (Whatsapp)</label>
            <div className="flex">
                <select 
                    value={customContactInfoInput.countryCode}
                    onChange={(e) => setCustomContactInfoInput(prev => ({ ...prev, countryCode: e.target.value as CountryCode }))}
                    className="px-2 py-2 border border-r-0 border-neutral-DEFAULT bg-neutral-light text-neutral-dark rounded-l-lg focus:ring-primary focus:border-primary"
                >
                    {CountryCodes.map((country: CountryInfo) => (
                        <option key={country.code} value={country.code} className="text-neutral-darker">{country.name}</option>
                    ))}
                </select>
                <input
                    type="tel"
                    id="contactNumberInput"
                    value={customContactInfoInput.number}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCustomContactInfoInput(prev => ({ ...prev, number: val }));
                    }}
                    placeholder="e.g., 91234567"
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-r-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isOrderConfirmModalOpen}
        onClose={() => setIsOrderConfirmModalOpen(false)}
        title="Confirm Your Order"
        footer={
          <>
            <Button variant="ghost" className="text-neutral-darker" onClick={() => setIsOrderConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={() => {
              handleCreateOrder();
              setIsOrderConfirmModalOpen(false);
            }}>
              Place Order
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-neutral-darker break-words">
            <p className="text-lg"><strong>Shop:</strong> {selectedOrderShopLocation}</p>
            <p className="text-lg">
                <strong>Shipping Address:</strong> 
                {selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE 
                    ? <span className="text-red-600 italic">Invalid Shipping Address</span> 
                    : selectedShippingAddressOption}
            </p>
             <p className="text-lg">
                <strong>Billing Address:</strong> 
                {isBillingSameAsShipping 
                    ? (selectedShippingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedShippingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE ? <span className="text-red-600 italic">Invalid Shipping Address</span> : selectedShippingAddressOption)
                    : (selectedBillingAddressOption === ADD_NEW_ADDRESS_DISPLAY_TEXT || selectedBillingAddressOption === ADD_NEW_ADDRESS_OPTION_VALUE ? <span className="text-red-600 italic">Invalid Billing Address</span> : selectedBillingAddressOption)}
            </p>
             <p className="text-lg">
                <strong>Contact:</strong> 
                {selectedContactInfoOption === ADD_NEW_CONTACT_DISPLAY_TEXT || selectedContactInfoOption === ADD_NEW_CONTACT_OPTION_VALUE 
                    ? <span className="text-red-600 italic">Invalid Contact Info</span> 
                    : selectedContactInfoOption}
            </p>
             <p className="text-lg">
                <strong>Estimated Total:</strong> <span className="font-bold text-primary">${totalCartPrice.toFixed(2)}</span>
             </p>
             <p className="text-sm text-neutral-dark mt-4">Press 'Place Order' to confirm.</p>
        </div>
      </Modal>

      <Modal 
        isOpen={isUpdateOrdersModalOpen}
        onClose={() => setIsUpdateOrdersModalOpen(false)}
        title={`Bulk Update ${adminSelectedOrderIds.length} Order(s)`}
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsUpdateOrdersModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveUpdatedOrders}>Save Updates</Button>
            </>
        }
      >
        <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto p-1">
            <p className="text-xs text-neutral-dark">Select the checkbox for each field you want to update for the selected orders.</p>
            
            {/* Shipping Date */}
            <div className="flex items-start space-x-3">
                <input type="checkbox" id="applyShippingDate" checked={applyUpdateFlags.shippingDate} onChange={e => setApplyUpdateFlags(f => ({...f, shippingDate: e.target.checked}))} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light mt-1"/>
                <div className="flex-grow">
                    <label htmlFor="applyShippingDate" className="font-medium text-neutral-darker">Shipping Date</label>
                    <DatePicker 
                        selectedDate={updateFieldsState.shippingDate}
                        onChange={(date) => setUpdateFieldsState(s => ({...s, shippingDate: date}))}
                        minDate={new Date()}
                        id="bulk-update-shipping-date"
                        showClearButton={true}
                    />
                </div>
            </div>

             {/* Billed In Insmart By */}
            <div className="flex items-start space-x-3">
                <input type="checkbox" id="applyBilledBy" checked={applyUpdateFlags.billedBy} onChange={e => setApplyUpdateFlags(f => ({...f, billedBy: e.target.checked}))} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light mt-1"/>
                <div className="flex-grow">
                     <label htmlFor="applyBilledBy" className="font-medium text-neutral-darker">Billed In Insmart By</label>
                    <select value={updateFieldsState.billedBy} onChange={e => setUpdateFieldsState(s => ({...s, billedBy: e.target.value as AdminStaffName}))} className="mt-1 w-full p-2 border border-neutral-DEFAULT rounded-md bg-white">
                        {AdminStaffNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            </div>
            
             {/* Status */}
            <div className="flex items-start space-x-3">
                <input type="checkbox" id="applyStatus" checked={applyUpdateFlags.status} onChange={e => setApplyUpdateFlags(f => ({...f, status: e.target.checked}))} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light mt-1"/>
                <div className="flex-grow">
                     <label htmlFor="applyStatus" className="font-medium text-neutral-darker">Status</label>
                    <select value={updateFieldsState.status} onChange={e => setUpdateFieldsState(s => ({...s, status: e.target.value as OrderStatus}))} className="mt-1 w-full p-2 border border-neutral-DEFAULT rounded-md bg-white">
                        {ADMIN_ORDER_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
            </div>
            
             {/* Packed By */}
            <div className="flex items-start space-x-3">
                <input type="checkbox" id="applyPackedBy" checked={applyUpdateFlags.packedBy} onChange={e => setApplyUpdateFlags(f => ({...f, packedBy: e.target.checked}))} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light mt-1"/>
                <div className="flex-grow">
                     <label htmlFor="applyPackedBy" className="font-medium text-neutral-darker">Packed By</label>
                    <select value={updateFieldsState.packedBy} onChange={e => setUpdateFieldsState(s => ({...s, packedBy: e.target.value as AdminStaffNamePackedBy}))} className="mt-1 w-full p-2 border border-neutral-DEFAULT rounded-md bg-white">
                        {AdminStaffNamesPackedBy.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            </div>

            {/* Delivered By */}
            <div className="flex items-start space-x-3">
                <input type="checkbox" id="applyDeliveredBy" checked={applyUpdateFlags.deliveredBy} onChange={e => setApplyUpdateFlags(f => ({...f, deliveredBy: e.target.checked}))} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light mt-1"/>
                <div className="flex-grow">
                     <label htmlFor="applyDeliveredBy" className="font-medium text-neutral-darker">Delivered By</label>
                    <select value={updateFieldsState.deliveredBy} onChange={e => setUpdateFieldsState(s => ({...s, deliveredBy: e.target.value as AdminStaffNameDeliveredBy}))} className="mt-1 w-full p-2 border border-neutral-DEFAULT rounded-md bg-white">
                        {AdminStaffNamesDeliveredBy.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            </div>

             {/* Customer Type */}
            <div className="flex items-start space-x-3">
                <input type="checkbox" id="applyCustomerType" checked={applyUpdateFlags.customerType} onChange={e => setApplyUpdateFlags(f => ({...f, customerType: e.target.checked}))} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary-light mt-1"/>
                <div className="flex-grow">
                     <label htmlFor="applyCustomerType" className="font-medium text-neutral-darker">Customer Type</label>
                    <select value={updateFieldsState.customerType} onChange={e => setUpdateFieldsState(s => ({...s, customerType: e.target.value as CustomerType}))} className="mt-1 w-full p-2 border border-neutral-DEFAULT rounded-md bg-white">
                        {CustomerTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>

        </div>
      </Modal>

      <Modal
        isOpen={isColumnSelectModalOpen}
        onClose={() => setIsColumnSelectModalOpen(false)}
        title="Customize Columns"
        footer={
            <Button variant="primary" onClick={() => setIsColumnSelectModalOpen(false)}>Done</Button>
        }
      >
        <div className="space-y-2 max-h-80 overflow-y-auto">
            {ALL_ADMIN_ORDER_TABLE_COLUMNS.filter(col => col.id !== 'select').map(colConfig => (
                <label key={colConfig.id} className="flex items-center space-x-3 p-2 hover:bg-neutral-light rounded-md cursor-pointer">
                    <input 
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light"
                        checked={visibleAdminOrderColumns.includes(colConfig.id)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setVisibleAdminOrderColumns(prev => [...prev, colConfig.id]);
                            } else {
                                setVisibleAdminOrderColumns(prev => prev.filter(id => id !== colConfig.id));
                            }
                        }}
                    />
                    <span className="text-neutral-darker">{colConfig.label}</span>
                </label>
            ))}
        </div>
      </Modal>

      {/* Product Columns Modal */}
      <Modal
        isOpen={isProductColumnSelectModalOpen}
        onClose={() => setIsProductColumnSelectModalOpen(false)}
        title="Customize Product Columns"
        footer={
            <Button variant="primary" onClick={() => setIsProductColumnSelectModalOpen(false)}>Done</Button>
        }
      >
        <div className="space-y-2 max-h-80 overflow-y-auto">
            {ALL_ADMIN_PRODUCT_TABLE_COLUMNS.filter(col => col.id !== 'select').map(colConfig => (
                <label key={colConfig.id} className="flex items-center space-x-3 p-2 hover:bg-neutral-light rounded-md cursor-pointer">
                    <input 
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light"
                        checked={visibleAdminProductColumns.includes(colConfig.id)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setVisibleAdminProductColumns(prev => [...prev, colConfig.id]);
                            } else {
                                setVisibleAdminProductColumns(prev => prev.filter(id => id !== colConfig.id));
                            }
                        }}
                    />
                    <span className="text-neutral-darker">{colConfig.label}</span>
                </label>
            ))}
        </div>
      </Modal>

       <Modal
            isOpen={isQuickUpdateShippingDateModalOpen}
            onClose={() => setIsQuickUpdateShippingDateModalOpen(false)}
            title={`Update Shipping Date for ${adminSelectedOrderIds.length} Order(s)`}
            footer={
                <>
                    <Button variant="ghost" onClick={() => setIsQuickUpdateShippingDateModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveQuickUpdateShippingDate}>
                        {quickShippingDateToUpdate ? 'Apply Date' : 'Clear Dates'}
                    </Button>
                </>
            }
        >
            <DatePicker
                label="Select a new shipping date (or clear existing dates):"
                selectedDate={quickShippingDateToUpdate}
                onChange={(date) => setQuickShippingDateToUpdate(date)}
                minDate={new Date()}
                id="quick-update-shipping-date"
                showClearButton={true}
            />
        </Modal>

        {/* Shipping Date Confirmation Modal */}
        <Modal
            isOpen={isShippingDateConfirmModalOpen}
            onClose={handleShippingDateConfirmCancel}
            title="Shipping Date Confirmation"
            footer={
                <>
                    <Button variant="ghost" onClick={handleShippingDateConfirmCancel}>Let me check first</Button>
                    <Button variant="primary" onClick={handleShippingDateConfirmProceed}>Proceed with selected date</Button>
                </>
            }
        >
            <div className="space-y-3">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md">
                    <div className="flex items-start">
                        <Icon name="info" className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Early Shipment Warning</p>
                            <p className="text-sm mt-1">
                                Shipping Date selected is before Customer Invoice Request Date. Please only proceed if you have called and confirmed early shipment with <strong>{shippingDateConfirmData?.shopName}</strong>!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        {/* Pending Modification Request Modal */}
        <Modal
            isOpen={isPendingModificationModalOpen}
            onClose={handlePendingModificationCancel}
            title="Cannot View PDF Invoice"
            footer={
                <>
                    <Button variant="ghost" onClick={handlePendingModificationCancel}>Cancel</Button>
                    <Button variant="primary" onClick={handlePendingModificationCheckNow}>Check now</Button>
                </>
            }
        >
            <div className="space-y-3">
                <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-3 rounded-md">
                    <div className="flex items-start">
                        <Icon name="info" className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Pending Modification Request(s)</p>
                            <p className="text-sm mt-1">
                                Order have pending modification request(s).
                            </p>
                        </div>
                    </div>
                </div>
                <p className="text-neutral-darker text-sm">
                    The PDF invoice cannot be viewed while there are pending modification requests for this order. 
                    Please process all modification requests first to ensure the invoice reflects the most accurate information.
                </p>
                {pendingModificationOrder && (() => {
                    const changesCount = calculatePendingChangesCount(pendingModificationOrder);
                    return (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3">
                            <p className="text-sm"><strong>Order:</strong> #{pendingModificationOrder.id}</p>
                            <p className="text-sm"><strong>Pending Changes:</strong> {changesCount} {changesCount === 1 ? 'change' : 'changes'}</p>
                        </div>
                    );
                })()}
            </div>
        </Modal>

        <Modal
            isOpen={isAssignmentPriorityModalOpen}
            onClose={() => {
                setIsAssignmentPriorityModalOpen(false);
                setAssignmentPriorityModalInfo(null);
            }}
            title="Assignment Priority Alert"
            footer={
                <>
                    <Button variant="ghost" onClick={() => {
                        setIsAssignmentPriorityModalOpen(false);
                        setAssignmentPriorityModalInfo(null);
                    }}>Cancel</Button>
                    <Button variant="secondary" onClick={() => {
                        if (!assignmentPriorityModalInfo || !assignmentPriorityModalInfo.orderForPrompt) return;
                        
                         _performAssignment([assignmentPriorityModalInfo.orderForPrompt.id], assignmentPriorityModalInfo.originalAssignmentArgs.biller);
                         setAdminSelectedOrderIds([]);
                         setIsAssignmentPriorityModalOpen(false);
                         setAssignmentPriorityModalInfo(null);

                    }}>{`Assign Priority Order #${assignmentPriorityModalInfo?.orderForPrompt.id} Instead`}</Button>
                    <Button variant="primary" onClick={() => {
                        if (!assignmentPriorityModalInfo) return;
                        const { targetOrderIds, biller, isBulkUpdate, bulkUpdateFields, bulkUpdateFlags } = assignmentPriorityModalInfo.originalAssignmentArgs;
                        
                        if (isBulkUpdate) {
                            performBulkUpdate(targetOrderIds, bulkUpdateFields, bulkUpdateFlags);
                        } else {
                            _performAssignment(targetOrderIds, biller);
                        }
                        setAdminSelectedOrderIds([]);
                        setIsAssignmentPriorityModalOpen(false);
                        setAssignmentPriorityModalInfo(null);

                    }}>Continue & Assign My Order(s)</Button>
                </>
            }
        >
            <div className="space-y-3">
                <p className="text-neutral-darker">You are trying to assign an order to <strong>{assignmentPriorityModalInfo?.originalAssignmentArgs.biller}</strong>, but there is a higher priority order awaiting assignment.</p>
                {assignmentPriorityModalInfo?.orderForPrompt && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md">
                        <p className="font-bold">Priority Order: #{assignmentPriorityModalInfo.orderForPrompt.id}</p>
                        <p>Shipment Schedule: {getShipmentSchedule(assignmentPriorityModalInfo.orderForPrompt)}</p>
                        <p>Shipping Date: {formatSimpleDate(assignmentPriorityModalInfo.orderForPrompt.shippingDate)}</p>
                    </div>
                )}
                <p className="text-neutral-darker">Please assign the higher priority order first, or confirm to proceed with your current selection.</p>
            </div>
        </Modal>

        {/* Driver Assignment Modal */}
        <Modal
            isOpen={isDriverAssignmentModalOpen}
            onClose={handleCloseDriverAssignmentModal}
            title={`Assign Driver to ${adminSelectedOrderIds.length} Order(s)`}
            footer={
                <>
                    <Button variant="ghost" onClick={handleCloseDriverAssignmentModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveDriverAssignment}>Assign Driver</Button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-neutral-dark text-sm">Which driver should be assigned to deliver these orders?</p>
                <div className="grid grid-cols-2 gap-3">
                    {AdminStaffNamesDeliveredBy.map(driverName => (
                        <button
                            key={driverName}
                            onClick={() => setSelectedDriverForAssignment(driverName)}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${
                                selectedDriverForAssignment === driverName
                                    ? 'border-primary bg-primary-light text-primary-darker'
                                    : 'border-neutral-DEFAULT hover:border-primary-light hover:bg-neutral-lightest'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <Icon name="user" className="w-4 h-4" />
                                <span className="font-medium">{driverName}</span>
                            </div>
                        </button>
                    ))}
                </div>
                {selectedDriverForAssignment && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-green-800 text-sm">
                            <Icon name="checkCircle" className="w-4 h-4 inline mr-1" />
                            Selected: <strong>{selectedDriverForAssignment}</strong>
                        </p>
                    </div>
                )}
            </div>
        </Modal>

      <main className={`side-by-side-layout ${getPanelLayoutModeClasses()}`}>
            <div className="customer-panel">
                {renderCustomerPanelContent()}
                {isCustomerNavbarVisible && <Navbar currentPage={customerCurrentPage} onNavigate={handleCustomerNavigate} />}
            </div>
            <div className="admin-panel">
                <AdminNavbar currentPage={adminCurrentPage} onNavigate={handleAdminNavigate} />
                {renderAdminPanelContent()}
        </div>
      </main>

      {showFabButtons && (
         <div className="fixed z-40 right-4 sm:right-6" style={fabStyle}>
            <div className="flex flex-col items-end space-y-3">
                {shouldShowTemplateFab && (
                    <Button
                        variant="secondary"
                        onClick={handleOpenTemplateFab}
                        className="rounded-full h-14 w-14 shadow-lg"
                        title="Draft Template"
                    >
                        <Icon name="template" className="w-6 h-6" />
                        {itemsForTemplateFabBadge.length > 0 && 
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {itemsForTemplateFabBadge.length}
                            </span>
                        }
                    </Button>
                )}
                {customerCurrentPage === Page.PRODUCTS && productPageMode === 'ORDER' && (
                    <Button
                        variant="primary"
                        onClick={() => setCustomerCurrentPage(Page.CART)}
                        className="rounded-full h-14 w-14 shadow-lg"
                        title="View Cart"
                    >
                        <Icon name="shoppingCart" className="w-6 h-6" />
                        {cartFabUniqueItemCount > 0 && 
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {cartFabUniqueItemCount}
                            </span>
                        }
                    </Button>
                )}
            </div>
        </div>
      )}

      <PanelControlBar currentMode={panelDisplayMode} onSetMode={setPanelDisplayMode} />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        title="Add New User"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseAddUserModal} className="text-neutral-darker">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              Add User
            </Button>
          </>
        }
      >
        {/* Add User Modal Content - Same as existing */}
      </Modal>

      <Modal
        isOpen={isEditUserModalOpen}
        onClose={handleCloseEditUserModal}
        title="Edit User"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseEditUserModal} className="text-neutral-darker">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditUser}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="editUserName" className="block text-sm font-medium text-neutral-dark mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="editUserName"
              value={editUserForm.name}
              onChange={(e) => handleEditUserFormChange('name', e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>

          {/* Contact Number Field */}
          <div>
            <label htmlFor="editUserContact" className="block text-sm font-medium text-neutral-dark mb-1">
              Contact Number
            </label>
            <div className="flex">
              <select 
                value="+65"
                className="px-2 py-2 border border-r-0 border-neutral-DEFAULT bg-neutral-light text-neutral-dark rounded-l-lg focus:ring-primary focus:border-primary"
                disabled
              >
                <option value="+65">SG (+65)</option>
              </select>
              <input
                type="tel"
                id="editUserContact"
                value={editUserForm.contactNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  handleEditUserFormChange('contactNumber', val);
                }}
                placeholder="e.g., 91234567"
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-r-lg focus:ring-primary focus:border-primary text-neutral-darker"
              />
            </div>
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="editUserRole" className="block text-sm font-medium text-neutral-dark mb-1">
              Role *
            </label>
            <input
              type="text"
              id="editUserRole"
              value={editUserForm.role}
              onChange={(e) => handleEditUserFormChange('role', e.target.value)}
              placeholder="Enter role"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>

          {/* Organization Field */}
          <div>
            <label htmlFor="editUserOrganization" className="block text-sm font-medium text-neutral-dark mb-1">
              Organization *
            </label>
            <input
              type="text"
              id="editUserOrganization"
              value={editUserForm.organization}
              onChange={(e) => handleEditUserFormChange('organization', e.target.value)}
              placeholder="Enter organization"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <Icon name="info" className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Edit User Information</p>
                <p>Update the user's basic information. Role and shop assignments may require additional configuration.</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditUserModalOpen}
        onClose={handleCloseEditUserModal}
        title="Edit User"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseEditUserModal} className="text-neutral-darker">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditUser}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="editUserName" className="block text-sm font-medium text-neutral-dark mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="editUserName"
              value={editUserForm.name}
              onChange={(e) => handleEditUserFormChange('name', e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>

          {/* Contact Number Field */}
          <div>
            <label htmlFor="editUserContact" className="block text-sm font-medium text-neutral-dark mb-1">
              Contact Number
            </label>
            <div className="flex">
              <select 
                value="+65"
                className="px-2 py-2 border border-r-0 border-neutral-DEFAULT bg-neutral-light text-neutral-dark rounded-l-lg focus:ring-primary focus:border-primary"
                disabled
              >
                <option value="+65">SG (+65)</option>
              </select>
              <input
                type="tel"
                id="editUserContact"
                value={editUserForm.contactNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  handleEditUserFormChange('contactNumber', val);
                }}
                placeholder="e.g., 91234567"
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-r-lg focus:ring-primary focus:border-primary text-neutral-darker"
              />
            </div>
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="editUserRole" className="block text-sm font-medium text-neutral-dark mb-1">
              Role *
            </label>
            <select
              id="editUserRole"
              value={editUserForm.role}
              onChange={(e) => handleEditUserFormChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            >
              {editUserForm.userType === 'internal' ? (
                <>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Staff">Staff</option>
                </>
              ) : (
                <>
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="PIC of Ordering">PIC of Ordering</option>
                  <option value="PIC of Payments">PIC of Payments</option>
                </>
              )}
            </select>
          </div>

          {/* Organization Field */}
          <div>
            <label htmlFor="editUserOrganization" className="block text-sm font-medium text-neutral-dark mb-1">
              Organization *
            </label>
            <select
              id="editUserOrganization"
              value={editUserForm.organization}
              onChange={(e) => handleEditUserFormChange('organization', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            >
              {editUserForm.userType === 'internal' ? (
                organizations.filter(org => org.type === 'internal').map(org => (
                  <option key={org.id} value={org.name}>{org.name}</option>
                ))
              ) : (
                <>
                  <option value="">Select organization</option>
                  {organizations.filter(org => org.type === 'external').map(org => (
                    <option key={org.id} value={org.name}>{org.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <Icon name="info" className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Edit User Information</p>
                <p>Update the user's basic information. Role and shop assignments may require additional configuration.</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        title="Add New User"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseAddUserModal} className="text-neutral-darker">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              Add User
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">User Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="internal"
                  checked={newUserForm.userType === 'internal'}
                  onChange={(e) => handleAddUserFormChange('userType', e.target.value)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-darker">Internal User (Selvi Mills)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="external"
                  checked={newUserForm.userType === 'external'}
                  onChange={(e) => handleAddUserFormChange('userType', e.target.value)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-darker">External User (Customer)</span>
              </label>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-neutral-dark mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="userName"
              value={newUserForm.name}
              onChange={(e) => handleAddUserFormChange('name', e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>

          {/* Contact Number Field - Required for external users */}
          <div>
            <label htmlFor="userContact" className="block text-sm font-medium text-neutral-dark mb-1">
              Contact Number {newUserForm.userType === 'external' && '*'}
            </label>
            <div className="flex">
              <select 
                value="+65"
                className="px-2 py-2 border border-r-0 border-neutral-DEFAULT bg-neutral-light text-neutral-dark rounded-l-lg focus:ring-primary focus:border-primary"
                disabled
              >
                <option value="+65">SG (+65)</option>
              </select>
              <input
                type="tel"
                id="userContact"
                value={newUserForm.contactNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  handleAddUserFormChange('contactNumber', val);
                }}
                placeholder={newUserForm.userType === 'external' ? "e.g., 91234567" : "Optional for internal users"}
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-r-lg focus:ring-primary focus:border-primary text-neutral-darker"
              />
            </div>
            {newUserForm.userType === 'internal' && (
              <p className="text-xs text-neutral-dark mt-1">Contact number is optional for internal users</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="userRole" className="block text-sm font-medium text-neutral-dark mb-1">
              Role *
            </label>
            <select
              id="userRole"
              value={newUserForm.role}
              onChange={(e) => handleAddUserFormChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            >
              {newUserForm.userType === 'internal' ? (
                <>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Staff">Staff</option>
                </>
              ) : (
                <>
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="PIC of Ordering">PIC of Ordering</option>
                  <option value="PIC of Payments">PIC of Payments</option>
                </>
              )}
            </select>
          </div>

          {/* Organization Field */}
          {newUserForm.userType === 'internal' ? (
            <div>
              <label htmlFor="userOrganization" className="block text-sm font-medium text-neutral-dark mb-1">
                Organization *
              </label>
              <select
                id="userOrganization"
                value={newUserForm.organization}
                onChange={(e) => handleAddUserFormChange('organization', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
              >
                {organizations.filter(org => org.type === 'internal').map(org => (
                  <option key={org.id} value={org.name}>{org.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="userOrganization" className="block text-sm font-medium text-neutral-dark mb-1">
                Organization *
              </label>
              <select
                id="userOrganization"
                value={newUserForm.organization}
                onChange={(e) => {
                  handleAddUserFormChange('organization', e.target.value);
                  handleAddUserFormChange('shops', []); // Reset shops when org changes
                }}
                className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
              >
                <option value="">Select organization</option>
                {organizations.filter(org => org.type === 'external').map(org => (
                  <option key={org.id} value={org.name}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Shops Field - Required for external users and only if org is selected */}
          {newUserForm.userType === 'external' && newUserForm.organization && selectedExternalOrg && Array.isArray(selectedExternalOrg.shops) && selectedExternalOrg.shops.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">
                Assigned Shops *
              </label>
              <div className="space-y-2">
                {selectedExternalOrg.shops.map((shop: any) => (
                  <label key={shop.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newUserForm.shops.includes(shop.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAddUserFormChange('shops', [...newUserForm.shops, shop.name]);
                        } else {
                          handleAddUserFormChange('shops', newUserForm.shops.filter((s: string) => s !== shop.name));
                        }
                      }}
                      className="mr-2 text-primary focus:ring-primary rounded"
                    />
                    <span className="text-sm text-neutral-darker">{shop.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-neutral-dark mt-1">Select at least one shop for external users</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <Icon name="info" className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {newUserForm.userType === 'internal' ? 'Internal User' : 'External User'} Information
                </p>
                {newUserForm.userType === 'internal' ? (
                  <p>Internal users are Selvi Mills staff members with access to admin functions.</p>
                ) : (
                  <p>External users are customers who can place orders and manage their shop information.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Organization Modal */}
      <Modal
        isOpen={isAddOrganizationModalOpen}
        onClose={handleCloseAddOrganizationModal}
        title="Add New Organization"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseAddOrganizationModal} className="text-neutral-darker">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddOrganization}>
              Add Organization
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Organization Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">Organization Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="organizationType"
                  value="external"
                  checked={newOrganizationForm.type === 'external'}
                  onChange={(e) => handleOrganizationFormChange('type', e.target.value)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-darker">External Organization (Customer)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="organizationType"
                  value="internal"
                  checked={newOrganizationForm.type === 'internal'}
                  onChange={(e) => handleOrganizationFormChange('type', e.target.value)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-darker">Internal Organization</span>
              </label>
            </div>
          </div>

          {/* Organization Name Field */}
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-neutral-dark mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              id="organizationName"
              value={newOrganizationForm.name}
              onChange={(e) => handleOrganizationFormChange('name', e.target.value)}
              placeholder="Enter organization name"
              className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
            />
          </div>

          {/* Info Box */}
          <div className={`${newOrganizationForm.type === 'internal' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-3`}>
            <div className="flex items-start">
              <Icon name={newOrganizationForm.type === 'internal' ? 'building' : 'store'} className={`w-4 h-4 ${newOrganizationForm.type === 'internal' ? 'text-blue-600' : 'text-green-600'} mt-0.5 mr-2 flex-shrink-0`} />
              <div className={`text-sm ${newOrganizationForm.type === 'internal' ? 'text-blue-800' : 'text-green-800'}`}>
                <p className="font-medium mb-1">
                  {newOrganizationForm.type === 'internal' ? 'Internal Organization' : 'External Organization'} Information
                </p>
                {newOrganizationForm.type === 'internal' ? (
                  <p>Internal organizations are part of Selvi Mills and have access to administrative functions.</p>
                ) : (
                  <p>External organizations are customers who can place orders and manage their shop information.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Shop Modal */}
      <Modal
        isOpen={isAddShopModalOpen}
        onClose={handleCloseAddShopModal}
        title={`Add New Shop - Step ${addShopCurrentStep} of ${shopModalSteps.length}`}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseAddShopModal} className="text-neutral-darker">
              Cancel
            </Button>
            <div className="flex space-x-2">
              {addShopCurrentStep > 1 && (
                <Button variant="ghost" onClick={handleAddShopPrevStep} className="text-neutral-darker">
                  Previous
                </Button>
              )}
              {addShopCurrentStep < shopModalSteps.length ? (
                <Button variant="primary" onClick={handleAddShopNextStep}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" onClick={handleAddShop}>
                  Add Shop
                </Button>
              )}
            </div>
          </>
        }
      >
        <div className="space-y-4">
          {/* Step Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-neutral-darker">
                {shopModalSteps[addShopCurrentStep - 1]?.title}
              </h3>
              <span className="text-sm text-neutral-DEFAULT">
                Step {addShopCurrentStep} of {shopModalSteps.length}
              </span>
            </div>
            <p className="text-sm text-neutral-dark mb-4">
              {shopModalSteps[addShopCurrentStep - 1]?.description}
            </p>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(addShopCurrentStep / shopModalSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {addShopCurrentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-neutral-dark mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  id="shopName"
                  value={newShopForm.name}
                  onChange={(e) => handleShopFormChange('name', e.target.value)}
                  placeholder="Enter shop name"
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
              </div>

              <div>
                <label htmlFor="shopAddress" className="block text-sm font-medium text-neutral-dark mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="shopAddress"
                  value={newShopForm.address}
                  onChange={(e) => handleShopFormChange('address', e.target.value)}
                  placeholder="Enter shop address"
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
              </div>

              <div>
                <label htmlFor="shopRegion" className="block text-sm font-medium text-neutral-dark mb-1">
                  Shipment Region *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="shopRegion"
                    value={newShopForm.shipmentRegion}
                    onChange={(e) => {
                      handleShopFormChange('shipmentRegion', e.target.value);
                      setShopRegionSearchQuery(e.target.value);
                    }}
                    placeholder="Search and select region..."
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                  
                  {shopRegionSearchQuery && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-neutral-light rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                      {singaporeNeighbourhoods
                        .filter(region => region.toLowerCase().includes(shopRegionSearchQuery.toLowerCase()))
                        .map(region => (
                          <button
                            key={region}
                            onClick={() => {
                              handleShopFormChange('shipmentRegion', region);
                              setShopRegionSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-neutral-lightest focus:outline-none focus:bg-neutral-lightest border-b border-neutral-100 last:border-b-0"
                          >
                            <span className="font-medium text-neutral-darker">{region}</span>
                          </button>
                        ))}
                      {singaporeNeighbourhoods.filter(region => region.toLowerCase().includes(shopRegionSearchQuery.toLowerCase())).length === 0 && (
                        <div className="px-4 py-2 text-neutral-dark">No regions found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Terms */}
          {addShopCurrentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="shopPaymentTerms" className="block text-sm font-medium text-neutral-dark mb-1">
                  Payment Terms *
                </label>
                <select
                  id="shopPaymentTerms"
                  value={newShopForm.paymentTerms}
                  onChange={(e) => handleShopFormChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                >
                  <option value="">Select payment terms</option>
                  <option value="COD">COD</option>
                  <option value="B2B">B2B</option>
                  <option value="Amount Limit">Amount Limit</option>
                </select>
              </div>

              {newShopForm.paymentTerms === 'Amount Limit' && (
                <div>
                  <label htmlFor="shopAmountLimit" className="block text-sm font-medium text-neutral-dark mb-1">
                    Amount Limit *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      id="shopAmountLimit"
                      value={newShopForm.amountLimit}
                      onChange={(e) => handleShopFormChange('amountLimit', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="shopCustomerType" className="block text-sm font-medium text-neutral-dark mb-1">
                  Customer Type *
                </label>
                <select
                  id="shopCustomerType"
                  value={newShopForm.customerType}
                  onChange={(e) => handleShopFormChange('customerType', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                >
                  <option value="">Select customer type</option>
                  {CustomerTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Packaging Details */}
          {addShopCurrentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="palletType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Pallet Type
                  </label>
                  <select
                    id="palletType"
                    value={newShopForm.packaging.palletType}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, palletType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select pallet type</option>
                    <option value="Selvi Pallet">Selvi Pallet</option>
                    <option value="Customer Pallet">Customer Pallet</option>
                    <option value="Wooden Pallet">Wooden Pallet</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="labelType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Label Type
                  </label>
                  <select
                    id="labelType"
                    value={newShopForm.packaging.labelType}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, labelType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select label type</option>
                    <option value="Selvi Logo">Selvi Logo</option>
                    <option value="Plain Sticker">Plain Sticker</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="packagingType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Packaging Type
                  </label>
                  <select
                    id="packagingType"
                    value={newShopForm.packaging.packagingType}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, packagingType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select packaging type</option>
                    <option value="Cardboard Box">Cardboard Box</option>
                    <option value="Plain Clear Plastic">Plain Clear Plastic</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weightType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Weight Type
                  </label>
                  <select
                    id="weightType"
                    value={newShopForm.packaging.weightType}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, weightType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select weight type</option>
                    <option value="1kg packets">1kg packets</option>
                    <option value="5kg packets">5kg packets</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Parking/Unloading */}
          {addShopCurrentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="parkingNotes" className="block text-sm font-medium text-neutral-dark mb-1">
                  Parking/Unloading Notes
                </label>
                <textarea
                  id="parkingNotes"
                  value={newShopForm.parkingUnloading.notes}
                  onChange={(e) => setNewShopForm(prev => ({
                    ...prev,
                    parkingUnloading: { ...prev.parkingUnloading, notes: e.target.value }
                  }))}
                  placeholder="Enter parking and unloading instructions..."
                  rows={5}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
              </div>
            </div>
          )}

          {/* Step 5: Delivery Hours */}
          {addShopCurrentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="openTime" className="block text-sm font-medium text-neutral-dark mb-1">
                    Open Time
                  </label>
                  <input
                    type="time"
                    id="openTime"
                    value={newShopForm.delivery.openTime}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, openTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>

                <div>
                  <label htmlFor="closeTime" className="block text-sm font-medium text-neutral-dark mb-1">
                    Close Time
                  </label>
                  <input
                    type="time"
                    id="closeTime"
                    value={newShopForm.delivery.closeTime}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, closeTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>

                <div>
                  <label htmlFor="deliverAfter" className="block text-sm font-medium text-neutral-dark mb-1">
                    Deliver After
                  </label>
                  <input
                    type="time"
                    id="deliverAfter"
                    value={newShopForm.delivery.deliverAfter}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, deliverAfter: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>

                <div>
                  <label htmlFor="deliverBefore" className="block text-sm font-medium text-neutral-dark mb-1">
                    Deliver Before
                  </label>
                  <input
                    type="time"
                    id="deliverBefore"
                    value={newShopForm.delivery.deliverBefore}
                    onChange={(e) => setNewShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, deliverBefore: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">
                  Closed On
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newShopForm.delivery.closedOn.includes(day)}
                        onChange={(e) => {
                          const updatedDays = e.target.checked
                            ? [...newShopForm.delivery.closedOn, day]
                            : newShopForm.delivery.closedOn.filter(d => d !== day);
                          setNewShopForm(prev => ({
                            ...prev,
                            delivery: { ...prev.delivery, closedOn: updatedDays }
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-dark">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Shop Modal */}
      <Modal
        isOpen={isEditShopModalOpen}
        onClose={handleCloseEditShopModal}
        title={`Edit Shop - Step ${editShopCurrentStep} of ${shopModalSteps.length}`}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseEditShopModal} className="text-neutral-darker">
              Cancel
            </Button>
            <div className="flex space-x-2">
              {editShopCurrentStep > 1 && (
                <Button variant="ghost" onClick={handleEditShopPrevStep} className="text-neutral-darker">
                  Previous
                </Button>
              )}
              {editShopCurrentStep < shopModalSteps.length ? (
                <Button variant="primary" onClick={handleEditShopNextStep}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSaveEditShop}>
                  Save Changes
                </Button>
              )}
            </div>
          </>
        }
      >
        <div className="space-y-4">
          {/* Step Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-neutral-darker">
                {shopModalSteps[editShopCurrentStep - 1]?.title}
              </h3>
              <span className="text-sm text-neutral-DEFAULT">
                Step {editShopCurrentStep} of {shopModalSteps.length}
              </span>
            </div>
            <p className="text-sm text-neutral-dark mb-4">
              {shopModalSteps[editShopCurrentStep - 1]?.description}
            </p>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(editShopCurrentStep / shopModalSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {editShopCurrentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="editShopName" className="block text-sm font-medium text-neutral-dark mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  id="editShopName"
                  value={editShopForm.name}
                  onChange={(e) => handleEditShopFormChange('name', e.target.value)}
                  placeholder="Enter shop name"
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
              </div>

              <div>
                <label htmlFor="editShopAddress" className="block text-sm font-medium text-neutral-dark mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="editShopAddress"
                  value={editShopForm.address}
                  onChange={(e) => handleEditShopFormChange('address', e.target.value)}
                  placeholder="Enter shop address"
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
              </div>

              <div>
                <label htmlFor="editShopRegion" className="block text-sm font-medium text-neutral-dark mb-1">
                  Shipment Region *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="editShopRegion"
                    value={editShopForm.shipmentRegion}
                    onChange={(e) => {
                      handleEditShopFormChange('shipmentRegion', e.target.value);
                      setEditShopRegionSearchQuery(e.target.value);
                    }}
                    placeholder="Search and select region..."
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                  
                  {editShopRegionSearchQuery && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-neutral-light rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                      {singaporeNeighbourhoods
                        .filter(region => region.toLowerCase().includes(editShopRegionSearchQuery.toLowerCase()))
                        .map(region => (
                          <button
                            key={region}
                            onClick={() => {
                              handleEditShopFormChange('shipmentRegion', region);
                              setEditShopRegionSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-neutral-lightest focus:outline-none focus:bg-neutral-lightest border-b border-neutral-100 last:border-b-0"
                          >
                            <span className="font-medium text-neutral-darker">{region}</span>
                          </button>
                        ))}
                      {singaporeNeighbourhoods.filter(region => region.toLowerCase().includes(editShopRegionSearchQuery.toLowerCase())).length === 0 && (
                        <div className="px-4 py-2 text-neutral-dark">No regions found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Terms */}
          {editShopCurrentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="editShopPaymentTerms" className="block text-sm font-medium text-neutral-dark mb-1">
                  Payment Terms *
                </label>
                <select
                  id="editShopPaymentTerms"
                  value={editShopForm.paymentTerms}
                  onChange={(e) => handleEditShopFormChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                >
                  <option value="">Select payment terms</option>
                  <option value="COD">COD</option>
                  <option value="B2B">B2B</option>
                  <option value="Amount Limit">Amount Limit</option>
                </select>
              </div>

              {editShopForm.paymentTerms === 'Amount Limit' && (
                <div>
                  <label htmlFor="editShopAmountLimit" className="block text-sm font-medium text-neutral-dark mb-1">
                    Amount Limit *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-neutral-dark">$</span>
                    <input
                      type="number"
                      id="editShopAmountLimit"
                      value={editShopForm.amountLimit}
                      onChange={(e) => handleEditShopFormChange('amountLimit', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="editShopCustomerType" className="block text-sm font-medium text-neutral-dark mb-1">
                  Customer Type *
                </label>
                <select
                  id="editShopCustomerType"
                  value={editShopForm.customerType}
                  onChange={(e) => handleEditShopFormChange('customerType', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                >
                  <option value="">Select customer type</option>
                  {CustomerTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Packaging Details */}
          {editShopCurrentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editPalletType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Pallet Type
                  </label>
                  <select
                    id="editPalletType"
                    value={editShopForm.packaging.palletType}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, palletType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select pallet type</option>
                    <option value="Selvi Pallet">Selvi Pallet</option>
                    <option value="Customer Pallet">Customer Pallet</option>
                    <option value="Wooden Pallet">Wooden Pallet</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editLabelType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Label Type
                  </label>
                  <select
                    id="editLabelType"
                    value={editShopForm.packaging.labelType}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, labelType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select label type</option>
                    <option value="Selvi Logo">Selvi Logo</option>
                    <option value="Plain Sticker">Plain Sticker</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editPackagingType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Packaging Type
                  </label>
                  <select
                    id="editPackagingType"
                    value={editShopForm.packaging.packagingType}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, packagingType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select packaging type</option>
                    <option value="Cardboard Box">Cardboard Box</option>
                    <option value="Plain Clear Plastic">Plain Clear Plastic</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editWeightType" className="block text-sm font-medium text-neutral-dark mb-1">
                    Weight Type
                  </label>
                  <select
                    id="editWeightType"
                    value={editShopForm.packaging.weightType}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      packaging: { ...prev.packaging, weightType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select weight type</option>
                    <option value="1kg packets">1kg packets</option>
                    <option value="5kg packets">5kg packets</option>
                    <option value="+">+ Add New</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Parking/Unloading */}
          {editShopCurrentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="editParkingNotes" className="block text-sm font-medium text-neutral-dark mb-1">
                  Parking/Unloading Notes
                </label>
                <textarea
                  id="editParkingNotes"
                  value={editShopForm.parkingUnloading.notes}
                  onChange={(e) => setEditShopForm(prev => ({
                    ...prev,
                    parkingUnloading: { ...prev.parkingUnloading, notes: e.target.value }
                  }))}
                  placeholder="Enter parking and unloading instructions..."
                  rows={5}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                />
              </div>
            </div>
          )}

          {/* Step 5: Delivery Hours */}
          {editShopCurrentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editOpenTime" className="block text-sm font-medium text-neutral-dark mb-1">
                    Open Time
                  </label>
                  <input
                    type="time"
                    id="editOpenTime"
                    value={editShopForm.delivery.openTime}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, openTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>

                <div>
                  <label htmlFor="editCloseTime" className="block text-sm font-medium text-neutral-dark mb-1">
                    Close Time
                  </label>
                  <input
                    type="time"
                    id="editCloseTime"
                    value={editShopForm.delivery.closeTime}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, closeTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>

                <div>
                  <label htmlFor="editDeliverAfter" className="block text-sm font-medium text-neutral-dark mb-1">
                    Deliver After
                  </label>
                  <input
                    type="time"
                    id="editDeliverAfter"
                    value={editShopForm.delivery.deliverAfter}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, deliverAfter: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>

                <div>
                  <label htmlFor="editDeliverBefore" className="block text-sm font-medium text-neutral-dark mb-1">
                    Deliver Before
                  </label>
                  <input
                    type="time"
                    id="editDeliverBefore"
                    value={editShopForm.delivery.deliverBefore}
                    onChange={(e) => setEditShopForm(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, deliverBefore: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">
                  Closed On
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editShopForm.delivery.closedOn.includes(day)}
                        onChange={(e) => {
                          const updatedDays = e.target.checked
                            ? [...editShopForm.delivery.closedOn, day]
                            : editShopForm.delivery.closedOn.filter(d => d !== day);
                          setEditShopForm(prev => ({
                            ...prev,
                            delivery: { ...prev.delivery, closedOn: updatedDays }
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-dark">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Credit Limit Modal */}
      <Modal
        isOpen={isCreditLimitModalOpen}
        onClose={() => setIsCreditLimitModalOpen(false)}
        title="Credit Limit Exceeded"
      >
        {creditLimitModalOrder && (() => {
          const shop = organizations.flatMap(org => org.shops).find(s => s.name === creditLimitModalOrder.shopLocation);
          let limitAmount = 0;
          if (shop?.amountLimit) {
            limitAmount = parseFloat(shop.amountLimit.toString());
          } else if (shop?.paymentTerms?.startsWith('Amount Limit: $')) {
            limitAmount = parseFloat(shop.paymentTerms.replace('Amount Limit: $', ''));
          }
          const excessAmount = creditLimitModalOrder.totalPrice - limitAmount;

          return (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Icon name="info" className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-red-800">Order Exceeds Credit Limit</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-neutral-darker">Order ID:</span>
                    <span className="ml-2 text-neutral-dark">#{creditLimitModalOrder.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-darker">Shop:</span>
                    <span className="ml-2 text-neutral-dark">{creditLimitModalOrder.shopLocation}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-darker">Order Amount:</span>
                    <span className="ml-2 font-semibold text-neutral-dark">${creditLimitModalOrder.totalPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-darker">Credit Limit:</span>
                    <span className="ml-2 text-neutral-dark">${limitAmount.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-neutral-darker">Excess Amount:</span>
                    <span className="ml-2 font-semibold text-red-600">${excessAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Required Action</h4>
                <p className="text-sm text-blue-700">
                  This order exceeds the shop's credit limit and requires special approval before processing. 
                  Please contact the accounting team or shop management for authorization.
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={() => setIsCreditLimitModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Internal Billing Hold Confirmation Modal */}
      <Modal
        isOpen={isBillingHoldModalOpen}
        onClose={handleCloseBillingHoldModal}
        title={billingHoldAction?.action === 'enable' ? 'Enable Internal Billing Hold' : 'Disable Internal Billing Hold'}
      >
        {billingHoldAction && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Shop Details</h3>
              <div className="text-sm text-blue-700">
                <div><span className="font-medium">Shop Name:</span> {billingHoldAction.shop.name}</div>
                <div><span className="font-medium">Address:</span> {billingHoldAction.shop.address}</div>
                <div><span className="font-medium">Region:</span> {billingHoldAction.shop.shipmentRegion}</div>
              </div>
            </div>

            <div className={`border rounded-lg p-4 ${
              billingHoldAction.action === 'enable' 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center mb-2">
                <Icon name={billingHoldAction.action === 'enable' ? 'alert' : 'checkCircle'} className={`w-5 h-5 mr-2 ${
                  billingHoldAction.action === 'enable' ? 'text-orange-600' : 'text-green-600'
                }`} />
                <h4 className={`font-medium ${
                  billingHoldAction.action === 'enable' ? 'text-orange-800' : 'text-green-800'
                }`}>
                  {billingHoldAction.action === 'enable' ? 'Warning' : 'Confirmation'}
                </h4>
              </div>
              <p className={`text-sm ${
                billingHoldAction.action === 'enable' ? 'text-orange-700' : 'text-green-700'
              }`}>
                {billingHoldAction.action === 'enable' 
                  ? `Are you sure you want to enable internal billing hold for "${billingHoldAction.shop.name}"? This will prevent automatic billing processes for this shop.`
                  : `Are you sure you want to disable internal billing hold for "${billingHoldAction.shop.name}"? This will resume normal billing processes for this shop.`
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
              <Button 
                variant="secondary" 
                onClick={handleCloseBillingHoldModal}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirmBillingHold}
                className={billingHoldAction.action === 'enable' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {billingHoldAction.action === 'enable' ? 'Enable Hold' : 'Disable Hold'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Internal Billing Hold Warning Modal */}
      <Modal
        isOpen={isInternalBillingHoldWarningModalOpen}
        onClose={handleCloseInternalBillingHoldWarningModal}
        title="Internal Billing Hold Active"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Icon name="alert" className="w-5 h-5 mr-2 text-orange-600" />
              <h4 className="font-medium text-orange-800">Action Restricted</h4>
            </div>
            <p className="text-sm text-orange-700">
              Internal billing for this order is on hold. Check with accounting department.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <Button 
              variant="primary" 
              onClick={handleCloseInternalBillingHoldWarningModal}
            >
              Understood
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shop Organization Management Modal */}
      <Modal
        isOpen={isShopOrgManagementModalOpen}
        onClose={handleCloseShopOrgManagementModal}
        title={shopOrgManagementData?.action === 'move' ? 'Move Shop to Another Organization' : 'Remove Shop from Organization'}
      >
        {shopOrgManagementData && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Shop Details</h3>
              <div className="text-sm text-blue-700">
                <div><span className="font-medium">Shop Name:</span> {shopOrgManagementData.shop.name}</div>
                <div><span className="font-medium">Address:</span> {shopOrgManagementData.shop.address}</div>
                <div><span className="font-medium">Region:</span> {shopOrgManagementData.shop.shipmentRegion}</div>
              </div>
            </div>

            {shopOrgManagementData.action === 'move' && (
              <div>
                <label htmlFor="targetOrg" className="block text-sm font-medium text-neutral-dark mb-1">
                  Select Target Organization *
                </label>
                <select
                  id="targetOrg"
                  value={shopOrgForm.targetOrgId}
                  onChange={(e) => handleShopOrgFormChange('targetOrgId', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                >
                  <option value="">Select an organization</option>
                  {organizations
                    .filter(org => org.type === 'external' && org.id !== shopOrgManagementData.currentOrgId)
                    .map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </select>
                <p className="text-xs text-neutral-DEFAULT mt-1">
                  Only external organizations are shown as options.
                </p>
              </div>
            )}

            {shopOrgManagementData.action === 'remove' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="removalReason" className="block text-sm font-medium text-neutral-dark mb-1">
                    Reason for Removal *
                  </label>
                  <select
                    id="removalReason"
                    value={shopOrgForm.removalReason}
                    onChange={(e) => handleShopOrgFormChange('removalReason', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                  >
                    <option value="">Select a reason</option>
                    <option value="Shop permanently closing down">Shop permanently closing down</option>
                    <option value="Shop temporarily closing down">Shop temporarily closing down</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {shopOrgForm.removalReason === 'Others' && (
                  <div>
                    <label htmlFor="customReason" className="block text-sm font-medium text-neutral-dark mb-1">
                      Custom Reason *
                    </label>
                    <textarea
                      id="customReason"
                      value={shopOrgForm.customReason}
                      onChange={(e) => handleShopOrgFormChange('customReason', e.target.value)}
                      placeholder="Please specify the reason for removal..."
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-DEFAULT rounded-lg focus:ring-primary focus:border-primary text-neutral-darker"
                    />
                  </div>
                )}

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Icon name="alert" className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-medium text-orange-800">Warning</h4>
                  </div>
                  <p className="text-sm text-orange-700">
                    Removing this shop from the organization will move it to the "Shops not linked to any organization" section. 
                    You can re-link it to an organization later if needed.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
              <Button 
                variant="secondary" 
                onClick={handleCloseShopOrgManagementModal}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveShopOrgManagement}
              >
                {shopOrgManagementData.action === 'move' ? 'Move Shop' : 'Remove Shop'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Order Modification Request Confirmation Modal */}
      <Modal
        isOpen={isModificationConfirmModalOpen}
        onClose={handleCancelModificationConfirm}
        title="Confirm Modification Request"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Icon name="info" className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-orange-800">Important Notice</h3>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              <strong>Take note, please send your modification request as soon as possible.</strong> You are sending a modification request only. 
              This request would be fulfilled depending on if your package has already left our company or not.
            </p>
            {orderTimerText && (
              <div className="text-sm text-orange-700 mb-3">
                <strong>{orderTimerText}</strong> since order created
              </div>
            )}
            <p className="text-sm text-orange-700">
              Would you like to proceed now or check your order details again first?
            </p>
          </div>



          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
            <Button 
              variant="secondary" 
              onClick={handleCancelModificationConfirm}
            >
              Check Again First
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmModification}
            >
              Proceed Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Modification Request Summary Modal */}
      <Modal
        isOpen={isModificationSummaryModalOpen}
        onClose={handleCloseModificationSummary}
        title="Modification Request Summary"
      >
        {modificationSummaryData && (() => {
          const { originalItems, newItems, originalTotal, newTotal } = modificationSummaryData;
          
          // Analyze changes
          const removedItems: ProductInCart[] = [];
          const addedItems: ProductInCart[] = [];
          const quantityChanges: Array<{
            product: ProductInCart;
            oldQuantity: number;
            newQuantity: number;
            isIncrease: boolean;
          }> = [];

          // Find removed items (in original but not in new)
          originalItems.forEach(originalItem => {
            const foundInNew = newItems.find(newItem => newItem.id === originalItem.id);
            if (!foundInNew) {
              removedItems.push(originalItem);
            }
          });

          // Find added items and quantity changes
          newItems.forEach(newItem => {
            const foundInOriginal = originalItems.find(originalItem => originalItem.id === newItem.id);
            if (!foundInOriginal) {
              // This is a new item
              addedItems.push(newItem);
            } else if (foundInOriginal.quantity !== newItem.quantity) {
              // This is a quantity change
              quantityChanges.push({
                product: newItem,
                oldQuantity: foundInOriginal.quantity,
                newQuantity: newItem.quantity,
                isIncrease: newItem.quantity > foundInOriginal.quantity
              });
            }
          });

          const totalChange = newTotal - originalTotal;
          const isIncrease = totalChange > 0;

          return (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Order Summary</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    <span className="font-medium">Order ID:</span> #{orderBeingModified?.id}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Total:</span>
                    <span className="line-through text-gray-500">${originalTotal.toFixed(2)}</span>
                    <Icon 
                      name={isIncrease ? "arrowUp" : "arrowDown"} 
                      className={`w-4 h-4 ${isIncrease ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    <span className={`font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                      ${newTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs">
                    {isIncrease ? 'Increase' : 'Decrease'} of ${Math.abs(totalChange).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Removed Items */}
              {removedItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center">
                    <Icon name="minus" className="w-4 h-4 mr-2" />
                    Item(s) Removed ({removedItems.length})
                  </h4>
                  <div className="space-y-2">
                    {removedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="line-through text-gray-500 flex-grow">{item.name}</span>
                        <span className="line-through text-gray-500 ml-2">{item.quantity} {item.uom}</span>
                        <span className="line-through text-gray-500 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Added Items */}
              {addedItems.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center">
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Item(s) Added ({addedItems.length})
                  </h4>
                  <div className="space-y-2">
                    {addedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-green-700 font-medium flex-grow">{item.name}</span>
                        <span className="text-green-700 ml-2">{item.quantity} {item.uom}</span>
                        <span className="text-green-700 font-semibold ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Changes */}
              {quantityChanges.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-3 flex items-center">
                    <Icon name="edit" className="w-4 h-4 mr-2" />
                    Quantities Adjusted ({quantityChanges.length})
                  </h4>
                  <div className="space-y-3">
                    {quantityChanges.map(change => (
                      <div key={change.product.id} className="text-sm">
                        <div className="font-medium text-amber-800 mb-1">{change.product.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className="line-through text-gray-500">{change.oldQuantity} {change.product.uom}</span>
                          <Icon 
                            name={change.isIncrease ? "arrowUp" : "arrowDown"} 
                            className={`w-4 h-4 ${change.isIncrease ? 'text-green-600' : 'text-red-600'}`} 
                          />
                          <span className={`font-semibold ${change.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                            {change.newQuantity} {change.product.uom}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            (${(change.product.price * change.oldQuantity).toFixed(2)} → ${(change.product.price * change.newQuantity).toFixed(2)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-100">
                <Button 
                  variant="secondary" 
                  onClick={handleCloseModificationSummary}
                >
                  Go Back
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleConfirmModificationSummary}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>



    </div>
  );
};
