import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || "";

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });
  return res.json();
}

export async function GET(request: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return NextResponse.json({ error: "Spotify not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  // Spotify's top tracks endpoint only supports limit up to 50
  // We fetch in two batches: offset=0&limit=50 then offset=50&limit=50
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 50);
  const offset = Number(searchParams.get("offset") || "0");
  const timeRange = searchParams.get("time_range") || "long_term"; // long_term = all time

  try {
    const { access_token } = await getAccessToken();
    const res = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&offset=${offset}&time_range=${timeRange}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        // Cache for 1 hour since top tracks don't change often
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch top tracks" }, { status: 500 });
  }
}
