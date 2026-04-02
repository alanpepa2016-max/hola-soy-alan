import { put, list, del, head } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

const METADATA_FILE = "assets-metadata.json"

interface AssetMetadata {
  [pathname: string]: {
    description: string
    category: string
  }
}

async function getMetadata(): Promise<AssetMetadata> {
  try {
    const blob = await head(METADATA_FILE)
    if (blob) {
      // Fetch the metadata file content directly
      const { get } = await import("@vercel/blob")
      const result = await get(METADATA_FILE, { access: "private" })
      if (result && result.stream) {
        const text = await new Response(result.stream).text()
        return JSON.parse(text)
      }
    }
  } catch {
    // File doesn't exist yet
  }
  return {}
}

export async function GET() {
  try {
    const { blobs } = await list()
    const metadata = await getMetadata()

    // Filter out the metadata file from the list
    const assetBlobs = blobs.filter(b => b.pathname !== METADATA_FILE)

    // Transform blob data to match the Asset interface expected by the frontend
    const assets = assetBlobs.map((blob) => {
      // Get original filename from pathname
      const filename = blob.pathname.split("/").pop() || blob.pathname
      
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

      // Get metadata for this asset
      const assetMeta = metadata[blob.pathname] || { description: "", category: "general" }

      return {
        id: blob.pathname, // Use pathname as unique ID
        name: filename,
        file_path: fileUrl,
        file_type: fileType,
        file_size: blob.size,
        category: assetMeta.category,
        description: assetMeta.description,
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

async function saveMetadata(metadata: AssetMetadata): Promise<void> {
  await put(METADATA_FILE, JSON.stringify(metadata, null, 2), {
    access: "private",
    addRandomSuffix: false,
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get("file") as File
    const category = (formData.get("category") as string) || "general"
    const description = (formData.get("description") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Vercel Blob (private access)
    const blob = await put(fileName, file, {
      access: "private",
    })

    // Save metadata
    const metadata = await getMetadata()
    metadata[blob.pathname] = { description, category }
    await saveMetadata(metadata)

    // Return asset data matching the expected interface
    const asset = {
      id: blob.pathname,
      name: file.name,
      file_path: `/api/assets/file?pathname=${encodeURIComponent(blob.pathname)}`,
      file_type: file.type,
      file_size: file.size,
      category,
      description,
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
      
      // Also delete metadata
      const metadata = await getMetadata()
      delete metadata[id]
      await saveMetadata(metadata)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
