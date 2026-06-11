"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { openCart, openMenu, isSearchOpen, openSearch, closeSearch } = useUI();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeSearch();
      const q = searchQuery.trim();
      setSearchQuery("");
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <header className="erd-header">
        <div className="erd-header-inner">
          {/* LEFT: Logo */}
          <div className="erd-header-left">
            <Link href="/" className="erd-logo">
              <span className="erd-logo-desktop">TONET GALLERY</span>
              <span className="erd-logo-mobile">TONET<br />GALLERY</span>
            </Link>
          </div>

          {/* CENTER: Navigation */}
          <div className="erd-header-center erd-desktop-only">
            <nav className="erd-nav">
              <Link href="/collection/tops">TOPS</Link>
              <Link href="/collection/bottom">BOTTOM</Link>
              <Link href="/collection/strange">STRANGE</Link>
              <Link href="/stores" className="erd-nav-irl-link">
                <span className="erd-irl-badge">COMING SOON</span>
                IRL
              </Link>
            </nav>
          </div>

          {/* RIGHT: Actions */}
          <div className="erd-header-right erd-desktop-only">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="erd-search-inline-form">
                <input
                  ref={inputRef}
                  type="text"
                  className="erd-search-inline-input"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => {
                      closeSearch();
                      setSearchQuery("");
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      closeSearch();
                      setSearchQuery("");
                    }
                  }}
                  autoFocus
                />
              </form>
            ) : (
              <button className="erd-action-btn" onClick={openSearch} aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            <button className="erd-action-btn" onClick={openCart} aria-label="Cart" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="erd-cart-count">{cartCount}</span>}
            </button>
            <Link href="/account" className="erd-action-link" aria-label="Account" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button className="erd-mobile-menu-btn erd-mobile-only" onClick={openMenu} aria-label="Open menu">
            <span className="erd-hamburger-line" />
            <span className="erd-hamburger-line" />
            <span className="erd-hamburger-line" />
          </button>
        </div>
      </header>

      <style>{`
        .erd-header {
          position: fixed;
          top: 22px;
          left: 0;
          right: 0;
          height: 90px;
          background: transparent;
          z-index: 1000;
          box-sizing: border-box;
        }

        .erd-header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 100%;
        }

        /* ══ LEFT: Logo ══ */
        .erd-header-left {
          display: flex;
          align-items: center;
          padding-left: 32px;
        }
        .erd-logo {
          font-family: var(--font-coolvetica), sans-serif;
          font-weight: 700;
          font-size: 24px;
          line-height: 0.95;
          letter-spacing: 0.05em;
          color: #000000;
          text-decoration: none;
          display: block;
          text-transform: uppercase;
        }
        .erd-logo:hover {
          opacity: 1;
        }
        .erd-logo-desktop {
          display: inline;
        }
        .erd-logo-mobile {
          display: none;
        }

        /* ══ CENTER: Navigation ══ */
        .erd-header-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .erd-nav {
          display: flex;
          align-items: center;
          gap: 36px;
        }
        .erd-nav a {
          font-family: var(--font-helvetica-bold-cond), sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #000000;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .erd-nav a:hover {
          opacity: 0.6;
        }
        .erd-nav-irl-link {
          position: relative;
          display: inline-block;
        }
        .erd-irl-badge {
          position: absolute;
          top: -9px;
          left: 50%;
          transform: translateX(-50%);
          font-family: Arial, sans-serif;
          font-size: 6px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #888888;
          text-transform: uppercase;
          white-space: nowrap;
          pointer-events: none;
        }

        .erd-header-right {
          position: fixed;
          top: 58px;
          right: 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
          z-index: 1000;
        }
        .erd-action-btn {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          font-family: var(--font-helvetica-thin-cond), sans-serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000000;
          transition: opacity 0.2s ease;
          border-radius: 0;
        }
        .erd-action-btn:hover {
          opacity: 0.6;
          background: none;
          transform: none;
        }
        .erd-action-btn:active {
          transform: none;
        }
        .erd-action-link {
          font-family: var(--font-helvetica-thin-cond), sans-serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000000;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .erd-action-link:hover {
          opacity: 0.6;
        }

        /* Add top padding to body to prevent content from going behind the fixed header */
        body {
          padding-top: 112px !important;
        }

        /* ══ INLINE SEARCH STYLES ══ */
        .erd-search-inline-form {
          display: inline-block;
          margin: 0;
          padding: 0;
        }

        .erd-search-inline-input {
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
          width: 100px;
          font-family: var(--font-helvetica-thin-cond), sans-serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000000;
          text-align: right;
          caret-color: #000000;
        }

        .erd-search-inline-input::placeholder {
          color: #888888;
          opacity: 0.5;
        }

        .erd-cart-count {
          font-family: var(--font-helvetica-thin-cond), sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #000000;
        }

        /* ══ RESPONSIVE UTILITIES ══ */
        .erd-mobile-only {
          display: none !important;
        }
        .erd-desktop-only {
          display: flex !important;
        }

        @media (max-width: 767px) {
          .erd-mobile-only {
            display: block !important;
          }
          .erd-desktop-only {
            display: none !important;
          }

          .erd-header {
            height: 72px;
            padding: 24px 16px;
            background: transparent;
          }
          .erd-header-inner {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            height: auto;
            width: 100%;
          }
          .erd-header-left {
            padding-left: 0;
          }
          .erd-logo {
            font-size: 20px;
            line-height: 0.9;
          }
          .erd-logo-desktop {
            display: none;
          }
          .erd-logo-mobile {
            display: block;
          }

          .erd-mobile-menu-btn {
            background: none;
            border: none;
            padding: 0;
            margin: 0;
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-end;
            border-radius: 0;
          }
          .erd-mobile-menu-btn:hover {
            background: none;
            transform: none;
          }
          .erd-mobile-menu-btn:active {
            transform: none;
          }

          .erd-hamburger-line {
            display: block;
            width: 24px;
            height: 2px;
            background: #000000;
            margin: 3px 0;
          }



          body {
            padding-top: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
