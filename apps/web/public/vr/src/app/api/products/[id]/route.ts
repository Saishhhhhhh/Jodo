import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      enquiryOnly: product.enquiryOnly,
      dimensions: {
        width: product.width,
        height: product.height,
        depth: product.depth,
        unit: product.unit,
      },
      weight: product.weight,
      model: {
        glbUrl: product.glbUrl,
        usdzUrl: product.usdzUrl,
        posterUrl: product.posterUrl,
        fileSizeMb: product.fileSizeMb,
      },
      images: JSON.parse(product.images),
      isActive: product.isActive,
      sortOrder: product.sortOrder,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await db.product.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.enquiryOnly !== undefined && { enquiryOnly: body.enquiryOnly }),
        ...(body.width !== undefined && { width: body.width }),
        ...(body.height !== undefined && { height: body.height }),
        ...(body.depth !== undefined && { depth: body.depth }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.weight !== undefined && { weight: body.weight }),
        ...(body.glbUrl !== undefined && { glbUrl: body.glbUrl }),
        ...(body.usdzUrl !== undefined && { usdzUrl: body.usdzUrl }),
        ...(body.posterUrl !== undefined && { posterUrl: body.posterUrl }),
        ...(body.fileSizeMb !== undefined && { fileSizeMb: body.fileSizeMb }),
        ...(body.images !== undefined && { images: JSON.stringify(body.images) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ id: product.id, slug: product.slug });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
