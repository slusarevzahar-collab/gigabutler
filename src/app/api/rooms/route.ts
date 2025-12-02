import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms } from '@/db/schema';
import { eq, like, and, asc, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single room by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const room = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, parseInt(id)))
        .limit(1);

      if (room.length === 0) {
        return NextResponse.json(
          { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(room[0], { status: 200 });
    }

    // List rooms with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const floor = searchParams.get('floor');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build dynamic WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(like(rooms.roomNumber, `%${search}%`));
    }

    if (floor) {
      const floorNum = parseInt(floor);
      if (!isNaN(floorNum)) {
        conditions.push(eq(rooms.floor, floorNum));
      }
    }

    if (category) {
      conditions.push(eq(rooms.category, category.trim().toUpperCase()));
    }

    if (status) {
      conditions.push(eq(rooms.status, status.trim().toLowerCase()));
    }

    let query = db.select().from(rooms);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(asc(rooms.floor), asc(rooms.roomNumber))
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
    const { roomNumber, category, floor, status } = body;

    // Validate required fields
    if (!roomNumber) {
      return NextResponse.json(
        { error: 'Room number is required', code: 'MISSING_ROOM_NUMBER' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedRoomNumber = roomNumber.trim();
    const sanitizedCategory = category.trim().toUpperCase();

    // Validate status if provided
    const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
    const sanitizedStatus = status ? status.trim().toLowerCase() : 'available';

    if (!validStatuses.includes(sanitizedStatus)) {
      return NextResponse.json(
        {
          error: `Status must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Extract floor from room number if not provided
    let finalFloor = floor;
    if (finalFloor === undefined || finalFloor === null) {
      const roomNumberStr = sanitizedRoomNumber;
      if (roomNumberStr.length >= 2) {
        finalFloor = parseInt(roomNumberStr.substring(0, roomNumberStr.length - 2));
        if (isNaN(finalFloor)) {
          finalFloor = null;
        }
      } else {
        finalFloor = null;
      }
    }

    // Check if room number already exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomNumber, sanitizedRoomNumber))
      .limit(1);

    if (existingRoom.length > 0) {
      return NextResponse.json(
        {
          error: 'Room number already exists',
          code: 'DUPLICATE_ROOM_NUMBER',
        },
        { status: 400 }
      );
    }

    // Create new room
    const now = new Date().toISOString();
    const newRoom = await db
      .insert(rooms)
      .values({
        roomNumber: sanitizedRoomNumber,
        category: sanitizedCategory,
        floor: finalFloor,
        status: sanitizedStatus,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newRoom[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const roomId = parseInt(id);

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { roomNumber, category, floor, status } = body;

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and sanitize roomNumber if provided
    if (roomNumber !== undefined) {
      const sanitizedRoomNumber = roomNumber.trim();

      // Check if new room number already exists (excluding current room)
      const duplicateRoom = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomNumber, sanitizedRoomNumber))
        .limit(1);

      if (duplicateRoom.length > 0 && duplicateRoom[0].id !== roomId) {
        return NextResponse.json(
          {
            error: 'Room number already exists',
            code: 'DUPLICATE_ROOM_NUMBER',
          },
          { status: 400 }
        );
      }

      updates.roomNumber = sanitizedRoomNumber;
    }

    // Validate and sanitize category if provided
    if (category !== undefined) {
      updates.category = category.trim().toUpperCase();
    }

    // Validate floor if provided
    if (floor !== undefined) {
      updates.floor = floor;
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
      const sanitizedStatus = status.trim().toLowerCase();

      if (!validStatuses.includes(sanitizedStatus)) {
        return NextResponse.json(
          {
            error: `Status must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }

      updates.status = sanitizedStatus;
    }

    // Update room
    const updatedRoom = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, roomId))
      .returning();

    return NextResponse.json(updatedRoom[0], { status: 200 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const roomId = parseInt(id);

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete room
    const deletedRoom = await db
      .delete(rooms)
      .where(eq(rooms.id, roomId))
      .returning();

    return NextResponse.json(
      {
        message: 'Room deleted successfully',
        room: deletedRoom[0],
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