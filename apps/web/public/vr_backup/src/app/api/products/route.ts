import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    const where: Record<string, unknown> = {};
    
    if (active !== null && active !== undefined) {
      where.isActive = active === 'true';
    } else {
      where.isActive = true;
    }
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const mapped = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      enquiryOnly: p.enquiryOnly,
      dimensions: {
        width: p.width,
        height: p.height,
        depth: p.depth,
        unit: p.unit,
      },
      weight: p.weight,
      model: {
        glbUrl: p.glbUrl,
        usdzUrl: p.usdzUrl,
        posterUrl: p.posterUrl,
        fileSizeMb: p.fileSizeMb,
      },
      images: JSON.parse(p.images),
      isActive: p.isActive,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const product = await db.product.create({
      data: {
        slug: body.slug,
        sku: body.sku,
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price || null,
        enquiryOnly: body.enquiryOnly ?? true,
        width: body.width,
        height: body.height,
        depth: body.depth,
        unit: body.unit || 'cm',
        weight: body.weight || null,
        glbUrl: body.glbUrl,
        usdzUrl: body.usdzUrl || null,
        posterUrl: body.posterUrl,
        fileSizeMb: body.fileSizeMb || null,
        images: JSON.stringify(body.images || []),
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json({ id: product.id, slug: product.slug });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
