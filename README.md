# Customer Product Hub

A comprehensive React application for an Indian grocery business (Selvi Mills) that serves both customers and administrators. This is a B2B/B2C platform for ordering Indian groceries and managing the entire order lifecycle.

## 🌐 Live Demo

**Public URL**: `https://prepared-mako-sharp.ngrok-free.app`

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
- **Local**: `http://localhost:5173/`
- **Network**: `http://192.168.1.106:5173/` (same WiFi network)
- **Public**: `https://prepared-mako-sharp.ngrok-free.app` (via ngrok tunnel)

## 🔗 Tunnel Setup for Client Sharing

### Using Ngrok (Recommended)

1. **Sign up for ngrok** (Free account): https://dashboard.ngrok.com/signup
2. **Get your authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configure ngrok**:
   ```bash
   npx ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```
4. **Start the tunnel**:
   ```bash
   npx ngrok http 5173 --domain=prepared-mako-sharp.ngrok-free.app
   ```

### Alternative Tunnel Services

If ngrok doesn't work, try these alternatives:

#### Cloudflared (No authentication required)
```bash
npx cloudflared tunnel --url http://localhost:5173
```

#### Localtunnel (May have firewall issues)
```bash
npx localtunnel --port 5173 --subdomain customerproducthub
```

## 🛠️ Features

### Customer Features
- **Product Catalog** - Browse Indian groceries (spices, lentils, rice, snacks, beverages, etc.)
- **Shopping Cart** - Add/remove items, adjust quantities
- **Order Management** - Place orders, view order history, modify existing orders
- **Template System** - Save and reuse order templates for recurring purchases
- **Support Tickets** - Create tickets for order issues (delays, missing items, etc.)
- **Profile Management** - Manage shipping addresses, contact info, shop details

### Admin Features
- **Order Management** - Process orders, assign staff, update statuses
- **User Management** - Manage internal staff and external customers
- **Product Catalog Management** - Add/edit products, manage pricing
- **Organization & Shop Management** - Manage customer organizations and their shops
- **Support Ticket Management** - Handle customer support requests
- **Billing & Shipping** - Manage billing processes and delivery schedules

## 🏗️ Technical Architecture

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks (useState, useEffect, useCallback, useMemo)
- **Styling**: Tailwind CSS
- **Persistence**: Local Storage with cross-tab synchronization
- **Tunnel Service**: Ngrok for public access

## 📁 Project Structure

```
customer-product-hub/
├── App.tsx                 # Main application component
├── components/             # Reusable UI components
├── constants.ts            # Mock data and constants
├── types.ts               # TypeScript type definitions
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Components
- **Navbar/AdminNavbar** - Navigation for different user types
- **ProductCard** - Product display component
- **CartItemDisplay** - Shopping cart item component
- **Modal** - Reusable modal system
- **Button** - Styled button component
- **DatePicker** - Date selection component
- **PanelControlBar** - Admin panel controls

## 📊 Data Structures

- **Products** - Indian grocery items with categories, pricing, UOM
- **Orders** - Complete order lifecycle with status tracking
- **Templates** - Reusable order templates
- **Users** - Both internal staff and external customers
- **Organizations** - Customer organizations with multiple shops
- **Modification Requests** - Order change request system

## 🌍 Deployment

### For Client Sharing
1. Start the development server: `npm run dev`
2. Set up ngrok tunnel: `npx ngrok http 5173 --domain=your-domain.ngrok-free.app`
3. Share the ngrok URL with clients

### For Production
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software for Selvi Mills.

## 📞 Support

For support or questions, please contact the development team.

---

**Last Updated**: July 2024
**Tunnel Method**: Ngrok (replaced localtunnel due to firewall restrictions)
