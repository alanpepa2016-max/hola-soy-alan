import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const formData = await request.formData()
  
  const file = formData.get("file") as File
  const category = formData.get("category") as string || "general"
  const description = formData.get("description") as string || ""

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${category}/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("portfolio-assets")
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("portfolio-assets")
    .getPublicUrl(filePath)

  // Save to database
  const { data, error: dbError } = await supabase
    .from("assets")
    .insert({
      name: file.name,
      file_path: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      category,
      description,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 })
  }

  // Get the asset first to delete from storage
  const { data: asset } = await supabase
    .from("assets")
    .select("file_path")
    .eq("id", id)
    .single()

  if (asset) {
    // Extract path from URL for storage deletion
    const url = new URL(asset.file_path)
    const storagePath = url.pathname.split("/portfolio-assets/")[1]
    if (storagePath) {
      await supabase.storage.from("portfolio-assets").remove([storagePath])
    }
  }

  const { error } = await supabase.from("assets").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
