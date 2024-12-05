import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // Validate the storeId
    if (!ObjectId.isValid(params.storeId)) {
      return new NextResponse("Invalid storeId", { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured") === "true";

    const skip = (page - 1) * limit;
    const take = limit;

    // Fetch products with filters
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    // Count total products for pagination
    const totalProducts = await prismadb.product.count({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured || undefined,
        isArchived: false,
      },
    });

    // Return the products and total count
    return NextResponse.json({ products, totalProducts });
  } catch (error) {
    console.error("[PRODUCTS_GET_WITH_PAGINATION] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
