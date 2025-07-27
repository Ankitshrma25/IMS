# 509 Army Based Workshop Inventory Management System

A comprehensive inventory management system designed specifically for the 509 Army Based Workshop, covering workflows from local section stores to the central WSG store and external COD (Central Ordnance Depot).

## 🎯 Features

### Authentication & Authorization
- **JWT-based Authentication** with bcrypt password hashing
- **Role-based Access Control** with two main roles:
  - `localStoreManager`: Manages local section stores
  - `wsgStoreManager`: Manages central WSG store
- **Protected API Routes** with middleware validation
- **Session Management** with secure token handling

### Inventory Management
- **Grant-based Categorization**: ORDNANCE, DGEME, PMSE, TTG
- **Comprehensive Item Tracking**:
  - Serial number tracking
  - Condition status (Serviceable, Unserviceable, OBT, OBE)
  - Date received and last issued
  - Minimum stock levels and lead times
  - Calibration schedules and expiration dates
  - Complete transaction history
- **Multi-location Support**: Local Store, WSG Store, COD
- **Stock Level Monitoring** with automatic alerts
- **Item Lifecycle Management** from procurement to disposal

### Request & Allocation Workflow
1. **Local Store Request**: Technicians initiate requests from their section's local store
2. **Local Store to WSG**: Local store managers forward requests to WSG store
3. **WSG Allocation**: WSG store checks stock, allocates items, and generates acknowledgments
4. **COD Procurement**: External procurement requests when items are unavailable
5. **Status Tracking**: Complete workflow visibility with real-time updates

### Reporting & Analytics
- **Dashboard Analytics** for both local store and WSG managers
- **Grant Type Distribution** with stock value calculations
- **Consumption Trends** and allocation logs
- **Alert System** for:
  - Items below minimum stock
  - Items nearing expiration
  - Calibration due items
  - OBT and OBE item status
- **Exportable Reports** in JSON format
- **Real-time Statistics** and trend analysis

## 🏗️ Architecture

### Backend (Next.js API Routes)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt hashing
- **API Routes**:
  - `/api/auth/*` - Authentication endpoints
  - `/api/items/*` - Inventory management
  - `/api/requests/*` - Request workflow
  - `/api/analytics` - Reporting and analytics
  - `/api/stats` - Real-time statistics

### Frontend (React + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for modern, responsive design
- **State Management**: React Context for authentication
- **Charts**: Recharts for data visualization
- **Components**:
  - `LoginForm` - User authentication
  - `Dashboard` - Main application interface
  - `InventoryOverview` - Stock statistics and alerts
  - `ItemManagement` - CRUD operations for inventory
  - `RequestManagement` - Workflow management
  - `Reports` - Analytics and reporting
  - `UserProfile` - User account management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The application will automatically create collections and indexes

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Workflow Overview

### Local Store Manager Workflow
1. **Login** with local store manager credentials
2. **View Inventory** specific to their section
3. **Process Requests** from technicians
4. **Forward Requests** to WSG when local stock is insufficient
5. **Allocate Items** from local stock when available
6. **Generate Reports** for section-specific analytics

### WSG Store Manager Workflow
1. **Login** with WSG store manager credentials
2. **View Global Inventory** across all sections
3. **Process Forwarded Requests** from local stores
4. **Allocate Items** from WSG stock
5. **Forward to COD** for external procurement
6. **Monitor Trends** and generate comprehensive reports

### Request Lifecycle
```
Technician Request → Local Store Review → WSG Allocation → COD Procurement
     ↓                    ↓                    ↓                    ↓
   Pending            Approved/Rejected    Allocated           Completed
```

## 🔧 Configuration

### Database Models

#### User Model
```typescript
{
  username: string;
  password: string; // hashed with bcrypt
  name: string;
  role: 'localStoreManager' | 'wsgStoreManager';
  section?: string; // for local store managers
  rank?: string;
  isActive: boolean;
}
```

#### Item Model
```typescript
{
  itemName: string;
  serialNumber: string;
  category: 'ORDNANCE' | 'DGEME' | 'PMSE' | 'TTG';
  section: string;
  location: 'localStore' | 'wsgStore' | 'cod';
  stockLevel: number;
  minStockLevel: number;
  cost: number;
  unit: string;
  conditionStatus: 'Serviceable' | 'Unserviceable' | 'OBT' | 'OBE';
  dateReceived: Date;
  lastIssued?: Date;
  leadTime: number;
  calibrationSchedule?: Date;
  expirationDate?: Date;
  transactionHistory: Transaction[];
}
```

#### Request Model
```typescript
{
  requestNumber: string; // auto-generated
  requesterId: ObjectId;
  requesterName: string;
  requesterSection: string;
  items: RequestItem[];
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  currentLocation: 'localStore' | 'wsgStore' | 'cod';
  allocatedFrom?: 'localStore' | 'wsgStore' | 'cod';
  totalCost: number;
  consumptionLog: ConsumptionLog[];
}
```

## 📈 Analytics & Reporting

### Available Reports
1. **Stock Report**: Grant type distribution and stock levels
2. **Consumption Report**: Usage trends and patterns
3. **Requests Report**: Workflow statistics and status
4. **Full Analytics**: Comprehensive system overview

### Key Metrics
- Total stock by grant type
- Items below minimum stock levels
- Items nearing expiration (30-day window)
- Calibration due items
- OBT and OBE item status
- Consumption trends
- Allocation logs
- COD procurement requests

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **Role-based Access Control** for different user types
- **Protected API Routes** with middleware validation
- **Input Validation** and sanitization
- **Error Handling** with proper HTTP status codes

## 🎨 UI/UX Features

- **Responsive Design** that works on all devices
- **Modern Interface** with Tailwind CSS styling
- **Real-time Updates** for inventory and request status
- **Interactive Charts** for data visualization
- **Modal Dialogs** for actions and confirmations
- **Loading States** and error handling
- **Black Text Color** on all input fields for better readability

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
NODE_ENV=production
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Inventory Endpoints
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item
- `POST /api/items/[id]/transactions` - Add transaction

### Request Endpoints
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create new request
- `POST /api/requests/[id]/actions` - Perform request actions

### Analytics Endpoints
- `GET /api/analytics` - Get comprehensive analytics
- `GET /api/stats` - Get real-time statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Refer to the documentation above

## 🔄 Version History

- **v1.0.0** - Initial release with basic inventory management
- **v1.1.0** - Added request workflow and allocation system
- **v1.2.0** - Enhanced analytics and reporting features
- **v1.3.0** - Complete grant-based categorization and advanced tracking

---

**Developed for 509 Army Based Workshop**  
*Comprehensive inventory management solution for military workshop operations*
