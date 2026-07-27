import { NextRequest, NextResponse } from "next/server";
import { getDealsPipeline, getOpsPipeline, getPipelineStats, getPipelineLeaderboard } from "@/app/actions/pipeline";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "deals";

  if (type === "stats") {
    const result = await getPipelineStats();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }

  if (type === "leaderboard") {
    const result = await getPipelineLeaderboard();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }

  if (type === "ops") {
    const filters: any = {};
    if (searchParams.get("status")) filters.status = searchParams.get("status");
    if (searchParams.get("search")) filters.search = searchParams.get("search");
    if (searchParams.get("customer")) filters.customer = searchParams.get("customer");
    const result = await getOpsPipeline(filters);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }

  // Default: deals
  const filters: any = {};
  if (searchParams.get("status")) filters.status = searchParams.get("status");
  if (searchParams.get("pic")) filters.pic = searchParams.get("pic");
  if (searchParams.get("category")) filters.category = searchParams.get("category");
  if (searchParams.get("sector")) filters.sector = searchParams.get("sector");
  if (searchParams.get("region")) filters.region = searchParams.get("region");
  if (searchParams.get("source")) filters.source = searchParams.get("source");
  if (searchParams.get("search")) filters.search = searchParams.get("search");
  
  const result = await getDealsPipeline(filters);
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
