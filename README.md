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

5. **Insmart Billing System**
   - Staff can pick orders they want to bill from the "To Bill in Insmart" queue
   - Billing workflow: "To pick person" → "Order delegated for billing" → "Billing in progress" → "Billed in Insmart"
   - One staff member can only bill one order at a time (prevents conflicts)
   - Priority-based order assignment based on shipping dates and customer types
   - Real-time billing status updates visible to both staff and customers

6. **Accounting & Internal Controls**
   - Internal billing hold system to block shops with payment issues
   - Shops can be temporarily blocked from placing new orders due to outstanding payments
   - Automatic credit limit validation during order placement
   - Payment terms enforcement (Net 30, Net 60, etc.)
   - Aging report generation for outstanding invoices
   - Shop-specific credit limits and payment history tracking

#### **Key Features Required:**

- **Template System**: Save and reuse order templates for regular purchases
- **Modification Requests**: Request changes to existing orders with approval workflow
- **Multi-location Support**: Manage orders across different shop locations
- **Role-based Access**: Different permissions for owners, managers, and staff
- **Real-time Status Updates**: Track orders through the entire lifecycle
- **Support System**: Report issues and track resolution
- **Document Management**: Attach photos and documents to orders

## 🎨 UI/UX Walkthrough: Features & Workflows

### **Organization & Shop Management System**

#### **🏢 Organization Setup Process**

Before creating shops, you need to establish an organization structure:

**1. Organization Creation:**
- **Organization Name**: e.g., "Al-Sheika", "Selvi Mills"
- **Organization Type**: B2B, B2C, or Hybrid
- **Contact Information**: Primary contact person and details
- **Billing Address**: Default billing location
- **Tax Information**: GST registration and tax details

**2. Shop Creation within Organization:**
Each organization can have multiple shop locations with the following fields:

**Required Shop Fields:**
- **Shop Name**: e.g., "Al-Sheika Tuas", "Al-Sheika Boon Lay"
- **Shop Address**: Complete shipping and billing address
- **Contact Person**: Primary contact for the shop
- **Phone Number**: Shop contact number
- **Email**: Shop email address
- **Operating Hours**: Business hours and days
- **Customer Type**: Shop Cat 1, Shop Cat 2, Shop Cat 3, Minimart, Retail
- **Pricing Tier**: Determines product pricing for this shop
- **Payment Terms**: Credit terms, payment methods
- **Delivery Zone**: Geographic delivery area
- **Preferred Delivery Days**: Available delivery schedules

**Optional Shop Fields:**
- **Shop Manager**: Person in charge of the location
- **Special Instructions**: Delivery notes, access instructions
- **Minimum Order Value**: Required order amount
- **Credit Limit**: Maximum credit allowed
- **Tax Exemption**: Any tax exemptions or special rates

#### **🔄 How Shop Details Are Used Throughout the Application**

**1. Invoice Generation:**
```
Invoice Header:
┌─────────────────────────────────────────────────────────────┐
│ Al-Sheika Tuas                                            │
│ 123 Tuas Avenue, Singapore 123456                         │
│ Contact: Mani | Phone: +65 8468 2040                     │
│ Customer Type: Shop Cat 1 | Credit Terms: Net 30          │
└─────────────────────────────────────────────────────────────┘
```

**2. Customer Profile Page:**
```
Profile Information:
┌─────────────────────────────────────────────────────────────┐
│ 👤 Customer Profile                                        │
├─────────────────────────────────────────────────────────────┤
│ Organization: Al-Sheika                                   │
│ Shop Location: Al-Sheika Tuas                             │
│ Address: 123 Tuas Avenue, Singapore 123456                │
│ Contact: Mani (Owner)                                     │
│ Phone: +65 8468 2040                                      │
│ Customer Type: Shop Cat 1                                  │
│ Pricing Tier: Wholesale                                    │
│ Credit Limit: $10,000                                     │
│ Payment Terms: Net 30                                     │
└─────────────────────────────────────────────────────────────┘
```

**3. Order Management:**
- **Shop-specific pricing** applied automatically
- **Delivery scheduling** based on shop's preferred days
- **Credit limit validation** during order placement
- **Tax calculation** based on shop's tax settings

**4. Admin Dashboard:**
- **Shop-specific order views** and filtering
- **Location-based reporting** and analytics
- **Shop-specific billing** and payment tracking
- **Delivery route optimization** by shop location

#### **🔄 Organization & Shop Connection Management**

**Changing Shop Organization Connection:**

1. **Transfer Process:**
   ```
   Current: Al-Sheika Tuas → Al-Sheika Organization
   Transfer to: New Organization (e.g., "Selvi Mills Direct")
   ```

2. **Required Steps:**
   - **Admin Approval**: Super admin must approve transfer
   - **Data Migration**: Order history, templates, and preferences
   - **Pricing Update**: New organization's pricing structure
   - **Contact Update**: New organization's contact information
   - **Access Rights**: Update user permissions and roles

3. **Impact on Existing Data:**
   - **Orders**: Historical orders remain with original organization
   - **Templates**: Templates can be transferred or recreated
   - **Credit History**: Credit terms may change with new organization
   - **Pricing**: Products may have different prices in new organization

#### **💳 Insmart Billing System & Internal Controls**

**Billing Workflow Process:**

1. **Order Assignment to Biller:**
   ```
   Admin Portal: "To Bill in Insmart" tab
   ├── Ungrouped Orders (no biller assigned)
   │   ├── Order #0001 │ Mani │ $126 │ [Assign to: Saraswathi ▼]
   │   └── Order #0002 │ Murali│ $89 │ [Assign to: Sumathi ▼]
   └── Grouped by Biller
       ├── Saraswathi's Queue
       │   ├── Order #0003 │ [Start Billing] [Complete] [Cancel]
       │   └── Order #0004 │ [Start Billing] [Complete] [Cancel]
       └── Sumathi's Queue
           └── Order #0005 │ [Start Billing] [Complete] [Cancel]
   ```

2. **Billing Status Progression:**
   ```
   Order Status Flow:
   "To pick person for billing" 
   ↓ (Admin assigns biller)
   "Order delegated for billing"
   ↓ (Biller starts billing)
   "Billing in progress"
   ↓ (Biller completes billing)
   "Billed in Insmart"
   ↓ (System processes)
   "Confirmed" (Customer sees update)
   ```

3. **Priority-based Assignment:**
   - **Shipping Date Priority**: Earlier shipping dates get higher priority
   - **Customer Type Priority**: Shop Cat 1 > Shop Cat 2 > Shop Cat 3 > Retail
   - **Order Date Priority**: Older orders get higher priority
   - **Credit Status Priority**: Shops with good payment history get priority

**Internal Billing Hold System:**

1. **Shop Blocking Process:**
   ```
   Admin Portal: "Accounting Related" tab
   ├── Shops with Outstanding Payments
   │   ├── Al-Sheika Tuas │ Outstanding: $2,450 │ Days Overdue: 45
   │   │   └── [🔒 Block Shop] [📊 View Aging Report]
   │   └── Al-Sheika Boon Lay │ Outstanding: $1,890 │ Days Overdue: 30
   │       └── [🔒 Block Shop] [📊 View Aging Report]
   └── Blocked Shops
       ├── Al-Sheika Tuas │ Blocked: 2024-01-10 │ Reason: Payment overdue
       └── [🔓 Unblock Shop] [📧 Send Payment Reminder]
   ```

2. **Blocking Effects:**
   - **Order Placement**: Blocked shops cannot place new orders
   - **Template Usage**: Existing templates are disabled
   - **Customer Portal**: Shows "Account on hold" message
   - **Admin Notifications**: Real-time alerts for blocked shops

3. **Unblocking Process:**
   ```
   Admin Portal: "Unblock Shop" workflow
   1. Review payment history and outstanding amounts
   2. Verify payment received or payment plan agreed
   3. Update credit status and payment terms
   4. Remove billing hold flag
   5. Send notification to shop about account reactivation
   ```

4. **Credit Limit Validation:**
   ```
   Order Placement Process:
   Customer Portal: [📋 Place Order] → $1,500 order
   ↓
   System Check: Current outstanding + new order vs credit limit
   ├── If within limit: Order proceeds
   ├── If exceeds limit: Show "Credit limit exceeded" error
   └── If shop blocked: Show "Account on hold" error
   ```

#### **👥 Role-based Access by Organization & Shop**

**Organization Level Roles:**
- **Super Admin**: Full access across all organizations
- **Organization Admin**: Manage shops within their organization
- **Organization Manager**: View and manage orders for their organization

**Shop Level Roles:**
- **Shop Owner**: Full access to their shop location
- **Shop Manager**: Order management and staff supervision
- **PIC of Ordering**: Place and modify orders
- **PIC of Payments**: Handle billing and payment processing

**Example Role Assignment:**
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
