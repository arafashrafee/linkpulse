import Link from "next/link";
import { ArrowUpRight, BarChart3, Check, Globe2, Link2, MousePointer2, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

const features = [
  { icon: Link2, title: "A better first impression.", description: "Turn long URLs into clean, memorable links. Add a custom alias that fits what you’re sharing." },
  { icon: BarChart3, title: "See the story behind every click.", description: "Understand your audience through click activity, locations, devices, and referral sources." },
  { icon: SlidersHorizontal, title: "Stay in control.", description: "Update destinations, set an expiration, or pause a link. Manage everything in one workspace." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <SiteHeader userEmail={user?.email} />
      <main className="landing">
        <section className="hero">
          <div className="hero-copy">
            <div className="product-tag"><span /> Small links. Real insight.</div>
            <h1>Every link is<br />a connection.</h1>
            <p className="hero-description">Make it count. Create memorable short links and discover the people, places, and clicks behind them.</p>
            <div className="hero-actions">
              <Link href={user ? "/dashboard" : "/signup"} className="btn-primary">{user ? "Open your dashboard" : "Start creating links"}<ArrowUpRight size={17} aria-hidden="true" /></Link>
              <a href="#overview" className="text-link">Explore LinkPulse <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-note"><Check size={15} aria-hidden="true" /> Custom links <span /> Click analytics <span /> One workspace</div>
          </div>
          <div className="product-stage">
            <div className="preview-orbit" aria-hidden="true" />
            <div className="link-preview">
              <div className="preview-heading"><span className="preview-icon"><Link2 size={19} aria-hidden="true" /></span><div><strong>Your next big idea</strong><p>One link. Ready to share.</p></div><span className="active-badge">Active</span></div>
              <div className="sample-url"><span>linkpulse /</span> summer-launch <ArrowUpRight size={18} aria-hidden="true" /></div>
              <p className="destination">yourbrand.com/collections/summer-2026</p>
            </div>
            <figure className="analytics-preview">
              <figcaption><span><span className="signal-dot" /> Link performance</span><span className="demo-label">Illustrative preview</span></figcaption>
              <div className="preview-stat"><div><p>Total clicks</p><strong>2,846</strong></div><span>Last 7 days</span></div>
              <svg className="preview-chart" viewBox="0 0 420 135" role="img" aria-label="Example click activity increasing over seven days">
                <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6f9cff" stopOpacity=".25" /><stop offset="100%" stopColor="#6f9cff" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 30H420 M0 75H420 M0 120H420" stroke="#ffffff" strokeOpacity=".09" strokeDasharray="4 5" />
                <path d="M0 113 C25 114 25 86 50 92 S85 114 105 80 S140 100 160 67 S195 83 218 53 S250 69 278 41 S307 61 335 29 S377 46 420 10 L420 135 L0 135 Z" fill="url(#chart-fill)" />
                <path d="M0 113 C25 114 25 86 50 92 S85 114 105 80 S140 100 160 67 S195 83 218 53 S250 69 278 41 S307 61 335 29 S377 46 420 10" fill="none" stroke="#8aafff" strokeWidth="3" />
              </svg>
              <div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
              <div className="preview-bottom"><span><Globe2 size={15} aria-hidden="true" /> Across the world</span><span><MousePointer2 size={15} aria-hidden="true" /> Every click, a signal</span></div>
            </figure>
          </div>
        </section>
        <section id="overview" className="overview">
          <div className="section-intro"><h2>Shorten the link.<br />See the bigger picture.</h2><p>From the first share to the next decision.<br />The essentials, thoughtfully connected.</p></div>
          <div className="feature-grid">{features.map(({ icon: Icon, title, description }) => <article key={title}><div className="feature-icon"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></div><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>
        <section className="closing-cta"><div><h2>Your next connection starts here.</h2><p>Give every link a purpose. See where it takes you.</p></div><Link href={user ? "/dashboard" : "/signup"} className="btn-primary">{user ? "Open dashboard" : "Create your account"}<ArrowUpRight size={17} aria-hidden="true" /></Link></section>
      </main>
      <footer className="site-footer"><span>LinkPulse</span><p>A little link. A clearer picture.</p><Link href={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Sign in"}</Link></footer>
    </>
  );
}
