import React from 'react';
import './About.css';

function TermsOfService() {
  return (
    <div className="about-page fade-in-up">
      <section className="about-hero">
        <h1>Terms of Service</h1>
        <p>Welcome to Achilles Ltd. Please read these terms carefully before using our services.</p>
      </section>

      <div className="card mt-4 mb-4">
        <div className="card-body about-card-body">
          <h5 className="card-title mb-3">1. Acceptance of Terms</h5>
          <p>
            By accessing or using our services, you agree to be bound by these Terms of Service and our Privacy Policy.
          </p>

          <h5 className="card-title mb-3 mt-4">2. User Accounts</h5>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as necessary.
          </p>

          <h5 className="card-title mb-3 mt-4">3. Use of Service</h5>
          <p>
            You agree to use Achilles Ltd services only for lawful purposes. You must not use the service to upload or share unlawful, harmful, or infringing content.
          </p>

          <h5 className="card-title mb-3 mt-4">4. Document Retention</h5>
          <p>
            Uploaded documents are automatically deleted after 6 months. Achilles Ltd is not responsible for any loss of data after this period.
          </p>

          <h5 className="card-title mb-3 mt-4">5. Data Security</h5>
          <p>
            We take reasonable measures to protect your data. However, you acknowledge that no system is completely secure.
          </p>

          <h5 className="card-title mb-3 mt-4">6. Termination</h5>
          <p>
            We reserve the right to suspend or terminate your access to the service at our discretion, without notice, for conduct that we believe violates these terms or is harmful to other users or us.
          </p>

          <h5 className="card-title mb-3 mt-4">7. Changes to Terms</h5>
          <p>
            Achilles Ltd may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>

          <h5 className="card-title mb-3 mt-4">8. Contact</h5>
          <p>
            For questions about these terms, contact us at <a href="mailto:achillesltdInfo@achilles.com">achillesltdInfo@achilles.com</a>.
          </p>

          <p className="text-muted mt-4" style={{ fontSize: '0.95rem' }}>
            &copy; {new Date().getFullYear()} Achilles Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
