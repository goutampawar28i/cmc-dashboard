import { NextResponse } from "next/server";
import { getDataset } from "@/lib/google/sheets";

export async function POST() {
  try {
    const data = await getDataset(true);
    return NextResponse.json({ ok: true, lastSynced: data.lastSynced, source: data.source });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Unable to sync Google Sheets. Showing the last successfully synchronized data." },
      { status: 502 }
    );
  }
}
