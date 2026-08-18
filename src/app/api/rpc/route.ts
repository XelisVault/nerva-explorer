import { NextRequest, NextResponse } from "next/server";
import { config } from "@/config/config";

// Server-side API proxy: forwards requests to the upstream Nerva RPC API.
// Benefits: avoids CORS issues, adds caching, timeout, and strips PHP warnings.

export const dynamic = "force-dynamic";
export const revalidate = 10; // Cache for 10 seconds

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing endpoint parameter" },
      { status: 400 }
    );
  }

  // Forward all query params to the upstream API
  const params = new URLSearchParams(request.nextUrl.searchParams);
  const url = `${config.apiEndpoint}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    const text = await res.text();

    // Defensive: strip PHP warning HTML that the upstream sometimes prepends.
    // Find the first { or [ which marks the start of actual JSON data.
    const jsonStart = text.search(/[{[]/);
    const cleanText = jsonStart >= 0 ? text.slice(jsonStart) : text;

    const contentType =
      res.headers.get("content-type") || "application/json";

    return new NextResponse(cleanText, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Upstream request failed: ${message}` },
      { status: 502 }
    );
  }
}
