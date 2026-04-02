import { put, head } from "@vercel/blob"
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
      const response = await fetch(`/api/assets/file?pathname=${METADATA_FILE}`)
      if (response.ok) {
        return await response.json()
      }
    }
  } catch {
    // File doesn't exist yet
  }
  return {}
}

async function saveMetadata(metadata: AssetMetadata): Promise<void> {
  await put(METADATA_FILE, JSON.stringify(metadata, null, 2), {
    access: "private",
    addRandomSuffix: false,
  })
}

export async function GET() {
  try {
    const metadata = await getMetadata()
    return NextResponse.json(metadata)
  } catch (error) {
    console.error("Error getting metadata:", error)
    return NextResponse.json({})
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pathname, description, category } = await request.json()
    
    if (!pathname) {
      return NextResponse.json({ error: "No pathname provided" }, { status: 400 })
    }

    const metadata = await getMetadata()
    metadata[pathname] = { description, category }
    await saveMetadata(metadata)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving metadata:", error)
    return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pathname = searchParams.get("pathname")

    if (!pathname) {
      return NextResponse.json({ error: "No pathname provided" }, { status: 400 })
    }

    const metadata = await getMetadata()
    delete metadata[pathname]
    await saveMetadata(metadata)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting metadata:", error)
    return NextResponse.json({ error: "Failed to delete metadata" }, { status: 500 })
  }
}
