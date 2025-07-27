import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import Item from "@/models/Item";
import { IRequest } from "@/models/Request";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { action, performedBy, notes, allocatedFrom } = await request.json();
    console.log('Action request body:', { action, performedBy, notes, allocatedFrom });

    if (!action || !performedBy) {
      return NextResponse.json(
        { error: "Action and performedBy are required" },
        { status: 400 }
      );
    }

    // Fix: Await context.params if needed (Next.js 13+)
    const { id } = await context.params;
    console.log('Request ID:', id);
    const requestDoc = await Request.findById(id) as IRequest;
    console.log('RequestDoc:', requestDoc);
    if (!requestDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    switch (action) {
      case "forwardToWSG":
        requestDoc.status = "forwardedToWSG";
        await requestDoc.save();
        break;

      case "forwardToCOD":
        requestDoc.status = "forwardedToCOD";
        await requestDoc.save();
        break;

      case "allocate":
        if (!allocatedFrom) {
          return NextResponse.json(
            { error: "allocatedFrom is required for allocation" },
            { status: 400 }
          );
        }

        // Check if items are available for allocation
        for (const item of requestDoc.items) {
          const itemDoc = await Item.findById(item.itemId);
          if (!itemDoc) {
            return NextResponse.json(
              { error: `Item ${item.itemName} not found` },
              { status: 404 }
            );
          }

          // Allow WSG to allocate from localStore or wsgStore
          if (allocatedFrom === 'wsgStore') {
            if (!(itemDoc.location === 'wsgStore' || itemDoc.location === 'localStore')) {
              return NextResponse.json(
                {
                  error: `Item ${item.itemName} is not available at wsgStore or localStore`,
                },
                { status: 400 }
              );
            }
          } else if (itemDoc.location !== allocatedFrom) {
            return NextResponse.json(
              {
                error: `Item ${item.itemName} is not available at ${allocatedFrom}`,
              },
              { status: 400 }
            );
          }

          if (itemDoc.stockLevel < item.quantity) {
            return NextResponse.json(
              {
                error: `Insufficient stock for ${item.itemName}. Available: ${itemDoc.stockLevel}`,
              },
              { status: 400 }
            );
          }
        }

        // Allocate items and update stock
        // await requestDoc.allocateItems(performedBy, allocatedFrom);

        // Update item stock levels
        for (const item of requestDoc.items) {
          const itemDoc = await Item.findById(item.itemId);
          if (itemDoc) {
            await itemDoc.updateStock(item.quantity, "issued");
            await itemDoc.addTransaction({
              type: "issued",
              quantity: item.quantity,
              reference: requestDoc.requestNumber,
              notes: `Allocated for request ${requestDoc.requestNumber}`,
              performedBy,
            });
          }
        }
        // Set allocation metadata and status
        requestDoc.status = "allocated";
        requestDoc.allocatedFrom = allocatedFrom;
        requestDoc.allocationDate = new Date();
        requestDoc.allocatedBy = performedBy;
        await requestDoc.save();
        break;

      case "approve":
        // If localStore is approving, issue items immediately
        if (requestDoc.sourceLocation === "localStore") {
          // Check stock for all items
          for (const item of requestDoc.items) {
            const itemDoc = await Item.findById(item.itemId);
            if (!itemDoc) {
              return NextResponse.json(
                { error: `Item ${item.itemName} not found` },
                { status: 404 }
              );
            }
            if (itemDoc.location !== "localStore") {
              return NextResponse.json(
                { error: `Item ${item.itemName} is not available at localStore` },
                { status: 400 }
              );
            }
            if (itemDoc.stockLevel < item.quantity) {
              return NextResponse.json(
                { error: `Insufficient stock for ${item.itemName}. Available: ${itemDoc.stockLevel}` },
                { status: 400 }
              );
            }
          }
          // All items available, issue them
          // Generate a unique reference number
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const today = new Date(year, date.getMonth(), date.getDate());
          let counter = 1;
          let referenceNumber;
          let unique = false;
          while (!unique) {
            referenceNumber = `REQ-${year}${month}${day}-${String(counter).padStart(4, "0")}`;
            const exists = await Request.findOne({ requestNumber: referenceNumber });
            if (!exists) {
              unique = true;
            } else {
              counter++;
            }
          }
          for (const item of requestDoc.items) {
            const itemDoc = await Item.findById(item.itemId);
            if (itemDoc) {
              await itemDoc.updateStock(item.quantity, "issued");
              await itemDoc.addTransaction({
                type: "issued",
                quantity: item.quantity,
                reference: referenceNumber,
                notes: `Issued on approval for request ${requestDoc.requestNumber}`,
                performedBy,
              });
            }
          }
          // Update the request's requestNumber to the new unique reference
          requestDoc.requestNumber = referenceNumber;
        }
        requestDoc.status = "approved";
        requestDoc.approvedBy = new (require("mongoose").Types.ObjectId)(
          performedBy
        );
        requestDoc.approvedAt = new Date();
        if (notes) {
          requestDoc.notes += `\n${notes}`;
        }
        await requestDoc.save();
        break;

      case "reject":
        requestDoc.status = "rejected";
        requestDoc.rejectionReason = notes || "Request rejected";
        if (notes) {
          requestDoc.notes += `\nRejection reason: ${notes}`;
        }
        await requestDoc.save();
        break;

      case "complete":
        requestDoc.status = "completed";
        requestDoc.actualDeliveryDate = new Date();
        if (notes) {
          requestDoc.notes += `\n${notes}`;
        }
        await requestDoc.save();
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: `Request ${action} successful`,
      request: requestDoc,
    });
  } catch (error) {
    console.error("Request action error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error", details: error },
      { status: 500 }
    );
  }
}
