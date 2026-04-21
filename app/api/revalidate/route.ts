import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path : null;
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  revalidatePath(path);
  return NextResponse.json({ revalidated: path });
}
