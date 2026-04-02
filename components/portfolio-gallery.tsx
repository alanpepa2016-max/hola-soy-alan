"use client"

import { useState } from "react"
import useSWR from "swr"

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

const CATEGORY_ORDER = ["FOTOGRAFIA", "PRODUCCION AUDIOVISUAL", "EDICION VIDEO"]

export default function PortfolioGallery() {
  const { data: assets, error } = useSWR<Asset[]>("/api/assets", fetcher)
  const [lightboxAsset, setLightboxAsset] = useState<Asset | null>(null)

  if (error) return null
  if (!assets || assets.length === 0) return null

  // Group assets by category
  const groupedAssets = CATEGORY_ORDER.reduce((acc, category) => {
    const categoryAssets = assets.filter((a) => a.category === category)
    if (categoryAssets.length > 0) {
      acc[category] = categoryAssets
    }
    return acc
  }, {} as Record<string, Asset[]>)

  // If no grouped assets, don't render
  if (Object.keys(groupedAssets).length === 0) return null

  return (
    <>
      {Object.entries(groupedAssets).map(([category, categoryAssets]) => (
        <section key={category} style={{ marginBottom: "120px" }}>
          <div className="container">
            {/* Category Title */}
            <div style={{ marginBottom: "60px" }}>
              <span
                style={{
                  fontFamily: "var(--syne)",
                  color: "var(--accent)",
                  fontSize: "0.9rem",
                  letterSpacing: "0.1em",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                {String(CATEGORY_ORDER.indexOf(category) + 1).padStart(2, "0")} / {category}
              </span>
              <h3
                className="huge-type"
                style={{
                  fontSize: "clamp(3rem, 8vw, 7rem)",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {category}
              </h3>
            </div>

            {/* 3-Column Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
              }}
            >
              {categoryAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  onClick={() => setLightboxAsset(asset)}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: index % 5 === 0 ? "4/5" : "1/1",
                    background: "#111",
                  }}
                >
                  {asset.file_type.startsWith("image/") ? (
                    <img
                      src={asset.file_path}
                      alt={asset.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    />
                  ) : asset.file_type.startsWith("video/") ? (
                    <video
                      src={asset.file_path}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => {
                        e.currentTarget.play()
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    />
                  ) : null}

                  {/* Hover Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0"
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--syne)",
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#fff",
                          margin: 0,
                        }}
                      >
                        {asset.name}
                      </p>
                      {asset.description && (
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#aaa",
                            margin: "4px 0 0",
                          }}
                        >
                          {asset.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Lightbox */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setLightboxAsset(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "2rem",
              cursor: "pointer",
              fontFamily: "var(--syne)",
            }}
          >
            X
          </button>
          {lightboxAsset.file_type.startsWith("image/") ? (
            <img
              src={lightboxAsset.file_path}
              alt={lightboxAsset.name}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : lightboxAsset.file_type.startsWith("video/") ? (
            <video
              src={lightboxAsset.file_path}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--syne)",
                fontSize: "1.2rem",
                color: "#fff",
                margin: 0,
              }}
            >
              {lightboxAsset.name}
            </p>
            {lightboxAsset.description && (
              <p style={{ color: "#888", marginTop: "8px" }}>
                {lightboxAsset.description}
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
