import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-2">WARDEN</h4>
            <p className="text-sm text-white/90">
              WARDEN is a lightweight community-driven news and incident
              reporting platform. We help people share verified information and
              stay informed.
            </p>
          </div>

          <nav>
            <h5 className="font-medium mb-2">Site</h5>
            <ul className="space-y-1 text-sm">
              <li>
                <Link className="link link-hover" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="link link-hover" href="/posts">
                  News Feed
                </Link>
              </li>
              <li>
                <Link className="link link-hover" href="/about">
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <nav>
            <h5 className="font-medium mb-2">Resources</h5>
            <ul className="space-y-1 text-sm">
              <li>
                <Link className="link link-hover" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="link link-hover" href="/terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className="link link-hover" href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h5 className="font-medium mb-2">Connect</h5>
            <p className="text-sm mb-2">habibur.web04@gmail.com</p>
            <div className="flex items-center gap-3">
              <a
                aria-label="Twitter"
                className="hover:opacity-80"
                href="https://twitter.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  fill="currentColor"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.3 3.9A12.14 12.14 0 013 4.79a4.28 4.28 0 001.33 5.72 4.24 4.24 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.2 4.3 4.3 0 01-1.93.07 4.28 4.28 0 003.99 2.97A8.59 8.59 0 012 19.54a12.11 12.11 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58A8.7 8.7 0 0024 6.56a8.5 8.5 0 01-2.54.7z" />
                </svg>
              </a>
              <a
                aria-label="Facebook"
                className="hover:opacity-80"
                href="https://facebook.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  fill="currentColor"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.92v-7.02H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.62.77-1.62 1.56v1.87h2.77l-.44 2.9h-2.33V22c4.78-.8 8.44-4.93 8.44-9.93z" />
                </svg>
              </a>
              <a
                aria-label="Email"
                className="hover:opacity-80"
                href="mailto:habibur.web04@gmail.com"
              >
                <svg
                  fill="currentColor"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-sm text-white/80 flex flex-col md:flex-row items-center justify-between">
          <p>© {year} WARDEN. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built by © Team Monsur Mithai</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
