import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import Item from "@/models/Item";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const section = searchParams.get("section");
    const priority = searchParams.get("priority");
    const location = searchParams.get("location");

    const query: Record<string, any> = { isActive: true };
    if (status) query.status = status;
    if (section) query.requesterSection = section;
    if (priority) query.priority = priority;
    if (location) query.currentLocation = location;

    // Sort: pending first, then others by createdAt descending
    const requests = await Request.find(query)
      // .populate({ path: "requesterId", select: "name username rank" })
      // .populate({ path: "approvedBy", select: "name username" })
      // .populate({ path: "allocatedBy", select: "name username" })
      .sort({
        status: { $eq: ["$status", "pending"] } ? -1 : 1,
        createdAt: -1
      })
      // .lean();

    // If .sort above does not work as intended, use manual sorting after fetching:
    // const requests = (await Request.find(query).sort({ createdAt: -1 })).toArray();
    // requests.sort((a, b) => (a.status === 'pending' && b.status !== 'pending') ? -1 : (a.status !== 'pending' && b.status === 'pending') ? 1 : 0);

    // After fetching requests, populate each item's stockLevel
    const requestsWithStock = await Promise.all(requests.map(async (req) => {
      const itemsWithStock = await Promise.all(req.items.map(async (item) => {
        const itemDoc = await Item.findById(item.itemId);
        return {
          ...item.toObject ? item.toObject() : item,
          stockLevel: itemDoc ? itemDoc.stockLevel : 0,
        };
      }));
      return {
        ...req.toObject ? req.toObject() : req,
        items: itemsWithStock,
      };
    }));
    return NextResponse.json({ requests: requestsWithStock }, { status: 200 });
  } catch (error: any) {
    console.error("Get requests error:", error);

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid query filter" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      requesterId,
      requesterName,
      requesterSection,
      requesterRank,
      items,
      priority,
      notes,
      sourceLocation = "localStore",
    } = await request.json();

    // Validate fields
    if (
      !requesterId ||
      !requesterName ||
      !requesterSection ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Required fields are missing or invalid" },
        { status: 400 }
      );
    }

    let totalCost = 0;
    const validatedItems = [];

    for (const item of items) {
      const itemDoc = await Item.findById(item.itemId);
      if (!itemDoc) {
        return NextResponse.json(
          { error: `Item with ID ${item.itemId} not found` },
          { status: 404 }
        );
      }

      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for item ${itemDoc.itemName}` },
          { status: 400 }
        );
      }

      if (itemDoc.location !== sourceLocation) {
        return NextResponse.json(
          {
            error: `Item ${itemDoc.itemName} not available at ${sourceLocation}`,
          },
          { status: 400 }
        );
      }

      const estimatedCost = itemDoc.cost * item.quantity;
      totalCost += estimatedCost;

      validatedItems.push({
        itemId: item.itemId,
        itemName: itemDoc.itemName,
        serialNumber: itemDoc.serialNumber,
        category: itemDoc.category,
        quantity: item.quantity,
        unit: itemDoc.unit,
        purpose: item.purpose,
        estimatedCost,
      });
    }

    // Generate request number manually
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const today = new Date(year, date.getMonth(), date.getDate());
    let counter = 1;
    let requestNumber;
    let unique = false;
    while (!unique) {
      requestNumber = `REQ-${year}${month}${day}-${String(counter).padStart(4, "0")}`;
      const exists = await Request.findOne({ requestNumber });
      if (!exists) {
        unique = true;
      } else {
        counter++;
      }
    }

    const newRequest = new Request({
      requestNumber,
      requesterId,
      requesterName,
      requesterSection,
      requesterRank,
      items: validatedItems,
      priority: priority || "medium",
      notes: notes || "",
      totalCost,
      sourceLocation,
      currentLocation: sourceLocation,
    });

    await newRequest.save();

    return NextResponse.json(
      { message: "Request created successfully", request: newRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
