// This is the About page component
// It tells the usr about Achilles Ltd and the purpose of this application
import React from 'react';
import './About.css';

function About() {
	return (
		<div className="about-page fade-in-up">
			{/* <section className="about-hero">
				<h1>About Us</h1>
				<p>Some text about who we are and what we do.</p>
				<p>Resize the browser window to see that this page is responsive.</p>
			</section> */}

			{/* <h2 className="about-section-title">Our Team</h2> */}

			<div className="row g-4">
				<div className="col-12 col-md-6 col-lg-4">
					<div className="card h-100">
						<img
							src="/images/logo.png"
							alt="Oisin Gibson"
							className="about-card-image"
						/>
						<div className="card-body about-card-body">
							<h5 className="card-title">Oisin Gibson</h5>
							<p className="text-muted mb-1">CEO &amp; Founder</p>
							<p className="card-text">
								Founder of Achilles Ltd, focused on building reliable systems that
								streamline financial document processing while keeping human experts in
								the loop.
							</p>
							<p className="card-text">oisin@achilles.com</p>
							<div className="about-card-actions">
								<button type="button" className="btn btn-outline-primary btn-sm">
									Contact
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-6 col-lg-4">
					<div className="card h-100">
						<img
							src="/images/logo.png"
							alt="Achilles Ltd logo"
							className="about-card-image"
						/>
						<div className="card-body about-card-body">
							<h5 className="card-title">Our Goal</h5>
							<p className="text-muted mb-1">Company Mission</p>
							<p className="card-text">
								We help teams handle complex financial documents faster and more
								consistently through secure, explainable NLP. Our tools reduce manual
								review time while improving accuracy and auditability.
							</p>
						</div>
					</div>
				</div>

				<div className="col-12 col-md-6 col-lg-4">
					<div className="card h-100">
						<img
							src="/images/logo.png"
							alt="John Doe"
							className="about-card-image"
						/>
						<div className="card-body about-card-body">
							<h5 className="card-title">John Doe</h5>
							<p className="text-muted mb-1">Designer</p>
							<p className="card-text">
								Designs clear, accessible interfaces that make complex analytics simple
								to understand. Focused on consistency, usability, and a polished user
								experience across the platform.
							</p>
							{/* <p className="card-text">john@example.com</p> */}
							<div className="about-card-actions">
								{/* <button type="button" className="btn btn-outline-primary btn-sm">
									Contact
								</button> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default About;

// export default About;
