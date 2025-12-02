import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Add room_categories table
export const roomCategories = sqliteTable('room_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});

// Add rooms table
export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomNumber: text('room_number').notNull().unique(),
  category: text('category').notNull(),
  floor: integer('floor'),
  status: text('status').notNull().default('available'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});