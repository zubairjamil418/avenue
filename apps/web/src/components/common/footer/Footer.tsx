import { Link } from "@/i18n/routing";
import Image from "next/image";
import { logo as defaultLogo } from "@/images";
import FooterBottomNavbar from "./FooterBottomNavbar";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import Container from "@/components/common/Container";

const footerColumns = [
  {
    title: "The Store",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "About Avenue", href: "/about" },
      { label: "Shop All", href: "/shop" },
      { label: "News & Events", href: "/blogs" },
    ],
  },
  {
    title: "Shopping Online",
    links: [
      { label: "New Arrivals", href: "/shop" },
      { label: "Track Your Order", href: "/order-tracking" },
      { label: "FAQs", href: "/faq" },
      { label: "Compare Products", href: "/compare" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "My Account", href: "/user/dashboard" },
      { label: "My Wishlist", href: "/user/wishlist" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
  {
    title: "About Us",
    links: [
      { label: "About Avenue", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Become a Vendor", href: "/vendor-registration" },
      { label: "Latest Stories", href: "/blogs" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const socialLinks = [
  { Icon: Facebook, href: "https://www.facebook.com/", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com/", label: "Instagram" },
  { Icon: Linkedin, href: "https://www.linkedin.com/", label: "LinkedIn" },
];

export default function Footer({ logoUrl }: { logoUrl?: string }) {
  return (
    <>
      {/* Full-width footer background */}
      <footer
        style={{
          width: "100%",
          background: "var(--footer-bg)",
          color: "var(--footer-text)",
          padding: "4rem 0 0",
        }}
      >
        <Container className="!px-[var(--site-gutter)]">
          {/* Centered logo */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Link href="/">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Avenue Retail"
                  style={{ width: "200px", height: "auto", display: "inline-block" }}
                />
              ) : (
                <Image
                  src={defaultLogo}
                  alt="Avenue Retail"
                  width={200}
                  height={60}
                  style={{ width: "200px", height: "auto", display: "inline-block" }}
                />
              )}
            </Link>
          </div>

          {/* 4-column link grid — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pb-12 border-b border-black/8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: 600,
                    color: "rgba(34,34,34,0.9)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {col.title}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map((link) => (
                    <li key={link.label} style={{ marginBottom: "0.75rem" }}>
                      <Link href={link.href} className="footer-col-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row 1: Payment (left) | Follow us (right) */}
          <div className="flex flex-wrap items-center justify-between gap-4" style={{ padding: "1.5rem 0 1rem" }}>
            {/* Payment methods image */}
            <img
              src="/images/payment-methods.png"
              alt="Payment methods"
              style={{ height: "28px", width: "auto", display: "block" }}
            />

            {/* Follow Us + social icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                  color: "rgba(34,34,34,0.9)",
                }}
              >
                Follow Us
              </span>
              {socialLinks.map(({ Icon, href, label }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{ color: "rgba(34,34,34,0.7)", display: "flex", alignItems: "center" }}
                >
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom row 2: Legal links (left) | Copyright (right) */}
          <div className="flex flex-wrap items-center justify-between gap-3" style={{ padding: "0.75rem 0 2rem", fontSize: "0.8rem", color: "rgba(34,34,34,0.6)" }}>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="footer-col-link" style={{ fontSize: "0.8rem" }}>
                About Us
              </Link>
              <Link href="/terms-and-conditions" className="footer-col-link" style={{ fontSize: "0.8rem" }}>
                Terms & Conditions
              </Link>
              <Link href="/privacy-policy" className="footer-col-link" style={{ fontSize: "0.8rem" }}>
                Security & Privacy Policy
              </Link>
            </div>

            <p style={{ margin: 0 }}>© 2026 Avenue Retail. All rights reserved.</p>
          </div>
        </Container>
      </footer>

      <FooterBottomNavbar />
    </>
  );
}
