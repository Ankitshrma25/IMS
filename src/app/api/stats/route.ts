import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Request from '@/models/Request';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get user info from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userSection = request.headers.get('x-user-section');

    // Build query filters based on user role
    let itemQuery: any = { isActive: true };
    let requestQuery: any = { isActive: true };

    if (userRole === 'localStoreManager' && userSection) {
      itemQuery.section = userSection;
      requestQuery.requesterSection = userSection;
    }

    // Get item statistics
    const totalItems = await Item.countDocuments(itemQuery);
    const lowStockItems = await Item.countDocuments({
      ...itemQuery,
      $expr: { $lte: ['$stockLevel', '$minStockLevel'] }
    });
    const outOfStockItems = await Item.countDocuments({
      ...itemQuery,
      stockLevel: 0
    });

    // Get condition-based statistics
    const serviceableItems = await Item.countDocuments({
      ...itemQuery,
      conditionStatus: 'serviceable'
    });
    const unserviceableItems = await Item.countDocuments({
      ...itemQuery,
      conditionStatus: 'unserviceable'
    });

    // Get grant type statistics
    const ordnanceItems = await Item.countDocuments({
      ...itemQuery,
      category: 'ORDNANCE'
    });
    const dgemeItems = await Item.countDocuments({
      ...itemQuery,
      category: 'DGEME'
    });
    const pmseItems = await Item.countDocuments({
      ...itemQuery,
      category: 'PMSE'
    });
    const ttgItems = await Item.countDocuments({
      ...itemQuery,
      category: 'TTG'
    });

    // Calculate total value
    const items = await Item.find(itemQuery);
    const totalValue = items.reduce((sum, item) => sum + (item.cost * item.stockLevel), 0);

    // Get request statistics
    const pendingRequests = await Request.countDocuments({
      ...requestQuery,
      status: 'pending'
    });
    const approvedRequests = await Request.countDocuments({
      ...requestQuery,
      status: 'approved'
    });

    // Get items expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringItems = await Item.countDocuments({
      ...itemQuery,
      expirationDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    });

    // Get items needing calibration soon (within 30 days)
    const calibrationDueItems = await Item.countDocuments({
      ...itemQuery,
      calibrationSchedule: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    });

    return NextResponse.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      serviceableItems,
      unserviceableItems,
      ordnanceItems,
      dgemeItems,
      pmseItems,
      ttgItems,
      totalValue,
      pendingRequests,
      approvedRequests,
      expiringItems,
      calibrationDueItems,
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 