import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

// --- GET PRODUCT ---
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    if (productId === "new") {
      return new NextResponse(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!productId) {
      return new NextResponse("Missing productId", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: {
          include: {
            fields: true, // Fetch fields related to the category
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Include category fields in the response
    const productWithFields = {
      ...product,
      nameEn: product.nameEn || null,
      productDescriptionEn: product.productDescriptionEn || null,
      category: {
        ...product.category,
        fields: product.category?.fields || [], // Ensure fields are returned properly
      },
    };

    return new NextResponse(JSON.stringify(productWithFields), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- PATCH PRODUCT ---
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeId, productId } = params;
    const body = await req.json();
    const {
      name,
      nameEn, // Added English name
      price,
      categoryId,
      images,
      isFeatured,
      isArchived,
      productDescription,
      productDescriptionEn, // Added English product description
    } = body;

    if (!name || !price || !categoryId || !images || !images.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 401 });

    // Update product details
    await prismadb.product.update({
      where: { id: productId },
      data: {
        name,
        nameEn, // Update English name
        price,
        categoryId,
        isFeatured,
        isArchived,
        productDescription,
        productDescriptionEn, // Update English product description
        images: { deleteMany: {} }, // Clear previous images
      },
    });

    const product = await prismadb.product.update({
      where: { id: productId },
      data: {
        images: {
          createMany: { data: images.map((image: { url: string }) => image) },
        },
      },
    });

    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- DELETE PRODUCT ---
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeId, productId } = params;

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 401 });

    const relatedOrderItems = await prismadb.orderItem.findMany({
      where: { productId },
    });

    if (relatedOrderItems.length > 0) {
      return new NextResponse(
        "Cannot delete product with associated order items",
        {
          status: 400,
        }
      );
    }

    const product = await prismadb.product.delete({
      where: { id: productId },
    });

    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- CREATE ORDER ITEM ---
// This is the new functionality for adding items to an order with quantity.
export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { orderId } = params;
    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || quantity <= 0) {
      return new NextResponse("Missing or invalid quantity", { status: 400 });
    }

    const order = await prismadb.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const orderItem = await prismadb.orderItem.create({
      data: {
        orderId,
        productId,
        quantity, // Handle quantity here
      },
    });

    return new NextResponse(JSON.stringify(orderItem), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ORDER_ITEM_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
