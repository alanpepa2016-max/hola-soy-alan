"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { Upload, Trash2, Image, Video, FileText, X } from "lucide-react"

interface Asset {
  id: string
  name: string
  file_path: string
  file_type: string
  file_size: number
  category: string
  description: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const categories = ["hero", "proyectos", "about", "general"]

export default function AdminPage() {
  const { data: assets, error, mutate } = useSWR<Asset[]>("/api/assets", fetcher)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [description, setDescription] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", selectedCategory)
      formData.append("description", description)

      try {
        await fetch("/api/assets", {
          method: "POST",
          body: formData,
        })
      } catch (err) {
        console.error("Error uploading:", err)
      }
    }

    setDescription("")
    setUploading(false)
    mutate()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return

    await fetch(`/api/assets?id=${id}`, { method: "DELETE" })
    mutate()
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleUpload(e.dataTransfer.files)
  }, [selectedCategory, description])

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image size={24} />
    if (type.startsWith("video/")) return <Video size={24} />
    return <FileText size={24} />
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const filteredAssets = filterCategory
    ? assets?.filter((a) => a.category === filterCategory)
    : assets

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        padding: "40px",
        fontFamily: "var(--syne)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700 }}>Gestión de Assets</h1>
          <a
            href="/"
            style={{
              color: "#888",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Volver al portfolio
          </a>
        </div>

        {/* Upload Section */}
        <div
          style={{
            background: "#111",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "24px" }}>Subir Archivos</h2>

          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#888", fontSize: "0.875rem" }}>
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: "1rem",
                  minWidth: "150px",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "#888", fontSize: "0.875rem" }}>
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del archivo..."
                style={{
                  width: "100%",
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? "#fff" : "#333"}`,
              borderRadius: "12px",
              padding: "60px",
              textAlign: "center",
              transition: "all 0.2s",
              background: dragActive ? "rgba(255,255,255,0.05)" : "transparent",
            }}
          >
            <Upload size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <p style={{ fontSize: "1.125rem", marginBottom: "8px" }}>
              {uploading ? "Subiendo..." : "Arrastra archivos aquí"}
            </p>
            <p style={{ color: "#666", marginBottom: "16px" }}>o</p>
            <label
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#fff",
                color: "#000",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Seleccionar archivos
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleUpload(e.target.files)}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilterCategory(null)}
            style={{
              padding: "8px 16px",
              background: filterCategory === null ? "#fff" : "#1a1a1a",
              color: filterCategory === null ? "#000" : "#fff",
              border: "1px solid #333",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: "8px 16px",
                background: filterCategory === cat ? "#fff" : "#1a1a1a",
                color: filterCategory === cat ? "#000" : "#fff",
                border: "1px solid #333",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        {error && <p style={{ color: "#ff4444" }}>Error cargando assets</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredAssets?.map((asset) => (
            <div
              key={asset.id}
              style={{
                background: "#111",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <button
                onClick={() => handleDelete(asset.id)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.7)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  zIndex: 10,
                }}
              >
                <Trash2 size={18} />
              </button>

              <div
                style={{
                  aspectRatio: "16/9",
                  background: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {asset.file_type.startsWith("image/") ? (
                  <img
                    src={asset.file_path}
                    alt={asset.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : asset.file_type.startsWith("video/") ? (
                  <video
                    src={asset.file_path}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                ) : (
                  getFileIcon(asset.file_type)
                )}
              </div>

              <div style={{ padding: "16px" }}>
                <p
                  style={{
                    fontWeight: 600,
                    marginBottom: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {asset.name}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: "0.875rem" }}>
                  <span
                    style={{
                      background: "#1a1a1a",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      textTransform: "capitalize",
                    }}
                  >
                    {asset.category}
                  </span>
                  <span>{formatSize(asset.file_size)}</span>
                </div>
                {asset.description && (
                  <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "8px" }}>{asset.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAssets?.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              color: "#666",
            }}
          >
            <p>No hay assets en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}
