"use client"

import { useEffect } from "react"
import PortfolioGallery from "@/components/portfolio-gallery"

export default function Home() {
  useEffect(() => {
    // Mouse Blob Follower
    const blob = document.getElementById("cursor-blob")
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (blob) {
        blob.style.transform = `translate(${x - 200}px, ${y - 200}px)`
      }
    }
    document.addEventListener("mousemove", handleMouseMove)

    // Parallax Effect
    const handleScroll = () => {
      const scroll = window.pageYOffset

      // Hero parallax
      const parallaxTexts = document.querySelectorAll(".parallax-text")
      parallaxTexts.forEach((text) => {
        const speed = text.getAttribute("data-speed")
        if (speed) {
          ;(text as HTMLElement).style.transform = `translateX(${scroll * Number.parseFloat(speed) * 0.1}px)`
        }
      })

      const heroImg = document.getElementById("hero-img")
      if (heroImg) {
        heroImg.style.transform = `translate(-50%, calc(-50% + ${scroll * 0.2}px)) scale(${1 + scroll * 0.0005})`
      }

      // Floating labels in project section
      const labels = document.querySelectorAll(".floating-label")
      labels.forEach((label, index) => {
        const direction = index % 2 === 0 ? 1 : -1
        ;(label as HTMLElement).style.transform = `translateY(${scroll * 0.1 * direction}px)`
      })
    }
    window.addEventListener("scroll", handleScroll)

    // Simple reveal on enter (Intersection Observer)
    const observerOptions = {
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active")
        }
      })
    }, observerOptions)

    document.querySelectorAll(".reveal-text").forEach((text) => {
      observer.observe(text)
    })

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const href = (this as HTMLAnchorElement).getAttribute("href")
        if (href) {
          document.querySelector(href)?.scrollIntoView({
            behavior: "smooth",
          })
        }
      })
    })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div className="blob" id="cursor-blob"></div>

      <nav>
        <div className="logo">ALAN LENCINA</div>
        <ul className="nav-links">
          <li>
            <a href="#work">Trabajos</a>
          </li>
          <li>
            <a href="#about">Sobre mí</a>
          </li>
          <li>
            <a href="#contact">Contacto</a>
          </li>
          
        </ul>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section id="hero">
          <img
            src="/images/hero-alan.jpg"
            alt="Alan Lencina"
            className="hero-img"
            id="hero-img"
          />
          <div className="hero-title-container container">
            <span className="huge-type parallax-text" data-speed="-2" style={{ fontSize: "clamp(4rem, 12vw, 14rem)" }}>
              REALIZADOR
            </span>
            <span className="huge-type outline-text parallax-text" data-speed="2" style={{ paddingLeft: "200px", fontSize: "clamp(4rem, 12vw, 14rem)" }}>
              AUDIOVISUAL
            </span>
          </div>
        </section>

        {/* INTRO */}
        <section id="about">
          <div className="container">
            <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "3.5rem",
                  fontFamily: "var(--syne)",
                  marginBottom: "40px",
                  lineHeight: "1.1",
                }}
              >
                Hola, soy Alan
              </h2>
              <p
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 300,
                  color: "#aaa",
                  lineHeight: "1.8",
                  marginBottom: "30px",
                }}
              >
                Y trabajo con marcas y proyectos personales para enriquecer su presencia audiovisual, desarrollando contenido que transmite identidad y genera impacto. Ya sea a través de fotografía profesional, contenido orgánico de venta, producciones más complejas o edición para redes sociales, busco que cada proyecto se vea, se sienta y conecte de manera auténtica.
              </p>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 300,
                  color: "#888",
                  lineHeight: "1.8",
                  marginBottom: "30px",
                }}
              >
                Tengo 27 años y actualmente estoy en el último año de la carrera Comunicación Audiovisual en la Universidad Nacional de Mar del Plata.
              </p>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: "var(--syne)",
                  lineHeight: "1.6",
                }}
              >
                ¡Transformemos tu proyecto en algo real y construyamos una imagen distintiva que haga a tu marca reconocible y propia!
              </p>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="scrolling-marquee" style={{ marginTop: "-80px" }}>
          <div className="marquee-inner">
            <span className="huge-type outline-text">PORTFOLIO 2026 — PORTFOLIO 2026 — PORTFOLIO 2026 — PORTFOLIO 2026 — </span>
            <span className="huge-type outline-text">PORTFOLIO 2026 — PORTFOLIO 2026 — PORTFOLIO 2026 — PORTFOLIO 2026 — </span>
          </div>
        </div>

        {/* WORK SECTION - Dynamic Portfolio Gallery */}
        <section id="work">
          <div className="container">
            <div className="sticky-type">ARCHIVO</div>
          </div>
          <PortfolioGallery />
        </section>

        {/* OVERLAPPING COMPOSITION SECTION */}
        <section>
          <div className="container composition">
            <div className="comp-item-1">
              <img
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600"
                className="comp-image"
                alt="Layer 1"
              />
            </div>
            <div className="comp-item-2">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"
                className="comp-image"
                alt="Layer 2"
              />
            </div>
            <div className="comp-item-3">
              <div
                style={{
                  background: "#111",
                  padding: "40px",
                  color: "white",
                  border: "1px solid #333",
                }}
              >
                <h4 style={{ fontFamily: "var(--syne)", fontSize: "2rem", color: "#fff" }}>Dale vida a tus ideas</h4>
                <p style={{ marginTop: "20px", color: "#ccc", lineHeight: "1.6" }}>
                  Las ideas tienen potencial, pero su verdadero poder está en la acción. Este es el momento de dar el paso y elevar tu marca hacia algo más auténtico y personal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact">
          <div className="container">
            <div className="footer-cta">
              <a href="https://w.app/lods5b" target="_blank" rel="noopener noreferrer">CONECTEMOS</a>
            </div>
            <div className="divider"></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--syne)",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                color: "#555",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div>© 2026 ALAN LENCINA</div>
              <div style={{ display: "flex", gap: "30px" }}>
                <a href="https://www.instagram.com/alanlencinah264/" target="_blank" rel="noopener noreferrer" style={{ color: "#555", textDecoration: "none" }}>INSTAGRAM</a>
                <span>BEHANCE</span>
              </div>
              <div>ARGENTINA, MAR DEL PLATA</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
