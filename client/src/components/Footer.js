/**
 * Footer Component - Bottom Site Footer
 * 
 * This is the footer shown at the bottom of every page.
 * 
 * Features:
 * - Company branding and tagline
 * - Quick navigation links
 * - Contact information
 * - Social media links
 * - Copyright notice
 * - Legal links (Privacy Policy, Terms of Service)
 * - Responsive layout (stacks on mobile)
 * 
 * Uses Bootstrap grid system for responsive columns
 */

import React from 'react';
import Logo from './Logo';

function Footer() {
  // Get current year for copyright notice
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          
          {/* Column 1: Company Info */}
          <div className="col-lg-4 mb-4">
            {/* Logo and Company Name */}
            <div className="d-flex align-items-center mb-3">
              <Logo />
              <h3 className="ms-3 mb-0">Achilles Ltd</h3>
            </div>
            
            {/* Company Tagline */}
            <p className="text-primary fw-bold mb-2">
              Strength in Management, Excellence in Service
            </p>
            
            {/* Company Description */}
            <p className="text-muted">
              Professional management solutions inspired by legendary excellence
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="text-primary mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/dashboard" className="text-light text-decoration-none">
                  Dashboard
                </a>
              </li>
              <li className="mb-2">
                <a href="/admin" className="text-light text-decoration-none">
                  Admin Panel
                </a>
              </li>
              <li className="mb-2">
                <a href="/about" className="text-light text-decoration-none">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Contact Information */}
          <div className="col-lg-3 col-md-4 mb-4">
            <h5 className="text-primary mb-3">Contact</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2"></i>
                info@achillesLtd.com
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2"></i>
                +353 (087) 132 4567
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt-fill me-2"></i>
                ATU, Letterkenny, Co. Donegal, Ireland
              </li>
            </ul>
          </div>
          
          {/* Column 4: Social Media Links */}
          <div className="col-lg-3 col-md-4 mb-4">
            <h5 className="text-primary mb-3">Follow Us</h5>
            <div className="d-flex gap-3">
              <a 
                href="https://www.linkedin.com/in/oisin-gibson-8b2167152/" 
                className="btn btn-outline-primary btn-sm" 
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <a 
                href="https://twitter.com/" 
                className="btn btn-outline-primary btn-sm" 
                aria-label="Twitter"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a 
                href="https://www.facebook.com/" 
                className="btn btn-outline-primary btn-sm" 
                aria-label="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Separator Line */}
        <hr className="border-secondary my-4" />
        
        {/* Bottom Row: Copyright and Legal Links */}
        <div className="row">
          {/* Left side: Copyright */}
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <p className="mb-0 text-light">
              &copy; {currentYear} Achilles Ltd. All rights reserved.
              <span className="d-block d-sm-inline ms-sm-2 mt-1 mt-sm-0" style={{ color: 'grey' }}>
                • Developed by <strong>Oisin G</strong>
              </span>
            </p>
          </div>
          
          {/* Right side: Legal Links */}
          <div className="col-md-6 text-center text-md-end">
            <a href="/privacy" className="text-light text-decoration-none me-3">
              Privacy Policy
            </a>
            <span className="text-light">•</span>
            <a href="/terms" className="text-light text-decoration-none ms-3">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
