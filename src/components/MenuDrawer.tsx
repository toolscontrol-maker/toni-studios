"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";

export default function MenuDrawer() {
  const { isMenuOpen, closeMenu, openCart } = useUI();
  const { cartCount } = useCart();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchActive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeMenu();
      const q = searchQuery.trim();
      setSearchQuery("");
      setIsSearchActive(false);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, closeMenu]);

  // Reset search state when menu is closed
  useEffect(() => {
    if (!isMenuOpen) {
      setIsSearchActive(false);
      setSearchQuery("");
    }
  }, [isMenuOpen]);

  return (
    <>
      <div className={`md-backdrop ${isMenuOpen ? "open" : ""}`} aria-hidden="true" />

      <div className={`md-drawer ${isMenuOpen ? "open" : ""}`} ref={drawerRef} role="dialog" aria-modal="true">
        {/* HEADER BAR */}
        <div className="md-header">
          <Link href="/" className="md-logo" onClick={closeMenu}>
            <span>TONET</span>
            <br />
            <span>GALLERY</span>
          </Link>
          <button className="md-close-btn" onClick={closeMenu} aria-label="Close menu">
            ✕
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="md-nav-container">
          <nav className="md-nav">
            <Link href="/collection/tops" className="md-nav-item" onClick={closeMenu}>
              TOPS
            </Link>
            <Link href="/collection/bottom" className="md-nav-item" onClick={closeMenu}>
              BOTTOM
            </Link>
            <Link href="/collection/strange" className="md-nav-item" onClick={closeMenu}>
              STRANGE
            </Link>
            <Link href="/stores" className="md-nav-item" onClick={closeMenu}>
              IRL
            </Link>
          </nav>
        </div>

        {/* SECONDARY ACTIONS */}
        <div className="md-actions-container">
          {isSearchActive ? (
            <form onSubmit={handleSearchSubmit} className="md-inline-search-form">
              <input
                ref={searchInputRef}
                type="text"
                className="md-inline-search-input"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  setTimeout(() => {
                    setIsSearchActive(false);
                    setSearchQuery("");
                  }, 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsSearchActive(false);
                    setSearchQuery("");
                  }
                }}
                autoFocus
              />
            </form>
          ) : (
            <button className="md-action-btn" onClick={() => setIsSearchActive(true)}>
              SEARCH
            </button>
          )}

          <Link href="/account" className="md-action-link" onClick={closeMenu}>
            LOG IN
          </Link>

          <button
            className="md-action-btn"
            onClick={() => {
              closeMenu();
              openCart();
            }}
          >
            CART ({cartCount})
          </button>
        </div>

        {/* FOOTER */}
        <div className="md-locale">SPAIN | ENGLISH</div>
      </div>

      <style>{`
        /* ══ BACKDROP ══ */
        .md-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1000;
        }
        .md-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* ══ DRAWER ══ */
        .md-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 370px;
          max-width: 100vw;
          background: #0c0c0c;
          display: flex;
          flex-direction: column;
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }
        .md-drawer.open {
          transform: translateX(0);
        }

        /* ══ HEADER ══ */
        .md-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 32px 32px 0 32px;
        }

        .md-logo {
          font-family: var(--font-coolvetica), sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 0.95;
          letter-spacing: 0.05em;
          color: #ffffff;
          text-decoration: none;
          text-transform: uppercase;
        }

        .md-close-btn {
          background: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          cursor: pointer;
          color: #ffffff !important;
          font-size: 20px !important;
          line-height: 1 !important;
          transform: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transition: opacity 0.2s ease;
        }
        .md-close-btn:hover {
          opacity: 0.6;
        }

        /* ══ NAV CONTAINER ══ */
        .md-nav-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .md-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .md-nav-item {
          font-family: var(--font-helvetica-thin-cond), sans-serif;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #ffffff;
          text-transform: uppercase;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .md-nav-item:hover {
          opacity: 0.6;
        }

        /* ══ ACTIONS CONTAINER ══ */
        .md-actions-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 50px;
        }

        .md-action-btn,
        .md-action-link {
          background: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          cursor: pointer;
          font-family: var(--font-helvetica-thin-cond), sans-serif !important;
          font-size: 15px !important;
          font-weight: 400 !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
          color: #888888 !important;
          text-decoration: none !important;
          transform: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transition: color 0.2s ease !important;
        }

        .md-action-btn:hover,
        .md-action-link:hover {
          color: #ffffff !important;
          opacity: 1 !important;
        }

        /* ══ INLINE SEARCH ══ */
        .md-inline-search-form {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .md-inline-search-input {
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
          width: 200px;
          font-family: var(--font-helvetica-thin-cond), sans-serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #ffffff;
          text-align: center;
          caret-color: #ffffff;
        }

        .md-inline-search-input::placeholder {
          color: #888888;
          opacity: 0.5;
        }

        /* ══ FOOTER ══ */
        .md-locale {
          font-family: Arial, sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #444444;
          text-align: center;
          padding-bottom: 32px;
        }

        @media (max-width: 767px) {
          .md-drawer {
            width: 100vw;
          }
          .md-header {
            padding: 24px 24px 0 24px;
          }
          .md-nav-item {
            font-size: 22px;
          }
          .md-actions-container {
            margin-bottom: 40px;
          }
        }
      `}</style>
    </>
  );
}
