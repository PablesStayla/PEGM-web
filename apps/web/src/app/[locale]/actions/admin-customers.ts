'use server';

import { db, type roleEnum, users } from '@pranakaia/infrastructure/db';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Inferir el tipo del enum de roles
type UserRole = (typeof roleEnum.enumValues)[number];

export async function getAdminCustomers() {
  const adminCustomers = await db.select().from(users).orderBy(desc(users.createdAt));

  return adminCustomers;
}

export async function toggleCustomerStatus(userId: string, currentIsActive: boolean) {
  try {
    await db.update(users).set({ isActive: !currentIsActive }).where(eq(users.id, userId));
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function updateCustomerRole(userId: string, newRole: UserRole) {
  try {
    await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
