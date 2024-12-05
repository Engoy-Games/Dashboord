import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

// POST function (your existing function)
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const {
      name,
      nameEn,
      price,
      categoryId,
      images,
      isFeatured,
      isArchived,
      productDescription,
      productDescriptionEn,
    } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name || !nameEn) {
      return new NextResponse('Missing name or nameEn', { status: 400 })
    }

    if (!price) {
      return new NextResponse('Missing price', { status: 400 })
    }

    if (!categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 })
    }

    if (!images || !images.length) {
      return new NextResponse('Missing images', { status: 400 })
    }

    if (!params.storeId) {
      return new NextResponse('Missing storeId', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const product = await prismadb.product.create({
      data: {
        name,
        nameEn,
        price,
        categoryId,
        isFeatured,
        isArchived,
        storeId: params.storeId,
        productDescription,
        productDescriptionEn,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    })

    return new NextResponse(JSON.stringify(product), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[PRODUCTS_POST]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// GET function (without pagination)
export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const isFeatured = searchParams.get('isFeatured')

    if (!params.storeId) {
      return new NextResponse('Missing storeId', { status: 400 })
    }

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
        createdAt: 'desc',
      },
    })

    // Include both productDescription and productDescriptionEn in the response
    const productsWithDescription = products.map(product => ({
      ...product,
      productDescription: product.productDescription || null,
      productDescriptionEn: product.productDescriptionEn || null,
    }))

    return new NextResponse(JSON.stringify(productsWithDescription), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[PRODUCTS_GET]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
