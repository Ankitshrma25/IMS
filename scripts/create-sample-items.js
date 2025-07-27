const mongoose = require('mongoose');

// Item Schema (simplified version for the script)
const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true,
    enum: ['ORDNANCE', 'DGEME', 'PMSE', 'TTG']
  },
  section: { type: String, required: true },
  location: { 
    type: String, 
    required: true,
    enum: ['localStore', 'wsgStore', 'cod']
  },
  stockLevel: { type: Number, required: true, min: 0 },
  minStockLevel: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  conditionStatus: { 
    type: String, 
    required: true,
    enum: ['Serviceable', 'Unserviceable', 'OBT', 'OBE']
  },
  dateReceived: { type: Date, default: Date.now },
  lastIssued: { type: Date },
  leadTime: { type: Number, default: 7 },
  calibrationSchedule: { type: Date },
  expirationDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

async function createSampleItems() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management-system';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if items already exist
    const existingItems = await Item.find({});
    if (existingItems.length > 0) {
      console.log('Items already exist in the database:');
      existingItems.forEach(item => {
        console.log(`- ${item.itemName} (${item.category}) - ${item.section} - Stock: ${item.stockLevel}`);
      });
      return;
    }

    // Create sample items
    const sampleItems = [
      // ORDNANCE Section Items (Local Store)
      {
        itemName: 'Rifle Scope',
        serialNumber: 'ORD-001-2024',
        category: 'ORDNANCE',
        section: 'ORDNANCE',
        location: 'localStore',
        stockLevel: 15,
        minStockLevel: 5,
        cost: 25000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 14,
        calibrationSchedule: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'Ammunition Box',
        serialNumber: 'ORD-002-2024',
        category: 'ORDNANCE',
        section: 'ORDNANCE',
        location: 'localStore',
        stockLevel: 8,
        minStockLevel: 10,
        cost: 5000,
        unit: 'boxes',
        conditionStatus: 'Serviceable',
        leadTime: 7,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'Gun Cleaning Kit',
        serialNumber: 'ORD-003-2024',
        category: 'ORDNANCE',
        section: 'ORDNANCE',
        location: 'localStore',
        stockLevel: 25,
        minStockLevel: 8,
        cost: 1500,
        unit: 'kits',
        conditionStatus: 'Serviceable',
        leadTime: 5,
      },

      // DGEME Section Items (Local Store)
      {
        itemName: 'Engine Oil Filter',
        serialNumber: 'DGEME-001-2024',
        category: 'DGEME',
        section: 'DGEME',
        location: 'localStore',
        stockLevel: 12,
        minStockLevel: 6,
        cost: 800,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 10,
      },
      {
        itemName: 'Brake Pads',
        serialNumber: 'DGEME-002-2024',
        category: 'DGEME',
        section: 'DGEME',
        location: 'localStore',
        stockLevel: 3,
        minStockLevel: 8,
        cost: 2500,
        unit: 'sets',
        conditionStatus: 'Serviceable',
        leadTime: 12,
      },
      {
        itemName: 'Battery Pack',
        serialNumber: 'DGEME-003-2024',
        category: 'DGEME',
        section: 'DGEME',
        location: 'localStore',
        stockLevel: 18,
        minStockLevel: 5,
        cost: 3500,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 8,
      },

      // PMSE Section Items (Local Store)
      {
        itemName: 'Multimeter',
        serialNumber: 'PMSE-001-2024',
        category: 'PMSE',
        section: 'PMSE',
        location: 'localStore',
        stockLevel: 6,
        minStockLevel: 4,
        cost: 12000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 15,
        calibrationSchedule: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'Oscilloscope',
        serialNumber: 'PMSE-002-2024',
        category: 'PMSE',
        section: 'PMSE',
        location: 'localStore',
        stockLevel: 2,
        minStockLevel: 3,
        cost: 45000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 20,
        calibrationSchedule: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'Signal Generator',
        serialNumber: 'PMSE-003-2024',
        category: 'PMSE',
        section: 'PMSE',
        location: 'localStore',
        stockLevel: 4,
        minStockLevel: 2,
        cost: 28000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 18,
        calibrationSchedule: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },

      // TTG Section Items (Local Store)
      {
        itemName: 'GPS Device',
        serialNumber: 'TTG-001-2024',
        category: 'TTG',
        section: 'TTG',
        location: 'localStore',
        stockLevel: 10,
        minStockLevel: 5,
        cost: 18000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 12,
      },
      {
        itemName: 'Radio Transceiver',
        serialNumber: 'TTG-002-2024',
        category: 'TTG',
        section: 'TTG',
        location: 'localStore',
        stockLevel: 7,
        minStockLevel: 4,
        cost: 22000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 14,
      },
      {
        itemName: 'Satellite Phone',
        serialNumber: 'TTG-003-2024',
        category: 'TTG',
        section: 'TTG',
        location: 'localStore',
        stockLevel: 3,
        minStockLevel: 2,
        cost: 65000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 25,
      },

      // WSG Store Items (Central Store)
      {
        itemName: 'Advanced Rifle Scope',
        serialNumber: 'ORD-004-2024',
        category: 'ORDNANCE',
        section: 'ORDNANCE',
        location: 'wsgStore',
        stockLevel: 8,
        minStockLevel: 3,
        cost: 45000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 21,
        calibrationSchedule: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'High-Precision Multimeter',
        serialNumber: 'PMSE-004-2024',
        category: 'PMSE',
        section: 'PMSE',
        location: 'wsgStore',
        stockLevel: 4,
        minStockLevel: 2,
        cost: 35000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 25,
        calibrationSchedule: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        itemName: 'Heavy Duty Engine Parts',
        serialNumber: 'DGEME-004-2024',
        category: 'DGEME',
        section: 'DGEME',
        location: 'wsgStore',
        stockLevel: 6,
        minStockLevel: 4,
        cost: 15000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 18,
      },
      {
        itemName: 'Advanced Communication System',
        serialNumber: 'TTG-004-2024',
        category: 'TTG',
        section: 'TTG',
        location: 'wsgStore',
        stockLevel: 2,
        minStockLevel: 1,
        cost: 85000,
        unit: 'pieces',
        conditionStatus: 'Serviceable',
        leadTime: 30,
      },
    ];

    for (const itemData of sampleItems) {
      const item = new Item(itemData);
      await item.save();
      console.log(`Created item: ${item.itemName} (${item.category}) - ${item.section} - Stock: ${item.stockLevel}`);
    }

    console.log('\n✅ Sample items created successfully!');
    console.log('\n📋 Item Summary:');
    console.log('- ORDNANCE items: 4 (3 local, 1 WSG)');
    console.log('- DGEME items: 4 (3 local, 1 WSG)');
    console.log('- PMSE items: 4 (3 local, 1 WSG)');
    console.log('- TTG items: 4 (3 local, 1 WSG)');
    console.log('\n💡 Each section has its own local store with section-specific items');
    console.log('💡 WSG store contains advanced/rare items for all sections');

  } catch (error) {
    console.error('Error creating sample items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createSampleItems(); 