import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import HeroSection from '@/components/HeroSection';
import HomeCollection from '@/components/HomeCollection';

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <HeroSection />

      {/* Manifesto */}
      <section className="tn-mani">
        <div className="tn-mani-inner">
          <div className="tn-mani-rule" />
          <p className="tn-mani-body">
            Not a brand.<br />
            A house.<br /><br />
            Not a collection.<br />
            A lineage.<br /><br />
            Built in silence,<br />
            worn in permanence.
          </p>
          <div className="tn-mani-rule" />
          <p className="tn-mani-sig">TONET PARIS &mdash; EST. MMXXIV</p>
        </div>
      </section>

      {/* Collection: For Him / For Her */}
      <HomeCollection products={products} />

      {/* Editorial A — Split */}
      <section className="tn-edit-a">
        <div className="tn-edit-a-img">
          <img src="/hero/ComfyUI-main_reference_00021_.png" alt="" loading="lazy" decoding="async" />
        </div>
        <div className="tn-edit-a-text">
          <p className="tn-edit-a-over">THE CRAFT</p>
          <h2 className="tn-edit-a-headline">MADE WITH<br />INTENTION.</h2>
          <p className="tn-edit-a-body">
            Every piece bearing the House mark is constructed
            with deliberate restraint. No excess. No ornament
            beyond what is necessary. Only the precision of form,
            the weight of fabric, and the silence of craft.
          </p>
          <Link href="/about" className="tn-edit-a-cta">The House &rarr;</Link>
        </div>
      </section>

      {/* Editorial B — Full bleed */}
      <section className="tn-edit-b">
        <img src="/hero/ComfyUI-main_reference_00023_.png" alt="" className="tn-edit-b-img" loading="lazy" decoding="async" />
        <div className="tn-edit-b-overlay" />
        <div className="tn-edit-b-content">
          <h2 className="tn-edit-b-headline">CRAFTED FOR<br />PERMANENCE.</h2>
          <p className="tn-edit-b-sub">Designed to outlast trends.</p>
        </div>
      </section>

      <style>{`
        /* ══ MANIFESTO ══ */
        .tn-mani {
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 160px 40px;
        }
        .tn-mani-inner {
          max-width: 520px;
          width: 100%;
          text-align: center;
        }
        .tn-mani-rule {
          width: 1px;
          height: 52px;
          background: rgba(255,255,255,0.12);
          margin: 0 auto 60px;
        }
        .tn-mani-body {
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 300;
          line-height: 2.4;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.05em;
          margin: 0 0 60px;
        }
        .tn-mani-sig {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.18);
          text-transform: uppercase;
          margin: 0;
        }

        /* ══ EDITORIAL A — SPLIT ══ */
        .tn-edit-a {
          display: grid;
          grid-template-columns: 55% 45%;
          background: #0d0d0d;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .tn-edit-a-img {
          overflow: hidden;
          position: relative;
          min-height: 80dvh;
        }
        .tn-edit-a-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.7;
        }
        .tn-edit-a-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 80px;
        }
        .tn-edit-a-over {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.48em;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          margin: 0 0 48px;
        }
        .tn-edit-a-headline {
          font-family: var(--font-primary);
          font-size: clamp(28px, 3.8vw, 52px);
          font-weight: 200;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.82);
          text-transform: uppercase;
          line-height: 1.1;
          margin: 0 0 48px;
        }
        .tn-edit-a-body {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          line-height: 2.2;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.04em;
          margin: 0 0 56px;
          max-width: 400px;
        }
        .tn-edit-a-cta {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.4em;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          padding-bottom: 5px;
          width: fit-content;
          transition: color 0.5s, border-color 0.5s;
        }
        .tn-edit-a-cta:hover {
          color: rgba(255,255,255,0.72);
          border-color: rgba(255,255,255,0.32);
          opacity: 1 !important;
        }

        /* ══ EDITORIAL B — FULL BLEED ══ */
        .tn-edit-b {
          position: relative;
          width: 100%;
          height: 85dvh;
          overflow: hidden;
          background: #0a0a0a;
        }
        .tn-edit-b-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.7;
        }
        .tn-edit-b-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.6) 0%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.35) 100%
          );
        }
        .tn-edit-b-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 2;
        }
        .tn-edit-b-headline {
          font-family: var(--font-primary);
          font-size: clamp(32px, 5vw, 72px);
          font-weight: 200;
          letter-spacing: 0.14em;
          color: #fff;
          text-transform: uppercase;
          line-height: 1.05;
          margin: 0 0 28px;
        }
        .tn-edit-b-sub {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin: 0;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1024px) {
          .tn-edit-a-text { padding: 80px 48px; }
        }
        @media (max-width: 767px) {
          .tn-mani { padding: 100px 28px; }
          .tn-mani-body { font-size: 13px; line-height: 2.2; }
          .tn-edit-a { grid-template-columns: 1fr; }
          .tn-edit-a-img { min-height: 55dvh; }
          .tn-edit-a-text { padding: 60px 24px; }
          .tn-edit-b { height: 75dvh; }
          .tn-edit-b-headline {
            font-size: clamp(24px, 8vw, 48px);
            letter-spacing: 0.1em;
          }
        }
      `}</style>
    </>
  );
}
