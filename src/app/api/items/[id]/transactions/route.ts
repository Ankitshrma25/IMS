import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { type, quantity, reference, notes, performedBy } = await request.json();

    if (!type || !quantity || !reference || !performedBy) {
      return NextResponse.json(
        { error: 'Type, quantity, reference, and performedBy are required' },
        { status: 400 }
      );
    }

    const item = await Item.findById(params.id);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Add transaction to history
    await item.addTransaction({
      type,
      quantity,
      reference,
      notes,
      performedBy,
    });

    // Update stock level
    await item.updateStock(quantity, type);

    // Update condition status if needed
    if (type === 'damaged') {
      item.conditionStatus = 'unserviceable';
      await item.save();
    }

    return NextResponse.json({
      message: 'Transaction recorded successfully',
      item,
    });

  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const item = await Item.findById(params.id);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transactions: item.transactionHistory,
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 