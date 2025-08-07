# Customer Product Hub

A comprehensive React application for an Indian grocery business (Selvi Mills) that serves both customers and administrators. This is a B2B/B2C platform for ordering Indian groceries and managing the entire order lifecycle.

## 🌐 Live Demo

**Production URL**: [https://customer-admin-app.vercel.app/](https://customer-admin-app.vercel.app/)

## 📋 Product Requirements Document

### Customer Perspective: "What I Need as a Business Owner"

As a business owner managing multiple Indian grocery stores, I need a comprehensive ordering system that addresses my daily operational challenges:

#### **Core Business Needs:**

1. **Efficient Ordering Process**
   - Browse a comprehensive catalog of Indian groceries (spices, lentils, rice, snacks, beverages)
   - Add items to cart with quantity controls
   - Save frequently ordered items as templates for quick reordering
   - Place orders with flexible delivery scheduling (advance orders)

2. **Order Management & Tracking**
   - View order history with detailed status tracking
   - Modify existing orders before shipping (add/remove items, change quantities)
   - Track order progress from placement to delivery
   - Receive real-time updates on order status changes

3. **Business Operations Support**
   - Multiple shop locations management (Al-Sheika Tuas, Al-Sheika Boon Lay)
   - Role-based access for different team members (Owner, Manager, PIC of Ordering, PIC of Payments)
   - Support ticket system for order issues and disputes
   - Document and photo attachments for order specifications

4. **Financial & Billing Management**
   - Different pricing tiers based on customer type (Shop Cat 1, Shop Cat 2, Shop Cat 3, Minimart, Retail)
   - Advance order billing with custom invoice dates
   - Payment tracking and billing status monitoring
   - Order modification request system with approval workflow

#### **Key Features Required:**

- **Template System**: Save and reuse order templates for regular purchases
- **Modification Requests**: Request changes to existing orders with approval workflow
- **Multi-location Support**: Manage orders across different shop locations
- **Role-based Access**: Different permissions for owners, managers, and staff
- **Real-time Status Updates**: Track orders through the entire lifecycle
- **Support System**: Report issues and track resolution
- **Document Management**: Attach photos and documents to orders

## 🎨 UI/UX Walkthrough: Features & Workflows

### **Customer Portal Interface**

#### **1. Product Catalog & Shopping Experience**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Customer Product Hub                    👤 Profile     │
├─────────────────────────────────────────────────────────────┤
│ Search: [________________] 🔍  Filter: [Category ▼]       │
├─────────────────────────────────────────────────────────────┤
│ 📦 Spices        🥜 Lentils     🍚 Rice        🍿 Snacks │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│ │ Turmeric    │ │ Toor Dal    │ │ Basmati     │          │
│ │ $12.50/kg   │ │ $8.75/kg    │ │ $15.00/kg   │          │
│ │ [+ Add]     │ │ [+ Add]     │ │ [+ Add]     │          │
│ └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

#### **2. Cart & Order Management**
```
┌─────────────────────────────────────────────────────────────┐
│ 🛒 Shopping Cart (3 items)                                │
├─────────────────────────────────────────────────────────────┤
│ Turmeric Powder    2kg    $25.00    [±] [🗑️]            │
│ Basmati Rice       5kg    $75.00    [±] [🗑️]            │
│ Toor Dal           3kg    $26.25    [±] [🗑️]            │
├─────────────────────────────────────────────────────────────┤
│ Subtotal: $126.25    Total: $126.25    [📋 Place Order] │
└─────────────────────────────────────────────────────────────┘
```

#### **3. Template System for Quick Reordering**
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Order Templates                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Monthly Staples                                        │ │
│ │ 15 items • Last used: 2 days ago                       │ │
│ │ [👁️ View] [📋 Use Template] [✏️ Edit]                │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Quick Meals                                            │ │
│ │ 8 items • Last used: 1 week ago                        │ │
│ │ [👁️ View] [📋 Use Template] [✏️ Edit]                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Admin Portal Interface**

#### **4. Order Management Dashboard**
```
┌─────────────────────────────────────────────────────────────┐
│ 👨‍💼 Admin Dashboard - Order Management                    │
├─────────────────────────────────────────────────────────────┤
│ [To Pick Date] [To Bill] [Billed] [Schedule] [All Orders]│
├─────────────────────────────────────────────────────────────┤
│ Order ID │ Customer │ Shop      │ Total │ Status          │
│ 0001     │ Mani     │ Al-Sheika │ $126  │ To select date  │
│ 0002     │ Murali   │ Al-Sheika │ $89   │ To pick person  │
│ 0003     │ Praveen  │ Al-Sheika │ $234  │ Billing in prog │
└─────────────────────────────────────────────────────────────┘
```

#### **5. Billing Workflow Management**
```
┌─────────────────────────────────────────────────────────────┐
│ 💳 Billing Management - "To Bill in Insmart"              │
├─────────────────────────────────────────────────────────────┤
│ Ungrouped Orders:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Order #0001 │ Mani │ $126 │ [Assign to: Saraswathi ▼] │ │
│ │ Order #0002 │ Murali│ $89 │ [Assign to: Sumathi ▼]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                           │
│ Saraswathi's Queue:                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Order #0003 │ [Start Billing] [Complete] [Cancel]     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Key Workflow Connections**

#### **🔄 Customer Order → Admin Processing Flow**

1. **Customer Places Order** → Status: "To select date"
   ```
   Customer Portal: [📋 Place Order] 
   ↓
   Admin Portal: Order appears in "To Pick Date" tab
   ```

2. **Admin Assigns Shipping Date** → Status: "To pick person for billing"
   ```
   Admin Portal: [Set Shipping Date: 2024-01-15]
   ↓
   Order moves to "To Bill in Insmart" tab
   ```

3. **Admin Assigns Biller** → Status: "Order delegated for billing"
   ```
   Admin Portal: [Assign to: Saraswathi]
   ↓
   Order appears in Saraswathi's billing queue
   ```

4. **Biller Processes Order** → Status: "Billed in Insmart"
   ```
   Admin Portal: [Start Billing] → [Complete Billing]
   ↓
   Customer Portal: Order status updates to "Confirmed"
   ```

#### **📝 Modification Request Workflow**

1. **Customer Requests Changes**
   ```
   Customer Portal: [Modify Order] → Add/Remove items
   ↓
   System: Creates modification request (pending)
   ```

2. **Admin Reviews Request**
   ```
   Admin Portal: "Modification Requests" tab
   ↓
   Admin Portal: [Accept] or [Deny] request
   ```

3. **Request Processed**
   ```
   Admin Portal: [Accept Modification]
   ↓
   Customer Portal: Order updated, notification sent
   ```

#### **🎯 Template → Order → Admin Workflow**

1. **Customer Uses Template**
   ```
   Customer Portal: [📋 Use Template] → Configure quantities
   ↓
   Customer Portal: [📋 Place Order]
   ```

2. **Order Created from Template**
   ```
   System: Creates new order with template items
   ↓
   Admin Portal: Order appears in "To Pick Date"
   ```

3. **Admin Processes Template Order**
   ```
   Admin Portal: Same workflow as regular orders
   ↓
   Customer Portal: Order tracking and updates
   ```

### **Real-time Status Synchronization**

The application maintains real-time synchronization between customer and admin portals:

- **Customer places order** → Immediately appears in admin dashboard
- **Admin updates status** → Customer sees real-time status changes
- **Modification requests** → Instant notification to admin
- **Billing completion** → Customer receives order confirmation
- **Support tickets** → Real-time updates on issue resolution

### **Multi-location & Role-based Access**

```
Organization: Al-Sheika
├── Shop: Al-Sheika Tuas
│   ├── Mani (Owner) - Full access
│   ├── Murali (Manager) - Order management
│   └── Praveen (PIC) - Ordering & Payments
└── Shop: Al-Sheika Boon Lay
    ├── Mani (Owner) - Full access
    ├── Murali (Manager) - Order management
    └── Eswari (PIC) - Ordering only
```

This comprehensive system ensures seamless communication between customers and administrators, with full audit trails and real-time updates throughout the entire order lifecycle.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/kchelvan55/customer_admin_app.git
cd customer_admin_app

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Access URLs
- **Local Development**: `http://localhost:5173/`
- **Production**: [https://customer-admin-app.vercel.app/](https://customer-admin-app.vercel.app/)

## 🏗️ Technical Architecture

### **Frontend Technologies**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Custom Components** for reusable UI elements

### **State Management**
- **React Hooks** for local state management
- **Context API** for global state (if needed)
- **Local Storage** for persistent data

### **Key Features**
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Live status synchronization
- **Role-based Access** - Different interfaces for customers and admins
- **Template System** - Save and reuse order templates
- **Modification Workflow** - Request and approve order changes
- **Support System** - Issue tracking and resolution
- **Document Management** - File attachments for orders

## 📦 Deployment

### **Vercel Deployment (Recommended)**
The application is automatically deployed to Vercel with:
- **Automatic deployments** from GitHub
- **24/7 availability** - no more offline issues
- **Production build process** with optimization
- **Custom domain** support

### **Manual Deployment**
```bash
# Build the application
npm run build

# Deploy to your preferred hosting service
# The built files will be in the 'dist' directory
```

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Project Structure**
```
customer-product-hub/
├── components/          # Reusable UI components
├── App.tsx            # Main application component
├── types.ts           # TypeScript type definitions
├── constants.ts       # Mock data and constants
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- **Live Demo**: [https://customer-admin-app.vercel.app/](https://customer-admin-app.vercel.app/)
- **GitHub Issues**: [https://github.com/kchelvan55/customer_admin_app/issues](https://github.com/kchelvan55/customer_admin_app/issues)
- **Documentation**: See README sections above for detailed feature walkthroughs
