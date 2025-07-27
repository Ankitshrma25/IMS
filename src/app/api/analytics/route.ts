import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Request from '@/models/Request';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const grantType = searchParams.get('grantType');

    // Get user info from headers
    const userRole = request.headers.get('x-user-role');
    const userSection = request.headers.get('x-user-section');

    // Build query filters
    let itemQuery: any = { isActive: true };
    let requestQuery: any = { isActive: true };

    if (userRole === 'localStoreManager' && userSection) {
      itemQuery.section = userSection;
      requestQuery.requesterSection = userSection;
    }

    if (section) {
      itemQuery.section = section;
      requestQuery.requesterSection = section;
    }

    if (grantType) {
      itemQuery.category = grantType;
    }

    // Date range filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // 1. Stock Statistics by Grant Type
    const stockByGrantType = await Item.aggregate([
      { $match: itemQuery },
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalStock: { $sum: '$stockLevel' },
          totalValue: { $sum: { $multiply: ['$stockLevel', '$cost'] } },
          lowStockItems: {
            $sum: {
              $cond: [
                { $lte: ['$stockLevel', '$minStockLevel'] },
                1,
                0,
              ],
            },
          },
          outOfStockItems: {
            $sum: {
              $cond: [
                { $eq: ['$stockLevel', 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // 2. Condition Status Statistics
    const conditionStats = await Item.aggregate([
      { $match: itemQuery },
      {
        $group: {
          _id: '$conditionStatus',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stockLevel', '$cost'] } },
        },
      },
    ]);

    // 3. Items below minimum stock
    const lowStockItems = await Item.find({
      ...itemQuery,
      $expr: { $lte: ['$stockLevel', '$minStockLevel'] },
    }).sort({ stockLevel: 1 });

    // 4. Items nearing expiration (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringItems = await Item.find({
      ...itemQuery,
      expirationDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    }).sort({ expirationDate: 1 });

    // 5. Items needing calibration (within 30 days)
    const calibrationDueItems = await Item.find({
      ...itemQuery,
      calibrationSchedule: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    }).sort({ calibrationSchedule: 1 });

    // 6. OBT and OBE items
    const obsoletItems = await Item.find({
      ...itemQuery,
      conditionStatus: { $in: ['OBT', 'OBE'] },
    });

    // 7. Request Statistics
    const requestStats = await Request.aggregate([
      { $match: { ...requestQuery, ...dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' },
        },
      },
    ]);

    // 8. Consumption Trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const consumptionTrends = await Request.aggregate([
      {
        $match: {
          ...requestQuery,
          status: 'allocated',
          allocationDate: { $gte: thirtyDaysAgo },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$allocationDate' } },
            category: '$items.category',
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalCost: { $sum: '$items.estimatedCost' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // 9. Allocation Logs
    const allocationLogs = await Request.find({
      ...requestQuery,
      status: 'allocated',
      ...dateFilter,
    })
      .populate('requesterId', 'name username')
      .populate('allocatedBy', 'name username')
      .sort({ allocationDate: -1 })
      .limit(50);

    // 10. COD Procurement Requests
    const codRequests = await Request.find({
      ...requestQuery,
      status: 'forwardedToCOD',
      ...dateFilter,
    })
      .populate('requesterId', 'name username')
      .sort({ createdAt: -1 });

    // 11. Pending Requests by Priority
    const pendingRequests = await Request.aggregate([
      {
        $match: {
          ...requestQuery,
          status: 'pending',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' },
        },
      },
    ]);

    // 12. Top Requested Items
    const topRequestedItems = await Request.aggregate([
      {
        $match: {
          ...requestQuery,
          status: { $in: ['allocated', 'completed'] },
          ...dateFilter,
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.itemName',
          totalQuantity: { $sum: '$items.quantity' },
          requestCount: { $sum: 1 },
          totalCost: { $sum: '$items.estimatedCost' },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return NextResponse.json({
      stockByGrantType,
      conditionStats,
      lowStockItems,
      expiringItems,
      calibrationDueItems,
      obsoletItems,
      requestStats,
      consumptionTrends,
      allocationLogs,
      codRequests,
      pendingRequests,
      topRequestedItems,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 