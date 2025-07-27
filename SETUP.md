# Quick Setup Guide

## 🚀 Environment Configuration

### Option 1: Interactive Setup (Recommended)
```bash
npm run setup
```
This will guide you through the setup process and create your `.env.local` file automatically.

### Option 2: Manual Setup
1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and update the following variables:
   ```env
   # Required - Database connection
   MONGODB_URI=mongodb://localhost:27017/inventory-management-system
   
   # Required - Security keys (auto-generated if using setup script)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
   
   # Optional - Environment
   NODE_ENV=development
   ```

### Option 3: Quick Copy
```bash
npm run setup:env
```

## 🔧 Required Environment Variables

### Essential Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXTAUTH_SECRET` - Secret key for NextAuth

### Optional Variables
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `ENABLE_ANALYTICS` - Enable analytics features
- `ENABLE_EXPORT_REPORTS` - Enable report export

## 📋 Setup Checklist

- [ ] Environment variables configured
- [ ] MongoDB running and accessible
- [ ] Dependencies installed (`npm install`)
- [ ] Development server started (`npm run dev`)
- [ ] Application accessible at http://localhost:3000

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env.local`
   - Verify network access

2. **JWT Secret Error**
   - Ensure `JWT_SECRET` is set in `.env.local`
   - Use a strong, random string

3. **Port Already in Use**
   - Change port: `npm run dev -- -p 3001`
   - Or kill existing process

4. **Build Errors**
   - Clear cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Setup environment (interactive)
npm run setup

# Quick environment setup
npm run setup:env
```

## 📊 Production Deployment

For production deployment, update these variables in `.env.local`:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management-system
JWT_SECRET=your-production-jwt-secret-key
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com/api
LOG_LEVEL=info
ENABLE_DEBUG_MODE=false
ENABLE_HOT_RELOAD=false
```

## 🔐 Security Notes

- **Never commit `.env.local`** to version control
- **Use strong, unique secrets** for JWT and NextAuth
- **Change default passwords** in production
- **Enable HTTPS** in production environments
- **Regular security updates** for dependencies

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the main README.md file
3. Check the console for error messages
4. Verify all environment variables are set correctly 