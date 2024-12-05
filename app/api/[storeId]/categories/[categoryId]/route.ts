import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

// GET endpoint to fetch a category along with its fields
export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } },
) {
  try {
    if (!params.categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        billboard: true,
        fields: true,
      },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(category), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[CATEGORY_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH endpoint to update a category
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } },
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const {
      name,
      nameEn,
      billboardId,
      categoryDescription,
      categoryDescriptionEn,
      fields,
      categoryType,
    } = body;

    // Authorization check
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Required fields check
    if (!name || !nameEn || !billboardId || !params.categoryId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const categoryExists = await prismadb.category.findUnique({
      where: { id: params.categoryId },
    });

    if (!categoryExists) {
      return new NextResponse('Category not found', { status: 404 });
    }

    console.log('Fields being updated:', fields);

    const updatedCategory = await prismadb.category.update({
      where: { id: params.categoryId },
      data: {
        name,
        nameEn,
        billboardId,
        categoryDescription,
        categoryDescriptionEn,
        categoryType,
        fields: {
          upsert: fields
            .filter((field: { id: any }) => field.id)
            .map((field: { id: any; fieldName: any; fieldNameEn: any; fieldType: any; options: any; OrderField: any }) => ({
              where: { id: field.id },
              update: {
                fieldName: field.fieldName,
                fieldNameEn: field.fieldNameEn,
                fieldType: field.fieldType,
                options: field.options,
                OrderField: field.OrderField || undefined,
              },
              create: {
                fieldName: field.fieldName,
                fieldNameEn: field.fieldNameEn,
                fieldType: field.fieldType,
                options: field.options,
                OrderField: field.OrderField || undefined,
              },
            })),
        },
      },
    });

    return new NextResponse(JSON.stringify(updatedCategory), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE endpoint to remove a category
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } },
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const categoryExists = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    if (!categoryExists) {
      return new NextResponse('Category not found', { status: 404 });
    }

    await prismadb.field.deleteMany({
      where: {
        categoryId: params.categoryId,
      },
    });

    const deletedCategory = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return new NextResponse(JSON.stringify(deletedCategory), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
