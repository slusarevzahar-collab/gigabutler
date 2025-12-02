import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roomCategories } from '@/db/schema';
import { eq, like, or, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single category by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const category = await db
        .select()
        .from(roomCategories)
        .where(eq(roomCategories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json(
          { error: 'Category not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // List all categories with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(roomCategories);

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          like(roomCategories.code, searchTerm),
          like(roomCategories.name, searchTerm)
        )
      );
    }

    const results = await query
      .orderBy(asc(roomCategories.code))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Transform and sanitize inputs
    const sanitizedCode = code.toString().trim().toUpperCase();
    const sanitizedName = name.toString().trim();
    const sanitizedDescription = description ? description.toString().trim() : null;

    // Check if code already exists
    const existingCategory = await db
      .select()
      .from(roomCategories)
      .where(eq(roomCategories.code, sanitizedCode))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Category with this code already exists', code: 'DUPLICATE_CODE' },
        { status: 400 }
      );
    }

    // Insert new category
    const newCategory = await db
      .insert(roomCategories)
      .values({
        code: sanitizedCode,
        name: sanitizedName,
        description: sanitizedDescription,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db
      .select()
      .from(roomCategories)
      .where(eq(roomCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { code, name, description } = body;

    // Build update object with only provided fields
    const updates: any = {};

    if (code !== undefined) {
      const sanitizedCode = code.toString().trim().toUpperCase();

      // Check if new code conflicts with another category
      if (sanitizedCode !== existing[0].code) {
        const codeExists = await db
          .select()
          .from(roomCategories)
          .where(eq(roomCategories.code, sanitizedCode))
          .limit(1);

        if (codeExists.length > 0) {
          return NextResponse.json(
            { error: 'Category with this code already exists', code: 'DUPLICATE_CODE' },
            { status: 400 }
          );
        }
      }

      updates.code = sanitizedCode;
    }

    if (name !== undefined) {
      updates.name = name.toString().trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.toString().trim() : null;
    }

    // Perform update
    const updated = await db
      .update(roomCategories)
      .set(updates)
      .where(eq(roomCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await db
      .select()
      .from(roomCategories)
      .where(eq(roomCategories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Category not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete category
    const deleted = await db
      .delete(roomCategories)
      .where(eq(roomCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Category deleted successfully',
        category: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}