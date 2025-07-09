import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("problems").select("*").limit(1);

  if (error) {
    console.error("❌ Supabase error:", error.message, error.details);
    return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
  } else {
    console.log("✅ Supabase data:", data);
    return NextResponse.json({ data });
  }
} 