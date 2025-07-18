# Customer Product Hub

A comprehensive React application for an Indian grocery business (Selvi Mills) that serves both customers and administrators. This is a B2B/B2C platform for ordering Indian groceries and managing the entire order lifecycle.

## 🌐 Live Demo

**Production URL**: [https://customer-admin-app.vercel.app/](https://customer-admin-app.vercel.app/)

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

## 🏗️ Deployment

### Vercel Deployment (Recommended)
This app is automatically deployed to Vercel for 24/7 availability:

1. **Automatic Deployments**: Every push to the `main` branch triggers a new deployment
2. **Production URL**: [https://customer-admin-app.vercel.app/](https://customer-admin-app.vercel.app/)
3. **Build Process**: Uses `npm run build` with Vite
4. **Output Directory**: `dist/`

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

## 🎯 Key Features

### **Customer Portal:**
- **Product Catalog** - Browse Indian groceries (spices, lentils, rice, snacks, beverages, etc.)
- **Shopping Cart** - Add/remove items, adjust quantities
- **Order Management** - Place orders, view order history, modify existing orders
- **Real-time Updates** - Live order status tracking
- **Responsive Design** - Works on desktop, tablet, and mobile

### **Admin Portal:**
- **Order Management** - View, process, and track all customer orders
- **Product Management** - Add, edit, and manage product catalog
- **Customer Management** - View customer profiles and order history
- **Billing System** - Process payments and generate invoices
- **Analytics Dashboard** - Sales reports and business insights

### **Technical Features:**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern styling
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live order status changes
- **PDF Generation** - Order confirmations and invoices
- **Search & Filtering** - Advanced product search capabilities

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

## 📁 Project Structure

```
customer-product-hub/
├── components/          # Reusable UI components
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── constants.ts        # Mock data and constants
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
└── README.md           # Project documentation
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with all admin tools
- **Tablet**: Optimized layout for touch interactions
- **Mobile**: Streamlined interface for on-the-go ordering

## 🔄 Continuous Deployment

- **GitHub Integration**: Automatic deployments on push to main branch
- **Vercel Platform**: Global CDN with automatic scaling
- **24/7 Availability**: No downtime when your laptop is closed
- **Instant Updates**: Changes are live within minutes

## 📞 Support

For technical support or questions about the application:
- **Repository**: [https://github.com/kchelvan55/customer_admin_app](https://github.com/kchelvan55/customer_admin_app)
- **Live Demo**: [https://customer-admin-app.vercel.app/](https://customer-admin-app.vercel.app/)

## 📄 License

This project is proprietary software for Selvi Mills customer product management system.
