"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

// 1. READ ALL CUSTOMERS
export async function getAllCustomers() {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    const customers = await prisma.customers.findMany({
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return {
      success: true,
      data: customers.map((c: any) => ({
        id: c.id.toString(),
        name: c.name || "Unknown Company",
        pic_name: c.pic_name || "N/A",
        pic_phone: c.pic_phone || "N/A",
        bidang_usaha: c.bidang_usaha || "General",
        customer_type: c.customer_type || "Corporate",
        projects_count: c._count.projects,
        is_active: c.is_active ?? true
      }))
    };
  } catch (error) {
    console.error("Fetch customers error:", error);
    return { error: "Failed to fetch customer data." };
  }
}

// 2. CREATE CUSTOMER
export async function createCustomer(data: {
  name: string;
  pic_name?: string;
  pic_phone?: string;
  bidang_usaha?: string;
  customer_type?: "Corporate" | "Individual";
}) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    await prisma.customers.create({
      data: {
        name: data.name,
        pic_name: data.pic_name,
        pic_phone: data.pic_phone,
        bidang_usaha: data.bidang_usaha,
        customer_type: data.customer_type || "Corporate",
        is_active: true
      }
    });
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Create customer error:", error);
    return { error: "Failed to create customer." };
  }
}

// 3. UPDATE CUSTOMER
export async function updateCustomer(id: string, data: {
  name: string;
  pic_name?: string;
  pic_phone?: string;
  bidang_usaha?: string;
  customer_type?: "Corporate" | "Individual";
}) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    await prisma.customers.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        pic_name: data.pic_name,
        pic_phone: data.pic_phone,
        bidang_usaha: data.bidang_usaha,
        customer_type: data.customer_type
      }
    });
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Update customer error:", error);
    return { error: "Failed to update customer." };
  }
}

// 4. SUSPEND/ACTIVATE CUSTOMER (is_active toggle)
export async function toggleCustomerStatus(id: string, currentState: boolean) {
  const session = await getSession();
  if (!session || !session.isInternal) return { error: "Unauthorized access" };

  try {
    await prisma.customers.update({
      where: { id: parseInt(id) },
      data: { is_active: !currentState }
    });
    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Toggle customer status error:", error);
    return { error: "Failed to update customer status." };
  }
}
