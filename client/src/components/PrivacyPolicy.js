import React from 'react';
import './About.css';

function PrivacyPolicy() {
    return (
        <div className="about-page fade-in-up">
            <section className="about-hero">
                <h1>Privacy Policy</h1>
                <p>Your privacy is important to Achilles Ltd.</p>
            </section>

            <div className="card mt-4 mb-4">
                <div className="card-body about-card-body">
                    <h5 className="card-title mb-3">Information We Collect</h5>
                    <p>
                        Achilles Ltd only collects the following personal information when you register or use our services:
                    </p>
                    <ul>
                        <li>Username</li>
                        <li>Name</li>
                        <li>Password</li>
                        <li>Email address</li>
                    </ul>
                    <p>
                        All information is stored securely using industry best practices. Passwords are encrypted and never stored in plain text.
                    </p>
                    <h5 className="card-title mb-3 mt-4">Document Retention</h5>
                    <p>
                        Any documents you upload are automatically deleted after 6 months. We do not use your documents for any purpose other than providing our service to you.
                    </p>
                    <h5 className="card-title mb-3 mt-4">Data Security</h5>
                    <p>
                        Achilles Ltd is committed to protecting your data. All personal information and documents are stored securely and protected against unauthorized access. We use modern security protocols and regularly review our systems to ensure your data remains safe.
                    </p>
                    <h5 className="card-title mb-3 mt-4">Your Rights</h5>
                    <p>
                        You may request to view, update, or delete your personal information at any time by contacting us at <a href="mailto:achillesltdInfo@achilles.com">achillesltdInfo@achilles.com</a>.
                    </p>
                    <h5 className="card-title mb-3 mt-4">Contact Us</h5>
                    <p>
                        If you have any questions or concerns about this Privacy Policy or your data, please contact Achilles Ltd at <a href="mailto:achillesltdInfo@achilles.com">achillesltdInfo@achilles.com</a>.
                    </p>
                    <p className="text-muted mt-4" style={{ fontSize: '0.95rem' }}>
                        This policy may be updated from time to time. Please check this page for the latest information.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
