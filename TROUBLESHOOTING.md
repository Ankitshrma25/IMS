# Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **Application Not Working / Can't Add Requests**

#### **Problem**: The application loads but you can't create new requests or nothing seems to work.

#### **Solution**:
1. **Check if MongoDB is running**:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

2. **Verify environment variables**:
   ```bash
   # Check if .env.local exists
   ls -la .env.local
   
   # If not, run setup
   npm run setup
   ```

3. **Create test data**:
   ```bash
   # Create test users and items
   npm run setup-demo
   ```

4. **Restart the development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### 2. **Login Issues**

#### **Problem**: Can't log in or getting authentication errors.

#### **Solution**:
1. **Use the test credentials**:
   ```
   Local Store Manager:
   Username: localmanager
   Password: password123
   
   WSG Store Manager:
   Username: wsgmanager
   Password: password123
   
   Admin:
   Username: admin
   Password: password123
   ```

2. **Check if users exist**:
   ```bash
   npm run create-users
   ```

3. **Clear browser cache and localStorage**:
   - Open Developer Tools (F12)
   - Go to Application/Storage
   - Clear localStorage
   - Refresh the page

### 3. **Database Connection Issues**

#### **Problem**: Getting MongoDB connection errors.

#### **Solution**:
1. **Check MongoDB installation**:
   ```bash
   mongod --version
   ```

2. **Verify connection string in .env.local**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/inventory-management-system
   ```

3. **Test MongoDB connection**:
   ```bash
   # Connect to MongoDB shell
   mongosh
   # or
   mongo
   ```

### 4. **No Items Available for Requests**

#### **Problem**: Can't create requests because no items are available.

#### **Solution**:
1. **Create sample items**:
   ```bash
   npm run create-items
   ```

2. **Check item locations**:
   - Items must be in `localStore` to be available for requests
   - WSG items are only available to WSG managers

3. **Verify user section**:
   - Local store managers can only see items from their section
   - WSG managers can see all items

### 5. **API Errors**

#### **Problem**: Getting 500 errors or API failures.

#### **Solution**:
1. **Check server logs**:
   - Look at the terminal where `npm run dev` is running
   - Check for error messages

2. **Verify API routes**:
   - Ensure all API files exist in `src/app/api/`
   - Check file permissions

3. **Test API endpoints**:
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   ```

### 6. **Build Errors**

#### **Problem**: Getting TypeScript or build errors.

#### **Solution**:
1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check TypeScript errors**:
   ```bash
   npm run lint
   ```

### 7. **Performance Issues**

#### **Problem**: Application is slow or unresponsive.

#### **Solution**:
1. **Check database performance**:
   - Ensure MongoDB has enough memory
   - Check for slow queries

2. **Optimize development**:
   ```bash
   # Use production build for testing
   npm run build
   npm start
   ```

3. **Monitor resources**:
   - Check CPU and memory usage
   - Close unnecessary browser tabs

## 🔧 Quick Fix Commands

### **Complete Reset**:
```bash
# 1. Stop the server
# 2. Clear everything
rm -rf .next node_modules
npm install
npm run setup
npm run setup-demo
npm run dev
```

### **Database Reset**:
```bash
# Drop and recreate database
mongosh inventory-management-system --eval "db.dropDatabase()"
npm run setup-demo
```

### **Environment Reset**:
```bash
# Remove and recreate environment
rm .env.local
npm run setup
```

## 📋 Verification Checklist

Before reporting an issue, verify:

- [ ] MongoDB is running and accessible
- [ ] `.env.local` file exists and has correct values
- [ ] Test users exist in database
- [ ] Sample items exist in database
- [ ] Development server is running on http://localhost:3000
- [ ] No console errors in browser
- [ ] No terminal errors

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at terminal output and browser console
2. **Verify setup**: Run `npm run setup-demo` to ensure test data exists
3. **Test step by step**: Try logging in with test credentials first
4. **Check network**: Ensure no firewall is blocking localhost:3000
5. **Update dependencies**: Run `npm update` to get latest versions

## 📞 Support Information

- **Application**: 509 Army Based Workshop Inventory Management System
- **Version**: 1.3.0
- **Database**: MongoDB
- **Framework**: Next.js 15 with React 19
- **Environment**: Development/Production

---

**Remember**: Most issues can be resolved by ensuring the database is running and test data exists. Always start with `npm run setup-demo` if you're unsure about the data state. 