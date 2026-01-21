/**
 * Logo Component - Company Logo
 * 
 * Displays the Achilles Ltd company logo
 * Used in both header and footer
 */

import React from 'react';

function Logo() {
  return (
    <img 
      src="/images/logo.png" 
      alt="Achilles Ltd Logo" 
      style={{ width: '50px', height: '50px', objectFit: 'contain' }}
    />
  );
}

export default Logo;