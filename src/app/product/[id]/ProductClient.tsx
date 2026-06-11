"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import Link from "next/link";

interface ProductClientProps {
  product: Product;
  relatedProductsByTag: Product[];
}

export default function ProductClient({ product, relatedProductsByTag }: ProductClientProps) {
  const { addToCart } = useCart();
  const { openCart } = useUI();
  const [adding, setAdding] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveImageIndex(index);
    }
  };

  const getProductColor = (p: Product) => {
    const seen = new Set<string>();
    for (const v of p.variants) {
      const opt = v.selectedOptions.find(o => {
        const n = o.name.toLowerCase();
        return n === 'color' || n === 'colour';
      });
      if (opt) seen.add(opt.value.toUpperCase());
    }
    return seen.size > 0 ? Array.from(seen).join(' / ') : 'BLACK';
  };

  const formatProductPrice = (priceVal: string | number, currCode?: string) => {
    const priceNum = parseFloat(String(priceVal));
    const currencyCode = currCode || product.currencyCode || 'USD';
    const currencySymbol = currencyCode === 'USD' ? '$' : '€';
    return `${currencySymbol}${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Determine size option name
  const sizeOptionName = useMemo(() => {
    for (const v of product.variants) {
      for (const o of v.selectedOptions) {
        if (o.name.toLowerCase() === 'size') return o.name;
      }
    }
    return null;
  }, [product.variants]);

  // Extract size options
  const sizeOptions = useMemo(() => {
    if (!sizeOptionName) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === sizeOptionName);
      if (opt && !seen.has(opt.value)) {
        seen.add(opt.value);
        result.push(opt.value);
      }
    }
    return result;
  }, [sizeOptionName, product.variants]);

  // Default select first size if available
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return sizeOptions[0] || '';
  });

  // Determine active variant
  const selectedVariant = useMemo(() => {
    if (sizeOptionName && selectedSize) {
      const match = product.variants.find(v =>
        v.selectedOptions.find(o => o.name === sizeOptionName)?.value === selectedSize
      );
      if (match) return match;
    }
    return product.variants[0];
  }, [product.variants, sizeOptionName, selectedSize]);

  // Extract color values
  const colorValues = useMemo(() => {
    const seen = new Set<string>();
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => {
        const n = o.name.toLowerCase();
        return n === 'color' || n === 'colour';
      });
      if (opt) seen.add(opt.value.toUpperCase());
    }
    return seen.size > 0 ? Array.from(seen).join(' / ') : 'BLACK / NAVY / IVORY';
  }, [product.variants]);

  // Process clean uppercase description
  const cleanDescription = useMemo(() => {
    if (!product.description) return '';
    let text = product.description;
    // Strip common metadata sections if present
    text = text.replace(/Fabric Weight:.*$/i, '');
    text = text.replace(/Fabric Thickness:.*$/i, '');
    text = text.replace(/Fabric:.*$/i, '');
    text = text.replace(/Care Instructions:.*$/i, '');
    text = text.replace(/Features:.*$/i, '');
    // Strip HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    // Remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    return text.toUpperCase();
  }, [product.description]);

  // Format price
  const priceFormatted = useMemo(() => {
    const priceNum = parseFloat(String(selectedVariant?.price.amount || product.price));
    const currencyCode = selectedVariant?.price.currencyCode || product.currencyCode || 'USD';
    const currencySymbol = currencyCode === 'USD' ? '$' : '€';
    return `${currencySymbol}${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [selectedVariant, product.price, product.currencyCode]);

  // Add to cart handler
  async function handleAddToCart() {
    if (!selectedVariant?.id || adding) return;
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div className="erd-pdp-layout">
        {/* DESKTOP LAYOUT */}
        <div className="erd-pdp-grid erd-desktop-only">
          {/* LEFT: Product Information */}
          <div className="erd-pdp-left">
            <div className="erd-info-panel">
              <h1 className="erd-product-title">
                {product.title}
              </h1>
              <div className="erd-product-color">
                {colorValues}
              </div>
              <div className="erd-product-description">
                {cleanDescription || "PREMIUM GARMENT CRAFTED IN PORTUGAL. FINISHED WITH TRADITIONAL TECHNIQUES."}
              </div>
            </div>
          </div>

          {/* CENTER: Product Image */}
          <div className="erd-pdp-center">
            <div className="erd-product-images-slider" onScroll={handleScroll}>
              {product.images && product.images.length > 0 ? (
                product.images.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`${product.title} - ${index + 1}`}
                    className="erd-product-img"
                  />
                ))
              ) : product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="erd-product-img"
                />
              ) : null}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="erd-desktop-image-indicator">
                <span>SCROLL LEFT / RIGHT FOR MORE</span>
                <span className="erd-desktop-image-counter">
                  {activeImageIndex + 1} / {product.images.length}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Size and Purchase Selection */}
          <div className="erd-pdp-right">
            <div className="erd-purchase-panel">
              {sizeOptions.length > 0 && (
                <div className="erd-sizes-row">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`erd-size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              <button
                className="erd-add-btn"
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant?.availableForSale}
              >
                {adding ? 'ADDING...' : `ADD TO CART — ${priceFormatted}`}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (Strict Visual Proportion System: 8vh/15vh/5vh/42vh/10vh/20vh) */}
        <div className="erd-mobile-pdp erd-mobile-only">
          <div className="erd-mobile-first-fold">
            {/* HEADER SPACER - 8% viewport height */}
            <div className="erd-mobile-header-spacer" />

            {/* PRODUCT TITLE BLOCK - 15% viewport height */}
            <div className="erd-mobile-title-block">
              <h1 className="erd-mobile-title">{product.title}</h1>
              <div className="erd-mobile-colorway">{colorValues}</div>
            </div>

            {/* NEGATIVE SPACE - 5% viewport height */}
            <div className="erd-mobile-space-spacer" />

            {/* PRODUCT IMAGE - 42% viewport height */}
            <div className="erd-mobile-image-container">
              <div className="erd-mobile-images-slider" onScroll={handleScroll}>
                {product.images && product.images.length > 0 ? (
                  product.images.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`${product.title} - ${index + 1}`}
                      className="erd-mobile-hero-img"
                    />
                  ))
                ) : product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="erd-mobile-hero-img"
                  />
                ) : null}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="erd-mobile-image-indicator">
                  <span>SLIDE LEFT / RIGHT</span>
                  <span className="erd-mobile-image-counter">
                    {activeImageIndex + 1} / {product.images.length}
                  </span>
                </div>
              )}
            </div>

            {/* PURCHASE CONTROLS - 10% viewport height */}
            <div className="erd-mobile-purchase-container">
              {sizeOptions.length > 0 && (
                <div className="erd-mobile-sizes">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`erd-mobile-size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              <button
                className="erd-mobile-add-btn"
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant?.availableForSale}
              >
                {adding ? 'ADDING...' : `ADD TO CART — ${priceFormatted}`}
              </button>
            </div>

            {/* DESCRIPTION PREVIEW - 20% viewport height */}
            <div className="erd-mobile-desc-preview">
              <p className="erd-mobile-desc-text">
                {cleanDescription || "PREMIUM GARMENT CRAFTED IN PORTUGAL. FINISHED WITH TRADITIONAL TECHNIQUES."}
              </p>
            </div>
          </div>

          {/* RELATED PRODUCTS (scrolling area) */}
          {relatedProductsByTag && relatedProductsByTag.length > 0 && (
            <div className="erd-mobile-related-section">
              <h2 className="erd-mobile-related-heading">RELATED</h2>
              <div className="erd-mobile-related-carousel">
                {relatedProductsByTag.map((p) => (
                  <Link key={p.handle} href={`/product/${p.handle}`} className="erd-mobile-related-card">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.title} className="erd-mobile-related-img" />
                    )}
                    <div className="erd-mobile-related-info">
                      <span className="erd-mobile-related-title">{p.title}</span>
                      <span className="erd-mobile-related-color">{getProductColor(p)}</span>
                      <span className="erd-mobile-related-price">{formatProductPrice(p.price, p.currencyCode)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP RELATED PRODUCTS */}
        {relatedProductsByTag && relatedProductsByTag.length > 0 && (
          <div className="erd-related-section erd-desktop-only">
            <h2 className="erd-related-heading">RELATED</h2>
            <div className="erd-related-carousel">
              {relatedProductsByTag.slice(0, 5).map((p) => (
                <Link key={p.handle} href={`/product/${p.handle}`} className="erd-related-card">
                  {p.imageUrl && (
                    <div className="erd-related-img-wrap">
                      <img src={p.imageUrl} alt={p.title} className="erd-related-img" />
                    </div>
                  )}
                  <div className="erd-related-info">
                    <span className="erd-related-title">{p.title}</span>
                    <span className="erd-related-color">{getProductColor(p)}</span>
                    <span className="erd-related-price">{formatProductPrice(p.price, p.currencyCode)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ══ ERD GLOBAL RESET ══ */
        html, body {
          background-color: #ffffff !important;
          margin: 0;
          padding: 0;
          height: 100%;
          overflow-x: hidden;
        }

        .erd-pdp-layout {
          background-color: #ffffff;
          min-height: calc(100vh - 112px);
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        .erd-pdp-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr 1fr;
          align-items: center;
          width: 100%;
          min-height: calc(100vh - 112px);
          box-sizing: border-box;
        }

        /* ══ LEFT COLUMN (DESKTOP) ══ */
        .erd-pdp-left {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          height: 100%;
        }

        .erd-info-panel {
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .erd-product-title {
          font-family: Arial, sans-serif;
          font-weight: 900;
          font-size: 29px;
          line-height: 0.9;
          text-transform: uppercase;
          text-align: center;
          max-width: 340px;
          color: #000000;
          margin: 0 0 12px 0;
          letter-spacing: -0.01em;
        }

        .erd-product-color {
          font-family: Arial, sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #000000;
          text-align: center;
          margin-bottom: 40px;
          letter-spacing: 0.02em;
        }

        .erd-product-description {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 400;
          text-transform: uppercase;
          max-width: 320px;
          color: #000000;
          text-align: justify;
          letter-spacing: 0.015em;
        }

        /* ══ CENTER COLUMN (DESKTOP) ══ */
        .erd-pdp-center {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        .erd-product-images-slider {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          scroll-snap-type: x mandatory;
          align-items: center;
          justify-content: flex-start;
        }
        .erd-product-images-slider::-webkit-scrollbar {
          display: none;
        }

        .erd-product-img {
          width: 100%;
          height: auto;
          max-height: 70vh;
          object-fit: contain;
          pointer-events: none;
          scroll-snap-align: center;
          flex-shrink: 0;
        }

        .erd-desktop-image-indicator {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          display: flex;
          justify-content: space-between;
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #000000;
          text-transform: uppercase;
          pointer-events: none;
          z-index: 10;
        }

        /* ══ RIGHT COLUMN (DESKTOP) ══ */
        .erd-pdp-right {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          height: 100%;
        }

        .erd-purchase-panel {
          width: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .erd-sizes-row {
          display: flex;
          flex-direction: row;
          width: 100%;
          margin-bottom: 28px;
          gap: 0;
        }

        .erd-size-btn {
          flex: 1;
          background: none;
          border: 1px solid transparent;
          padding: 8px 0;
          cursor: pointer;
          font-family: Arial, sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #000000;
          transition: opacity 0.2s ease;
          border-radius: 0;
          text-align: center;
        }
        .erd-size-btn:hover {
          opacity: 0.6;
          background: none;
          transform: none;
        }
        .erd-size-btn.selected {
          border: none;
          border-bottom: 2px solid #000000;
          padding-bottom: 8px;
        }

        .erd-add-btn {
          width: 100%;
          height: 44px;
          background: #000000;
          color: #ffffff;
          border: none;
          font-family: Arial, sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s ease;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.02em;
        }

        .erd-add-btn:hover:not(:disabled) {
          opacity: 0.85;
          background: #000000;
          transform: none;
        }
        .erd-add-btn:disabled {
          background: #cccccc;
          color: #666666;
          cursor: not-allowed;
        }

        /* ══ RELATED PRODUCTS (DESKTOP) ══ */
        .erd-related-section {
          width: 100%;
          max-width: 1400px;
          padding: 80px 40px;
          box-sizing: border-box;
        }
        .erd-related-heading {
          font-family: Arial, sans-serif;
          font-size: 20px;
          font-weight: 950;
          text-transform: uppercase;
          color: #000000;
          margin: 0 0 40px 0;
          letter-spacing: -0.01em;
        }
        .erd-related-carousel {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          width: 100%;
        }
        .erd-related-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          text-decoration: none;
          text-align: center;
        }
        .erd-related-img-wrap {
          width: 100%;
          aspect-ratio: 6 / 10;
          background: transparent;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .erd-related-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: transparent;
        }
        .erd-related-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 16px;
        }
        .erd-related-title {
          font-family: Arial, sans-serif;
          font-size: 11px;
          font-weight: 900;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .erd-related-color {
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .erd-related-price {
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.02em;
        }

        /* Responsive displays */
        .erd-mobile-only {
          display: none !important;
        }
        .erd-desktop-only {
          display: grid !important;
        }
        div.erd-desktop-only {
          display: grid !important;
        }
        .erd-related-section.erd-desktop-only {
          display: block !important;
        }

        /* ══ RESPONSIVE MOBILE PROPORTIONS ══ */
        @media (max-width: 767px) {
          .erd-mobile-only {
            display: block !important;
          }
          .erd-desktop-only {
            display: none !important;
          }
          div.erd-desktop-only {
            display: none !important;
          }
          .erd-related-section.erd-desktop-only {
            display: none !important;
          }

          .erd-pdp-layout {
            min-height: 100vh;
            width: 100vw;
            display: block;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }

          /* Mobile pdp container */
          .erd-mobile-pdp {
            width: 100%;
            background-color: #ffffff;
          }

          .erd-mobile-first-fold {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100vh;
            height: 100dvh; /* dynamic viewport height if supported */
            box-sizing: border-box;
            overflow: hidden;
            padding: 0;
            margin: 0;
          }

          /* 16% Header Spacer */
          .erd-mobile-header-spacer {
            height: 16vh;
            width: 100%;
            flex-shrink: 0;
          }

          /* 10% Product Title Block */
          .erd-mobile-title-block {
            height: 10vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            box-sizing: border-box;
            padding: 0 16px;
          }

          .erd-mobile-title {
            font-family: Arial, sans-serif;
            font-weight: 900;
            font-size: 32px;
            line-height: 0.85; /* Extremely tight line-height */
            text-transform: uppercase;
            text-align: center;
            margin: 0;
            max-width: 340px;
            letter-spacing: -0.02em;
            color: #000000;
          }

          .erd-mobile-colorway {
            font-family: Arial, sans-serif;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #000000;
            text-align: center;
            margin-top: 6px;
            letter-spacing: 0.02em;
          }

          /* 2% Negative Space Spacer */
          .erd-mobile-space-spacer {
            height: 2vh;
            width: 100%;
            flex-shrink: 0;
          }

          /* 42% Product Image */
          .erd-mobile-image-container {
            position: relative;
            height: 42vh;
            width: 100%;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            overflow: hidden;
            box-sizing: border-box;
          }

          .erd-mobile-images-slider {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 42vh;
            overflow-x: auto;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
            align-items: center;
            justify-content: flex-start;
            gap: calc(100vw - 25.2vh);
            padding: 0 calc((100vw - 25.2vh) / 2);
            box-sizing: border-box;
          }
          .erd-mobile-images-slider::-webkit-scrollbar {
            display: none;
          }

          .erd-mobile-hero-img {
            width: auto;
            height: 42vh;
            aspect-ratio: 6 / 10;
            object-fit: contain;
            background: transparent;
            scroll-snap-align: center;
            flex-shrink: 0;
          }

          .erd-mobile-image-indicator {
            position: absolute;
            bottom: 12px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 24px;
            font-family: Arial, sans-serif;
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #000000;
            text-transform: uppercase;
            pointer-events: none;
            z-index: 10;
          }

          /* 10% Purchase Controls */
          .erd-mobile-purchase-container {
            height: 10vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            box-sizing: border-box;
            padding: 0 16px;
            gap: 6px;
          }

          .erd-mobile-sizes {
            display: flex;
            justify-content: space-between;
            width: 220px;
            gap: 0;
          }

          .erd-mobile-size-btn {
            flex: 1;
            background: none;
            border: 1px solid transparent;
            padding: 4px 0;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: 700;
            color: #000000;
            border-radius: 0;
            text-align: center;
          }
          
          .erd-mobile-size-btn.selected {
            border: 1px solid #000000;
          }

          .erd-mobile-add-btn {
            width: 220px;
            height: 34px;
            background: #000000;
            color: #ffffff;
            border: none;
            font-family: Arial, sans-serif;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            letter-spacing: 0.02em;
          }

          /* 20% Description Preview */
          .erd-mobile-desc-preview {
            height: 20vh;
            width: 100%;
            box-sizing: border-box;
            padding: 16px 24px;
            flex-shrink: 0;
            overflow: hidden;
          }

          .erd-mobile-desc-text {
            font-family: Arial, sans-serif;
            font-size: 9px;
            line-height: 1.4;
            font-weight: 400;
            text-transform: uppercase;
            color: #000000;
            text-align: left;
            margin: 0;
            width: 100%;
          }

          /* Mobile Related Products (scrolling area) */
          .erd-mobile-related-section {
            width: 100%;
            padding: 40px 0 80px 0;
            box-sizing: border-box;
          }

          .erd-mobile-related-heading {
            font-family: Arial, sans-serif;
            font-size: 17px;
            font-weight: 900;
            text-transform: uppercase;
            color: #000000;
            margin: 0 0 24px 13.5vw;
            letter-spacing: -0.01em;
          }

          .erd-mobile-related-carousel {
            display: flex;
            flex-direction: row;
            gap: 27vw;
            overflow-x: auto;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
            padding: 0 13.5vw;
            box-sizing: border-box;
          }
          .erd-mobile-related-carousel::-webkit-scrollbar {
            display: none;
          }

          .erd-mobile-related-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 73vw;
            flex-shrink: 0;
            text-decoration: none;
            text-align: center;
            scroll-snap-align: center;
          }

          .erd-mobile-related-img {
            width: 100%;
            height: 80vw;
            object-fit: contain;
            background: transparent;
          }

          .erd-mobile-related-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            margin-top: 12px;
          }

          .erd-mobile-related-title {
            font-family: Arial, sans-serif;
            font-size: 9px;
            font-weight: 900;
            color: #000000;
            text-transform: uppercase;
            letter-spacing: -0.01em;
            line-height: 1.2;
          }

          .erd-mobile-related-color {
            font-family: Arial, sans-serif;
            font-size: 7.5px;
            font-weight: 700;
            color: #000000;
            text-transform: uppercase;
          }

          .erd-mobile-related-price {
            font-family: Arial, sans-serif;
            font-size: 7.5px;
            font-weight: 700;
            color: #000000;
          }
        }
      `}</style>
    </>
  );
}
