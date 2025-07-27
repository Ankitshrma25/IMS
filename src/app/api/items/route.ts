import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const section = searchParams.get('section');
    const conditionStatus = searchParams.get('conditionStatus');
    const search = searchParams.get('search');

    let query: any = { isActive: true };

    if (category) query.category = category;
    if (location) query.location = location;
    if (section) query.section = section;
    if (conditionStatus) query.conditionStatus = conditionStatus;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(query)
      .sort({ itemName: 1 })
      .populate('transactionHistory');

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      itemName,
      description,
      category,
      serialNumber,
      conditionStatus,
      location,
      stockLevel,
      unit,
      supplier,
      dateReceived,
      minStockLevel,
      leadTime,
      calibrationSchedule,
      expirationDate,
      section,
      cost,
    } = await request.json();

    // Validate required fields
    if (!itemName || !category || !serialNumber || 
        !conditionStatus || !location || !stockLevel || !unit || 
        !supplier || !minStockLevel || !leadTime || !cost) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if serial number already exists
    const existingItem = await Item.findOne({ serialNumber });
    if (existingItem) {
      return NextResponse.json(
        { error: 'Serial number already exists' },
        { status: 409 }
      );
    }

    // Validate section is provided for localStore items
    if (location === 'localStore' && !section) {
      return NextResponse.json(
        { error: 'Section is required for local store items' },
        { status: 400 }
      );
    }

    const item = new Item({
      itemName,
      description,
      category,
      serialNumber,
      conditionStatus,
      location,
      stockLevel,
      unit,
      supplier,
      dateReceived: dateReceived ? new Date(dateReceived) : new Date(),
      minStockLevel,
      leadTime,
      calibrationSchedule: calibrationSchedule ? new Date(calibrationSchedule) : undefined,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      section,
      cost,
    });

    await item.save();

    return NextResponse.json({
      message: 'Item created successfully',
      item,
    }, { status: 201 });

  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 