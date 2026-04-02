import { put, list, del } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    // Transform blob data to match the Asset interface expected by the frontend
    const assets = blobs.map((blob) => {
      // Extract category and description from pathname (format: category/timestamp-random.ext)
      const pathParts = blob.pathname.split("/")
      const category = pathParts.length > 1 ? pathParts[0] : "general"
      
      // Get original filename from pathname
      const filename = pathParts[pathParts.length - 1]
      
      // Determine file type from pathname
      const ext = filename.split(".").pop()?.toLowerCase() || ""
      let fileType = "application/octet-stream"
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        fileType = `image/${ext === "jpg" ? "jpeg" : ext}`
      } else if (["mp4", "webm", "mov", "avi"].includes(ext)) {
        fileType = `video/${ext}`
      }

      // For private blobs, use our delivery route instead of the direct blob URL
      const fileUrl = `/api/assets/file?pathname=${encodeURIComponent(blob.pathname)}`

      return {
        id: blob.pathname, // Use pathname as unique ID
        name: filename,
        file_path: fileUrl,
        file_type: fileType,
        file_size: blob.size,
        category,
        description: "", // Blob doesn't store custom metadata, so description is empty
        created_at: blob.uploadedAt.toISOString(),
      }
    })

    // Sort by created_at descending (newest first)
    assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(assets)
  } catch (error) {
    console.error("Error listing assets:", error)
    return NextResponse.json({ error: "Failed to list assets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get("file") as File
    const category = (formData.get("category") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a unique filename with category prefix
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${category}/${fileName}`

    // Upload to Vercel Blob (private access)
    const blob = await put(filePath, file, {
      access: "private",
    })

    // Return asset data matching the expected interface
    // Use our delivery route for private blobs
    const asset = {
      id: blob.pathname,
      name: file.name,
      file_path: `/api/assets/file?pathname=${encodeURIComponent(blob.pathname)}`,
      file_type: file.type,
      file_size: file.size,
      category,
      description: "",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "No id provided" }, { status: 400 })
    }

    // First, get the blob URL from the list to delete it
    const { blobs } = await list()
    const blobToDelete = blobs.find((b) => b.pathname === id)

    if (blobToDelete) {
      await del(blobToDelete.url)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
