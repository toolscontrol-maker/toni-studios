'use client';

import Link from 'next/link';
import type { Product, CollectionSummary } from '@/lib/shopify';

interface Props {
  query: string;
  products: Product[];
  collections: CollectionSummary[];
}

export default function SearchClient({ query, products, collections }: Props) {
  const totalResults = products.length + collections.length;

  return (
    <div className="sr-wrap">
      <div className="sr-header">
        <h1 className="sr-title">
          {query
            ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
            : 'Search'}
        </h1>
      </div>

      {collections.length > 0 && (
        <section className="sr-section">
          <h2 className="sr-section-title">Collections</h2>
          <div className="sr-col-grid">
            {collections.map(c => (
              <Link key={c.handle} href={`/collection/${c.handle}`} className="sr-col-card">
                {c.imageUrl && <img src={c.imageUrl} alt={c.title} className="sr-col-img" />}
                <span className="sr-col-name">{c.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="sr-section">
          {collections.length > 0 && <h2 className="sr-section-title">Products</h2>}
          <div className="sr-grid">
            {products.map(p => (
              <Link key={p.handle} href={`/product/${p.handle}`} className="sr-card">
                <div className="sr-img-wrap">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="sr-img" />}
                </div>
                <div className="sr-meta">
                  <span className="sr-name">
                    {p.title.charAt(0).toUpperCase() + p.title.slice(1).toLowerCase()}
                  </span>
                  <span className="sr-price">
                    €{Number(p.price).toFixed(0)} {p.currencyCode}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {query && totalResults === 0 && (
        <div className="sr-empty">
          <p>No results found for &ldquo;{query}&rdquo;.</p>
          <p className="sr-empty-sub">Try a different term or browse our collections.</p>
          <Link href="/collections" className="sr-empty-link">View all collections</Link>
        </div>
      )}

      <style>{`
        .sr-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 80px;
          font-family: var(--font-primary);
          min-height: 60vh;
        }
        .sr-header {
          margin-bottom: 40px;
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 20px;
        }
        .sr-title {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #111;
        }
        .sr-section {
          margin-bottom: 56px;
        }
        .sr-section-title {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 20px;
        }
        /* Collections row */
        .sr-col-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sr-col-card {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #111;
          border: 1px solid #e5e5e5;
          padding: 10px 16px;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.15s;
        }
        .sr-col-card:hover { background: #f5f5f5; }
        .sr-col-img {
          width: 32px;
          height: 32px;
          object-fit: cover;
        }
        /* Products grid */
        .sr-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        @media (max-width: 900px) {
          .sr-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .sr-grid { grid-template-columns: repeat(2, 1fr); }
          .sr-wrap { padding-top: 60px; }
        }
        .sr-card {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .sr-img-wrap {
          aspect-ratio: 3/4;
          background: #EEEDED;
          overflow: hidden;
        }
        .sr-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .sr-card:hover .sr-img { transform: scale(1.03); }
        .sr-meta {
          padding: 10px 0 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sr-name {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: #111;
          line-height: 1.3;
        }
        .sr-price {
          font-size: 12px;
          font-weight: 400;
          color: #555;
        }
        /* Empty state */
        .sr-empty {
          padding: 60px 0;
          text-align: center;
          color: #555;
          font-size: 13px;
          line-height: 1.8;
        }
        .sr-empty-sub {
          color: #999;
          font-size: 12px;
        }
        .sr-empty-link {
          display: inline-block;
          margin-top: 24px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #111;
          border-bottom: 1px solid #111;
          text-decoration: none;
          padding-bottom: 2px;
        }
      `}</style>
    </div>
  );
}
