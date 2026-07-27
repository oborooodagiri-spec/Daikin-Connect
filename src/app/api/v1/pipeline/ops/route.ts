import { NextRequest, NextResponse } from "next/server";
import { getOpsPipeline } from "@/app/actions/pipeline";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters: any = {};
  if (searchParams.get("status")) filters.status = searchParams.get("status");
  if (searchParams.get("search")) filters.search = searchParams.get("search");
  if (searchParams.get("customer")) filters.customer = searchParams.get("customer");
  
  const result = await getOpsPipeline(filters);
  return NextResponse.json(result);
}
