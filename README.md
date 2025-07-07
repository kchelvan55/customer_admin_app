# Customer Product Hub

A comprehensive React TypeScript application for managing customer orders and administrative tasks with advanced support ticket system and real-time cross-tab synchronization.

## 🚀 Live Demo

**Public Access (No WiFi Required):** [https://customerproducthub.loca.lt/](https://customerproducthub.loca.lt/)

*Note: If the tunnel link is not active, follow the local setup instructions below and create your own tunnel.*

## ✨ Features

### Customer Portal
- **Product Catalog** - Browse and search products with filtering and sorting
- **Shopping Cart** - Add/remove items with quantity management
- **Order Templates** - Save frequently ordered items for quick reordering
- **Order History** - View past orders with detailed information
- **Support Tickets** - Create tickets for order issues (delays, missing items, etc.)
- **Real-time Sync** - Changes sync instantly across multiple browser tabs

### Admin Dashboard
- **Order Management** - Comprehensive order tracking with status updates
- **Product Catalog Management** - Add, edit, and manage product inventory
- **Support Tickets System** - Handle customer issues with dynamic quick actions
- **User Management** - Manage customer accounts and permissions
- **Cross-tab Synchronization** - Real-time data updates across admin sessions

### Advanced Support System
- **ViewIssueModal** - Detailed issue viewing with context-specific information
- **Dynamic Quick Actions** - Issue-type specific action buttons:
  - Order Delay: Contact Customer
  - Missing Item: Contact Customer + Arrange Dues
  - Incorrect Item: Contact Customer + Arrange Exchange
  - Damaged Item: Contact Customer + Arrange Dues
  - Incorrect Quantity: Contact Customer + Arrange Dues

## 🛠️ Technical Stack

- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Hooks with localStorage persistence
- **Real-time Sync:** Storage Event API for cross-tab synchronization
- **Icons:** Custom SVG icon system

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

## 🏃‍♂️ Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kchelvan55/customer_admin_app.git
   cd customer_admin_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Local: `http://localhost:5173`
   - Network: `http://your-ip:5173`

## 🌐 Create Public Tunnel (Optional)

To allow external access without being on the same WiFi:

1. **Install localtunnel globally:**
   ```bash
   npm install -g localtunnel
   ```

2. **Start your local server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, create the tunnel:**
   ```bash
   lt --port 5173 --subdomain customerproducthub
   ```

4. **Share the link:** `https://customerproducthub.loca.lt/`

## 🎯 Usage Guide

### Customer Workflow
1. Browse products in the catalog
2. Add items to cart
3. Create orders with shipping details
4. Save frequently ordered items as templates
5. Create support tickets for any issues
6. Track order history and status

### Admin Workflow
1. Monitor incoming orders in Order Management
2. Update order statuses and manage fulfillment
3. Handle customer support tickets with quick actions
4. Manage product catalog and inventory
5. Oversee user accounts and permissions

### Cross-Tab Synchronization
- Open multiple browser tabs to see real-time updates
- Cart changes, orders, and support tickets sync instantly
- Navigation remains independent per tab for flexible workflow

## 📁 Project Structure

```
customer-product-hub/
├── App.tsx                     # Main application component
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Application constants
├── components/
│   ├── ViewIssueModal.tsx      # Support ticket issue details modal
│   ├── CreateTicketModal.tsx   # Support ticket creation modal
│   ├── Modal.tsx               # Reusable modal component
│   ├── Button.tsx              # Reusable button component
│   ├── Icon.tsx                # SVG icon system
│   ├── ProductCard.tsx         # Product display component
│   ├── CartItemDisplay.tsx     # Cart item component
│   ├── Navbar.tsx              # Customer navigation
│   ├── AdminNavbar.tsx         # Admin navigation
│   └── ...                     # Other utility components
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # This file
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## 🚀 Deployment

The application is currently hosted on GitHub and can be deployed to any static hosting service:

- **GitHub Repository:** [https://github.com/kchelvan55/customer_admin_app](https://github.com/kchelvan55/customer_admin_app)
- **Recommended Platforms:** Vercel, Netlify, GitHub Pages

## 🎨 Key Features Implemented

### Real-time Cross-Tab Sync
- Automatic synchronization of cart items, orders, and support tickets
- Independent navigation per tab for flexible workflow
- Storage event listeners for instant updates

### Advanced Support System
- Individual issue management with detailed context
- Dynamic quick action buttons based on issue type
- Comprehensive issue tracking and resolution workflow

### Admin Dashboard
- Comprehensive order management with editable fields
- Product catalog management with bulk operations
- Support ticket handling with priority assignment

### Customer Experience
- Intuitive product browsing with search and filters
- Template system for recurring orders
- Seamless order creation and tracking

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

**Developer:** Kalai Chelvan  
**Repository:** [https://github.com/kchelvan55/customer_admin_app](https://github.com/kchelvan55/customer_admin_app)

---

*Built with ❤️ using React, TypeScript, and modern web technologies*
