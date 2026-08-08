import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { readUpload } from "@/lib/storage";

const EXT_TO_TYPE: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storageKey = params.path.join("/");
  const [category, professionalId] = storageKey.split("/");
  if (!["documents", "certifications"].includes(category) || !professionalId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const proRow = await get("SELECT user_id FROM professional_profiles WHERE id = $id", { id: professionalId });
  if (!proRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = proRow.user_id === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bytes = await readUpload(storageKey);
  if (!bytes) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const ext = storageKey.slice(storageKey.lastIndexOf(".")).toLowerCase();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": EXT_TO_TYPE[ext] || "application/octet-stream",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
