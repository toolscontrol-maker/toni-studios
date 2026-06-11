"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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

  const [showStickyAdd, setShowStickyAdd] = useState(false);
  const desktopSliderRef = useRef<HTMLDivElement>(null);

  // Selected size state
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (product.variants && product.variants.length > 0) {
      const opt = product.variants[0].selectedOptions.find(o => o.name.toLowerCase() === 'size');
      return opt ? opt.value : '';
    }
    return '';
  });

  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    return url.split('?')[0];
  };

  // Find the nearest matched image index that corresponds to a variant
  const matchedImageIndex = useMemo(() => {
    if (!product.images || product.images.length === 0) return 0;
    
    let index = activeImageIndex;
    while (index >= 0) {
      const hasVariant = product.variants.some(v => {
        if (!v.image?.url) return false;
        return normalizeUrl(v.image.url) === normalizeUrl(product.images[index]);
      });
      if (hasVariant) return index;
      index--;
    }
    
    index = activeImageIndex + 1;
    while (index < product.images.length) {
      const hasVariant = product.variants.some(v => {
        if (!v.image?.url) return false;
        return normalizeUrl(v.image.url) === normalizeUrl(product.images[index]);
      });
      if (hasVariant) return index;
      index++;
    }
    return 0;
  }, [product.images, product.variants, activeImageIndex]);

  // Filter variants that match the active color/image
  const matchingVariantsForColor = useMemo(() => {
    if (!product.images || product.images.length === 0 || !product.images[matchedImageIndex]) {
      return product.variants;
    }
    const activeImgUrl = normalizeUrl(product.images[matchedImageIndex]);
    const matches = product.variants.filter(v => v.image?.url && normalizeUrl(v.image.url) === activeImgUrl);
    return matches.length > 0 ? matches : product.variants;
  }, [product.variants, product.images, matchedImageIndex]);

  // Determine active variant based on active color and active size selection
  const selectedVariant = useMemo(() => {
    if (matchingVariantsForColor.length === 0) return null;
    
    // Find variant in the current color matching the selected size
    const match = matchingVariantsForColor.find(v =>
      v.selectedOptions.find(o => o.name.toLowerCase() === 'size')?.value === selectedSize
    );
    if (match) return match;
    
    // Fallback to the first variant of this color
    return matchingVariantsForColor[0];
  }, [matchingVariantsForColor, selectedSize]);

  // Keep size button highlighted in sync when scrolling through colors
  useEffect(() => {
    if (selectedVariant) {
      const sizeOpt = selectedVariant.selectedOptions.find(o => o.name === sizeOptionName);
      if (sizeOpt && sizeOpt.value !== selectedSize) {
        setSelectedSize(sizeOpt.value);
      }
    }
  }, [selectedVariant, sizeOptionName]);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);

    // If the active variant changes, check if it's in the same color
    const matchInCurrentColor = matchingVariantsForColor.find(v =>
      v.selectedOptions.find(o => o.name === sizeOptionName)?.value === size
    );

    if (matchInCurrentColor) {
      // It's in the same color, no need to scroll
      return;
    }

    // It's in a different color. Find the first variant with this size in the entire product
    const globalMatch = product.variants.find(v =>
      v.selectedOptions.find(o => o.name === sizeOptionName)?.value === size
    );

    if (globalMatch && globalMatch.image?.url) {
      const matchUrl = normalizeUrl(globalMatch.image.url);
      const imgIndex = product.images.findIndex(url => normalizeUrl(url) === matchUrl);
      if (imgIndex !== -1) {
        setActiveImageIndex(imgIndex);
        
        // Scroll desktop slider
        if (desktopSliderRef.current) {
          const width = desktopSliderRef.current.clientWidth;
          desktopSliderRef.current.scrollTo({
            left: imgIndex * width,
            behavior: 'smooth'
          });
        }
        
        // Scroll mobile slider
        const mobileSlider = document.querySelector('.erd-mobile-images-slider');
        if (mobileSlider) {
          const width = mobileSlider.clientWidth;
          mobileSlider.scrollTo({
            left: imgIndex * width,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  useEffect(() => {
    const slider = desktopSliderRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.style.scrollSnapType = 'none';
      slider.style.scrollBehavior = 'auto';
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      slider.style.scrollSnapType = 'x mandatory';
      slider.style.scrollBehavior = 'smooth';
      slider.style.cursor = 'grab';
      const currentScroll = slider.scrollLeft;
      slider.scrollLeft = currentScroll + 1;
      slider.scrollLeft = currentScroll;
    };

    const handleMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      slider.style.scrollSnapType = 'x mandatory';
      slider.style.scrollBehavior = 'smooth';
      slider.style.cursor = 'grab';
      const currentScroll = slider.scrollLeft;
      slider.scrollLeft = currentScroll + 1;
      slider.scrollLeft = currentScroll;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.style.cursor = 'grab';
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleWindowScroll = () => {
      const threshold = window.innerHeight * 0.7;
      if (window.scrollY > threshold) {
        setShowStickyAdd(true);
      } else {
        setShowStickyAdd(false);
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);



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

  const hasMultipleColors = useMemo(() => {
    const colors = new Set<string>();
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => {
        const n = o.name.toLowerCase();
        return n === 'color' || n === 'colour';
      });
      if (opt) colors.add(opt.value.toLowerCase());
    }
    return colors.size > 1;
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
              {hasMultipleColors && selectedVariant && (
                <div className="erd-active-variant-badge">
                  {selectedVariant.title.toUpperCase()}
                </div>
              )}
              <div className={`erd-product-color ${!hasMultipleColors ? 'erd-no-badge' : ''}`}>
                {colorValues}
              </div>
              <div className="erd-product-description">
                {cleanDescription || "PREMIUM GARMENT CRAFTED IN PORTUGAL. FINISHED WITH TRADITIONAL TECHNIQUES."}
              </div>
            </div>
          </div>

          {/* CENTER: Product Image */}
          <div className="erd-pdp-center">
            <div ref={desktopSliderRef} className="erd-product-images-slider" onScroll={handleScroll}>
              {product.images && product.images.length > 0 ? (
                product.images.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`${product.title} - ${index + 1}`}
                    className={`erd-product-img ${index === activeImageIndex ? 'active' : ''}`}
                  />
                ))
              ) : product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="erd-product-img active"
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
                      onClick={() => handleSizeClick(size)}
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

              <div className="erd-payment-carousel">
                <div className="erd-payment-carousel-blur-left"></div>
                <div className="erd-payment-carousel-track">
                  <div className="erd-payment-carousel-group">
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                  </div>
                  <div className="erd-payment-carousel-group">
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                  </div>
                </div>
                <div className="erd-payment-carousel-blur-right"></div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (Viewport 1 & Scrollable Content Flow) */}
        <div className="erd-mobile-pdp erd-mobile-only">
          
          {/* VIEWPORT 1: Hero & Purchase Panel (Fits exactly on entrance) */}
          <div className="erd-mobile-viewport-1">
            {/* Header Spacer (accounts for fixed header height) */}
            <div className="erd-mobile-header-spacer" />

            {/* Product Title and Colorway */}
            <div className="erd-mobile-title-block">
              <h1 className="erd-mobile-title">{product.title}</h1>
              {hasMultipleColors && selectedVariant && (
                <div className="erd-active-variant-badge">
                  {selectedVariant.title.toUpperCase()}
                </div>
              )}
              <div className="erd-mobile-colorway">{colorValues}</div>
            </div>

            {/* Main Product Image Container */}
            <div className="erd-mobile-image-container">
              <div className="erd-mobile-images-slider" onScroll={handleScroll}>
                {product.images && product.images.length > 0 ? (
                  product.images.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`${product.title} - ${index + 1}`}
                      className={`erd-mobile-hero-img ${index === activeImageIndex ? 'active' : ''}`}
                    />
                  ))
                ) : product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="erd-mobile-hero-img active"
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

            {/* Size Selectors */}
            {sizeOptions.length > 0 && (
              <div className="erd-mobile-sizes-wrap">
                <div className="erd-mobile-sizes">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`erd-mobile-size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => handleSizeClick(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add To Cart button (centered, compact width) */}
            <div className="erd-mobile-add-btn-wrap">
              <button
                className="erd-mobile-add-btn"
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant?.availableForSale}
              >
                {adding ? 'ADDING...' : `ADD TO CART — ${priceFormatted}`}
              </button>

              <div className="erd-payment-carousel">
                <div className="erd-payment-carousel-blur-left"></div>
                <div className="erd-payment-carousel-track">
                  <div className="erd-payment-carousel-group">
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                  </div>
                  <div className="erd-payment-carousel-group">
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                    <span>BITCOIN</span>
                    <span className="dot">•</span>
                    <span>SOLANA</span>
                    <span className="dot">•</span>
                    <span>CARD</span>
                    <span className="dot">•</span>
                  </div>
                </div>
                <div className="erd-payment-carousel-blur-right"></div>
              </div>
            </div>
          </div>

          {/* BELOW THE FOLD CONTENT */}
          <div className="erd-mobile-below-fold">
            {/* Product Description */}
            <div className="erd-mobile-desc-wrap">
              <p className="erd-mobile-desc-text">
                {cleanDescription || "PREMIUM GARMENT CRAFTED IN PORTUGAL. FINISHED WITH TRADITIONAL TECHNIQUES."}
              </p>
            </div>

            {/* Related Products */}
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

          {/* Sticky Header Add to Cart Button (visible on scroll) */}
          {showStickyAdd && (
            <div className="erd-mobile-sticky-header-btn-wrap">
              <button
                className="erd-mobile-sticky-header-btn"
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant?.availableForSale}
              >
                {adding ? 'ADDING...' : `ADD TO CART — ${priceFormatted}`}
              </button>
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
          font-family: var(--font-coolvetica), sans-serif;
          font-weight: normal;
          font-size: 29px;
          line-height: 0.9;
          text-transform: uppercase;
          text-align: center;
          max-width: 340px;
          color: #000000;
          margin: 0 0 12px 0;
          letter-spacing: 0.05em;
        }

        .erd-active-variant-badge {
          display: inline-block;
          background-color: #000000;
          color: #ffffff;
          font-family: var(--font-coolvetica), sans-serif;
          font-size: 11px;
          font-weight: normal;
          padding: 4px 10px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 0;
          text-align: center;
        }

        .erd-product-color {
          font-family: Arial, sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #000000;
          text-align: center;
          margin-bottom: 30px;
          letter-spacing: 0.02em;
        }
        .erd-product-color.erd-no-badge {
          margin-bottom: 16px;
        }

        .erd-product-description {
          font-family: var(--font-helvetica-roman), 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
          object-fit: cover;
          pointer-events: none;
          scroll-snap-align: center;
          flex-shrink: 0;
          opacity: 0.3;
          transform: scale(0.93);
          transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: opacity, transform;
        }
        .erd-product-img.active {
          opacity: 1;
          transform: scale(1);
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

        /* ══ PAYMENT METHODS CAROUSEL ══ */
        .erd-payment-carousel {
          position: relative;
          width: 240px;
          overflow: hidden;
          height: 20px;
          display: flex;
          align-items: center;
          margin-top: 14px;
        }

        .erd-payment-carousel-blur-left,
        .erd-payment-carousel-blur-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 35px;
          z-index: 2;
          pointer-events: none;
        }

        .erd-payment-carousel-blur-left {
          left: 0;
          background: linear-gradient(to right, #ffffff 15%, rgba(255, 255, 255, 0));
          backdrop-filter: blur(1.5px);
          -webkit-backdrop-filter: blur(1.5px);
        }

        .erd-payment-carousel-blur-right {
          right: 0;
          background: linear-gradient(to left, #ffffff 15%, rgba(255, 255, 255, 0));
          backdrop-filter: blur(1.5px);
          -webkit-backdrop-filter: blur(1.5px);
        }

        .erd-payment-carousel-track {
          display: flex;
          width: max-content;
          animation: erdPaymentMarquee 15s linear infinite;
        }

        .erd-payment-carousel-group {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-right: 16px;
          white-space: nowrap;
        }

        .erd-payment-carousel-group span {
          font-family: Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #888888;
          text-transform: uppercase;
        }

        .erd-payment-carousel-group .dot {
          color: #cccccc;
        }

        @keyframes erdPaymentMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        /* ══ RELATED PRODUCTS (DESKTOP) ══ */
        .erd-related-section {
          width: 100%;
          max-width: 100vw;
          padding: 80px 24px;
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
          gap: 12px;
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
          aspect-ratio: 3 / 4;
          background: #ffffff;
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
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Viewport 1 (Hero & Purchase - Fits screen exactly on entrance) */
          .erd-mobile-viewport-1 {
            height: 100vh;
            height: 100dvh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            padding-bottom: 24px;
            background: #ffffff;
          }

          /* Header Spacer (accounts for fixed brand bar) */
          .erd-mobile-header-spacer {
            height: 140px;
            width: 100%;
            flex-shrink: 0;
          }

          /* Title Block */
          .erd-mobile-title-block {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            box-sizing: border-box;
            padding: 0 24px;
            margin-bottom: 8px;
          }

          .erd-mobile-title {
            font-family: var(--font-coolvetica), sans-serif;
            font-weight: normal;
            font-size: clamp(18px, 6vw, 24px);
            line-height: 1.1;
            text-transform: uppercase;
            text-align: center;
            margin: 0;
            max-width: 360px;
            letter-spacing: 0.05em;
            color: #000000;
          }

          .erd-mobile-colorway {
            font-family: Arial, sans-serif;
            font-size: clamp(9px, 2.5vw, 10px);
            font-weight: 700;
            text-transform: uppercase;
            color: #000000;
            text-align: center;
            margin-top: 6px;
            letter-spacing: 0.04em;
          }

          /* Image Container (occupies full width of screen) */
          .erd-mobile-image-container {
            position: relative;
            width: 100vw;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            box-sizing: border-box;
            padding: 0;
          }

          .erd-mobile-images-slider {
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
          .erd-mobile-images-slider::-webkit-scrollbar {
            display: none;
          }

          .erd-mobile-hero-img {
            width: 100vw;
            height: 100%;
            object-fit: contain;
            background: transparent;
            scroll-snap-align: center;
            flex-shrink: 0;
            opacity: 0.3;
            transform: scale(0.93);
            transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            will-change: opacity, transform;
          }
          .erd-mobile-hero-img.active {
            opacity: 1;
            transform: scale(1);
          }

          .erd-mobile-image-indicator {
            position: absolute;
            bottom: 16px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 28px;
            font-family: Arial, sans-serif;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #888888;
            text-transform: uppercase;
            pointer-events: none;
            z-index: 10;
          }

          /* Sizes selectors */
          .erd-mobile-sizes-wrap {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            flex-shrink: 0;
            margin: 16px 0;
          }

          .erd-mobile-sizes {
            display: flex;
            justify-content: center;
            gap: 24px;
          }

          .erd-mobile-size-btn {
            background: none;
            border: none;
            padding: 4px 8px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #888888;
            text-transform: uppercase;
            border-bottom: 2px solid transparent;
            transition: color 0.2s, border-color 0.2s;
            border-radius: 0;
            text-align: center;
          }
          .erd-mobile-size-btn.selected {
            color: #000000;
            border-bottom: 2px solid #000000;
          }

          /* Add to Cart Button wrap */
          .erd-mobile-add-btn-wrap {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            gap: 12px;
          }

          .erd-payment-carousel {
            width: 220px;
            margin-top: 0;
          }

          .erd-mobile-add-btn {
            width: 220px;
            height: 38px;
            background: #000000;
            color: #ffffff;
            border: none;
            font-family: Arial, sans-serif;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0;
            transition: opacity 0.2s;
          }
          .erd-mobile-add-btn:hover:not(:disabled) {
            opacity: 0.85;
          }
          .erd-mobile-add-btn:disabled {
            background: #cccccc;
            color: #666666;
            cursor: not-allowed;
          }

          /* Below fold contents styling */
          .erd-mobile-below-fold {
            width: 100%;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Editorial note and descriptions */
          .erd-mobile-desc-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 48px 32px 64px 32px;
            box-sizing: border-box;
          }

          .erd-mobile-desc-text {
            font-family: var(--font-helvetica-roman), 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9.5px;
            line-height: 1.6;
            font-weight: 400;
            text-transform: uppercase;
            color: #000000;
            text-align: justify;
            text-align-last: center;
            letter-spacing: 0.02em;
            margin: 0;
            max-width: 340px;
            width: 100%;
          }

          /* Related Carousel */
          .erd-mobile-related-section {
            width: 100%;
            border-top: 1px solid #eaeaea;
            padding: 56px 0 80px 0;
            box-sizing: border-box;
          }

          .erd-mobile-related-heading {
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            color: #000000;
            margin: 0 0 28px 32px;
            letter-spacing: 0.05em;
          }

          .erd-mobile-related-carousel {
            display: flex;
            flex-direction: row;
            gap: 24px;
            overflow-x: auto;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
            padding: 0 32px;
            box-sizing: border-box;
          }
          .erd-mobile-related-carousel::-webkit-scrollbar {
            display: none;
          }

          .erd-mobile-related-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 65vw;
            flex-shrink: 0;
            text-decoration: none;
            text-align: center;
            scroll-snap-align: center;
          }

          .erd-mobile-related-img {
            width: 100%;
            aspect-ratio: 3 / 4;
            object-fit: contain;
            background: #ffffff;
          }

          .erd-mobile-related-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            margin-top: 16px;
          }

          .erd-mobile-related-title {
            font-family: Arial, sans-serif;
            font-size: 10px;
            font-weight: 900;
            color: #000000;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            line-height: 1.2;
          }

          .erd-mobile-related-color {
            font-family: Arial, sans-serif;
            font-size: 8px;
            font-weight: 700;
            color: #777777;
            text-transform: uppercase;
          }

          .erd-mobile-related-price {
            font-family: Arial, sans-serif;
            font-size: 9px;
            font-weight: 700;
            color: #000000;
          }

          /* Sticky Header Add to Cart wrap */
          .erd-mobile-sticky-header-btn-wrap {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .erd-mobile-sticky-header-btn {
            height: 28px;
            background: #000000;
            color: #ffffff;
            border: none;
            font-family: Arial, sans-serif;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0 14px;
            border-radius: 0;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .erd-mobile-sticky-header-btn:hover:not(:disabled) {
            opacity: 0.85;
          }
          .erd-mobile-sticky-header-btn:disabled {
            background: #cccccc;
            color: #666666;
            cursor: not-allowed;
          }
        }
      `}</style>
    </>
  );
}
