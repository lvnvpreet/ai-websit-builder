// services/promptExamples.js

/**
 * Home page section examples for prompts
 */
const homePageExamples = {
    // Hero Section Example
    hero: {
        html: `<section id="hero" class="py-5 bg-primary text-white">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <h1 class="display-4 fw-bold">Expert Plumbing Solutions</h1>
        <p class="lead mb-4">Professional plumbing services for residential and commercial properties in New York City.</p>
        <div class="d-flex gap-3">
          <a href="#contact" class="btn btn-light btn-lg px-4">Get a Quote</a>
          <a href="#services" class="btn btn-outline-light btn-lg px-4">Our Services</a>
        </div>
      </div>
      <div class="col-lg-6 d-none d-lg-block">
        <img src="images/hero-plumber.jpg" alt="Professional Plumber" class="img-fluid rounded shadow">
      </div>
    </div>
  </div>
  <div class="scroll-indicator">
    <a href="#intro"><i class="fas fa-chevron-down"></i></a>
  </div>
</section>`,
        css: `#hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
}

#hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

#hero .lead {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  margin-bottom: 2rem;
}

#hero .btn {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

#hero .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

#hero img {
  transform: translateY(-20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
}

@media (max-width: 991px) {
  #hero {
    text-align: center;
    padding: 6rem 0;
  }
}`
    },

    // Introduction Section Example
    intro: {
        html: `<section id="intro" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <h2 class="section-title">Trusted by New Yorkers Since 2005</h2>
        <p class="lead">At Star Plumbers, we provide top-quality plumbing services with reliability, integrity, and expertise.</p>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-4">
        <div class="intro-card text-center">
          <div class="intro-icon mb-3">
            <i class="fas fa-medal"></i>
          </div>
          <h3>Experienced Professionals</h3>
          <p>Our team of licensed plumbers brings over 20 years of industry experience to every job.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="intro-card text-center">
          <div class="intro-icon mb-3">
            <i class="fas fa-clock"></i>
          </div>
          <h3>24/7 Emergency Service</h3>
          <p>Plumbing emergencies don't wait, and neither do we. Available around the clock for urgent repairs.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="intro-card text-center">
          <div class="intro-icon mb-3">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <h3>Transparent Pricing</h3>
          <p>No hidden fees or surprise costs. We provide detailed estimates before any work begins.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#intro {
  background-color: #f8f9fa;
  padding: 80px 0;
}

#intro .section-title {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 1.5rem;
}

#intro .section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
}

.intro-card {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.intro-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.intro-icon {
  width: 80px;
  height: 80px;
  line-height: 80px;
  font-size: 2.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  margin: 0 auto;
}`
    },

    // Services Section Example
    services: {
        html: `<section id="services" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <h2 class="section-title">Our Services</h2>
        <p class="lead">We provide comprehensive plumbing solutions for residential and commercial properties.</p>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <div class="service-icon">
            <i class="fas fa-wrench"></i>
          </div>
          <h3>Emergency Repairs</h3>
          <p>Fast response to urgent plumbing issues including burst pipes, severe leaks, and backups.</p>
          <ul class="service-features">
            <li><i class="fas fa-check"></i> 24/7 Availability</li>
            <li><i class="fas fa-check"></i> 60-Minute Response Time</li>
            <li><i class="fas fa-check"></i> Fully-Equipped Service Vans</li>
          </ul>
          <a href="#contact" class="btn btn-outline-primary">Learn More</a>
        </div>
      </div>
      
      <!-- Additional service cards would go here -->
    </div>
  </div>
</section>`,
        css: `#services {
  padding: 100px 0;
}

#services .section-title {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 1.5rem;
}

.service-card {
  background-color: white;
  border-radius: 10px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.service-icon {
  width: 70px;
  height: 70px;
  line-height: 70px;
  text-align: center;
  font-size: 1.75rem;
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
  margin-bottom: 20px;
}`
    },

    // Testimonials Section Example
    testimonials: {
        html: `<section id="testimonials" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <h2 class="section-title">What Our Clients Say</h2>
        <p class="lead">Don't just take our word for it. See what our customers have to say about our services.</p>
      </div>
    </div>
    
    <div class="testimonial-slider">
      <div class="row">
        <div class="col-md-4">
          <div class="testimonial-card">
            <div class="testimonial-rating">
              <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
              <i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <div class="testimonial-content">
              <p>"Star Plumbers came to our rescue during a major bathroom leak. They arrived within 30 minutes and fixed the issue quickly. Extremely professional and knowledgeable!"</p>
            </div>
            <div class="testimonial-author">
              <img src="images/testimonial-1.jpg" alt="John Davis" class="testimonial-avatar">
              <div>
                <h4>John Davis</h4>
                <p>Manhattan, NY</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- More testimonial cards would go here -->
      </div>
    </div>
  </div>
</section>`,
        css: `#testimonials {
  background-color: #f8f9fa;
  padding: 100px 0;
  position: relative;
}

.testimonial-card {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  position: relative;
}

.testimonial-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.testimonial-card:before {
  content: '"';
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 80px;
  font-family: Georgia, serif;
  color: rgba(var(--primary-color-rgb), 0.1);
  line-height: 1;
}`
    },

    // CTA Section Example
    cta: {
        html: `<section id="cta" class="py-5">
  <div class="container">
    <div class="cta-box">
      <div class="row align-items-center">
        <div class="col-lg-8 mb-4 mb-lg-0">
          <h2>Ready to Fix Your Plumbing Issues?</h2>
          <p class="lead mb-0">Contact us today for a free consultation and quote. We're available 24/7 for all your plumbing needs.</p>
        </div>
        <div class="col-lg-4 text-lg-end">
          <a href="#contact" class="btn btn-primary btn-lg">Contact Us Now</a>
          <p class="mt-2">Or call us at <strong>(212) 555-1234</strong></p>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#cta {
  padding: 80px 0;
  background-image: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  background-size: cover;
  position: relative;
  color: white;
}

.cta-box {
  position: relative;
  z-index: 2;
  padding: 60px 40px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

#cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

#cta .btn {
  padding: 12px 30px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid white;
  background-color: white;
  color: var(--primary-color);
}`
    },

    // Newsletter Section (Optional)
    newsletter: {
        html: `<section id="newsletter" class="py-5">
  <div class="container">
    <div class="newsletter-box">
      <div class="row align-items-center">
        <div class="col-lg-6 mb-4 mb-lg-0">
          <h2>Stay Updated</h2>
          <p class="lead">Subscribe to our newsletter for seasonal plumbing tips, exclusive discounts, and more.</p>
          <ul class="newsletter-benefits">
            <li><i class="fas fa-check-circle"></i> Seasonal maintenance tips</li>
            <li><i class="fas fa-check-circle"></i> Special promotions and discounts</li>
            <li><i class="fas fa-check-circle"></i> New service announcements</li>
          </ul>
        </div>
        <div class="col-lg-6">
          <div class="newsletter-form">
            <form id="subscribeForm">
              <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Your Name" required>
              </div>
              <div class="input-group mb-3">
                <input type="email" class="form-control" placeholder="Email Address" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Subscribe Now</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#newsletter {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.newsletter-box {
  background-color: white;
  border-radius: 15px;
  padding: 50px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.newsletter-benefits {
  list-style: none;
  padding: 0;
  margin-bottom: 0;
}

.newsletter-benefits li {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.newsletter-form {
  background-color: rgba(var(--primary-color-rgb), 0.05);
  padding: 30px;
  border-radius: 10px;
}`
    },

    // Image Slider Section (Optional)
    imageSlider: {
        html: `<section id="project-gallery" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <h2 class="section-title">Our Recent Projects</h2>
        <p class="lead">Browse through our gallery of completed plumbing projects in New York City.</p>
      </div>
    </div>
    
    <div class="image-slider">
      <div class="slider-container">
        <div class="slider-item">
          <img src="images/project-1.jpg" alt="Bathroom Renovation" class="img-fluid">
          <div class="slider-caption">
            <h3>Luxury Bathroom Renovation</h3>
            <p>Complete overhaul with custom fixtures in Manhattan</p>
          </div>
        </div>
        <!-- More slider items would go here -->
      </div>
      
      <div class="slider-controls">
        <button class="slider-prev"><i class="fas fa-chevron-left"></i></button>
        <div class="slider-pagination"></div>
        <button class="slider-next"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
  </div>
</section>`,
        css: `#project-gallery {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.slider-container {
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.slider-item {
  position: relative;
}

.slider-item img {
  width: 100%;
  height: 500px;
  object-fit: cover;
}

.slider-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
  color: white;
}`
    }
};

const aboutPageExamples = {
    // Header/Intro Section
    header: {
        html: `<section id="about-header" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 text-center">
        <h1 class="display-4 fw-bold">About Our Company</h1>
        <p class="lead">Learn about our story, mission, and the team behind our success.</p>
      </div>
    </div>
  </div>
</section>`,
        css: `#about-header {
  padding: 80px 0;
  background-color: #f8f9fa;
  position: relative;
}

#about-header:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
}

#about-header h1 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

#about-header .lead {
  font-size: 1.25rem;
  color: #555;
}`
    },

    // Company Story Section
    story: {
        html: `<section id="our-story" class="py-5">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <div class="story-image-container">
          <img src="images/company-history.jpg" alt="Our Company History" class="img-fluid rounded shadow-lg">
          <div class="year-badge">Est. 2005</div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="section-heading mb-4">
          <h2>Our Story</h2>
          <div class="heading-line"></div>
        </div>
        <p class="mb-4">Founded in 2005, our company began with a vision to transform the industry by providing exceptional service and innovative solutions. What started as a small team of three dedicated professionals has grown into a trusted industry leader.</p>
        <p class="mb-4">Through the years, we've stayed true to our founding principles while embracing new technologies and approaches to better serve our clients.</p>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-badge">2005</div>
            <div class="timeline-content">
              <h5>Company Founded</h5>
              <p>Started with a small office and three team members</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-badge">2010</div>
            <div class="timeline-content">
              <h5>Expanded Services</h5>
              <p>Added new service offerings and doubled our team size</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-badge">2015</div>
            <div class="timeline-content">
              <h5>New Headquarters</h5>
              <p>Moved to our current location to accommodate growth</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-badge">2020</div>
            <div class="timeline-content">
              <h5>Digital Transformation</h5>
              <p>Embraced new technologies to enhance client experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#our-story {
  padding: 100px 0;
  background-color: white;
}

.section-heading h2 {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 1rem;
}

.heading-line {
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
  margin-bottom: 2rem;
}

.story-image-container {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.year-badge {
  position: absolute;
  bottom: 30px;
  left: 30px;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.timeline {
  margin-top: 40px;
  position: relative;
}

.timeline:before {
  content: '';
  position: absolute;
  top: 0;
  left: 15px;
  height: 100%;
  width: 2px;
  background-color: var(--primary-color);
}

.timeline-item {
  padding-left: 50px;
  margin-bottom: 25px;
  position: relative;
}

.timeline-badge {
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  line-height: 30px;
  font-weight: 700;
  font-size: 0.8rem;
  z-index: 1;
}

.timeline-content h5 {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.timeline-content p {
  margin-bottom: 0;
  color: #666;
}`
    },

    // Mission & Values Section
    mission: {
        html: `<section id="mission-values" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Our Mission & Values</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Guiding principles that drive everything we do</p>
        </div>
      </div>
    </div>
    
    <div class="row mb-5">
      <div class="col-md-8 mx-auto">
        <div class="mission-box text-center">
          <h3>Our Mission</h3>
          <p>To provide exceptional service and innovative solutions that exceed client expectations, while maintaining the highest standards of quality, integrity, and professionalism.</p>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-4">
        <div class="value-card">
          <div class="value-icon">
            <i class="fas fa-star"></i>
          </div>
          <h3>Excellence</h3>
          <p>We strive for excellence in every aspect of our work, constantly seeking ways to improve and deliver the best possible outcomes for our clients.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="value-card">
          <div class="value-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <h3>Integrity</h3>
          <p>We conduct business with the highest level of integrity, being transparent, honest, and ethical in all our interactions with clients and partners.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="value-card">
          <div class="value-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <h3>Innovation</h3>
          <p>We embrace innovation and creative thinking to develop forward-thinking solutions that address evolving challenges and opportunities.</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#mission-values {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.section-heading {
  margin-bottom: 3rem;
}

.section-heading h2 {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 1rem;
}

.heading-line {
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.mission-box {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
}

.mission-box h3 {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}

.mission-box h3:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background-color: var(--primary-color);
}

.mission-box p {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
}

.value-card {
  background-color: white;
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.value-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.value-icon {
  width: 80px;
  height: 80px;
  line-height: 80px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  font-size: 2rem;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.value-card h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1rem;
}

.value-card p {
  color: #666;
  line-height: 1.7;
}`
    },

    // Team Section
    team: {
        html: `<section id="our-team" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Meet Our Team</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Dedicated professionals working together to serve you</p>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-3">
        <div class="team-card">
          <div class="team-image">
            <img src="images/team-1.jpg" alt="John Smith, CEO" class="img-fluid">
            <div class="team-social">
              <a href="#"><i class="fab fa-linkedin-in"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fas fa-envelope"></i></a>
            </div>
          </div>
          <div class="team-info">
            <h3>John Smith</h3>
            <p class="team-title">Chief Executive Officer</p>
            <p class="team-desc">John founded the company in 2005 with a vision to transform the industry with innovative solutions.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-3">
        <div class="team-card">
          <div class="team-image">
            <img src="images/team-2.jpg" alt="Sarah Johnson, COO" class="img-fluid">
            <div class="team-social">
              <a href="#"><i class="fab fa-linkedin-in"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fas fa-envelope"></i></a>
            </div>
          </div>
          <div class="team-info">
            <h3>Sarah Johnson</h3>
            <p class="team-title">Chief Operations Officer</p>
            <p class="team-desc">Sarah oversees all operations, ensuring we deliver exceptional service to all clients.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-3">
        <div class="team-card">
          <div class="team-image">
            <img src="images/team-3.jpg" alt="Michael Lee, CTO" class="img-fluid">
            <div class="team-social">
              <a href="#"><i class="fab fa-linkedin-in"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fas fa-envelope"></i></a>
            </div>
          </div>
          <div class="team-info">
            <h3>Michael Lee</h3>
            <p class="team-title">Chief Technology Officer</p>
            <p class="team-desc">Michael leads our technology initiatives, implementing innovative solutions for our clients.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-3">
        <div class="team-card">
          <div class="team-image">
            <img src="images/team-4.jpg" alt="Emily Davis, Marketing Director" class="img-fluid">
            <div class="team-social">
              <a href="#"><i class="fab fa-linkedin-in"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fas fa-envelope"></i></a>
            </div>
          </div>
          <div class="team-info">
            <h3>Emily Davis</h3>
            <p class="team-title">Marketing Director</p>
            <p class="team-desc">Emily manages our marketing strategies, helping us connect with clients and build our brand.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#our-team {
  padding: 100px 0;
  background-color: white;
}

.team-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.team-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.team-image {
  position: relative;
  overflow: hidden;
}

.team-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.team-card:hover .team-image img {
  transform: scale(1.1);
}

.team-social {
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 15px 0;
  background-color: rgba(var(--primary-color-rgb), 0.9);
  transition: bottom 0.3s ease;
}

.team-card:hover .team-social {
  bottom: 0;
}

.team-social a {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: var(--primary-color);
  border-radius: 50%;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.team-social a:hover {
  transform: translateY(-5px);
  background-color: var(--secondary-color);
  color: white;
}

.team-info {
  padding: 30px 20px;
  text-align: center;
}

.team-info h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.team-title {
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

.team-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.7;
}`
    },

    // Stats/Achievements Section
    stats: {
        html: `<section id="achievements" class="py-5 bg-primary text-white">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <h2>Our Achievements</h2>
        <p class="lead">Milestones that showcase our commitment to excellence</p>
      </div>
    </div>
    
    <div class="row">
      <div class="col-6 col-md-3 mb-4">
        <div class="stat-card text-center">
          <div class="stat-value counter" data-count="2000">0</div>
          <div class="stat-label">Happy Clients</div>
        </div>
      </div>
      <div class="col-6 col-md-3 mb-4">
        <div class="stat-card text-center">
          <div class="stat-value counter" data-count="500">0</div>
          <div class="stat-label">Projects Completed</div>
        </div>
      </div>
      <div class="col-6 col-md-3 mb-4">
        <div class="stat-card text-center">
          <div class="stat-value counter" data-count="25">0</div>
          <div class="stat-label">Team Members</div>
        </div>
      </div>
      <div class="col-6 col-md-3 mb-4">
        <div class="stat-card text-center">
          <div class="stat-value counter" data-count="15">0</div>
          <div class="stat-label">Years of Experience</div>
        </div>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-lg-10 mx-auto">
        <div class="awards-slider">
          <div class="row align-items-center">
            <div class="col-md-4 text-center">
              <img src="images/award-1.png" alt="Excellence Award 2022" class="img-fluid award-image">
              <p>Excellence Award 2022</p>
            </div>
            <div class="col-md-4 text-center">
              <img src="images/award-2.png" alt="Best in Industry 2021" class="img-fluid award-image">
              <p>Best in Industry 2021</p>
            </div>
            <div class="col-md-4 text-center">
              <img src="images/award-3.png" alt="Innovation Award 2020" class="img-fluid award-image">
              <p>Innovation Award 2020</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#achievements {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
  position: relative;
}

#achievements h2 {
  font-weight: 700;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 1.5rem;
}

#achievements h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: white;
}

.stat-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 30px 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-10px);
}

.stat-value {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

.award-image {
  height: 100px;
  margin-bottom: 15px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.awards-slider .col-md-4:hover .award-image {
  transform: scale(1.1);
  opacity: 1;
}`
    },

    // Call to Action
    cta: {
        html: `<section id="about-cta" class="py-5">
  <div class="container">
    <div class="cta-box">
      <div class="row align-items-center">
        <div class="col-lg-8 mb-4 mb-lg-0">
          <h2>Ready to Work With Us?</h2>
          <p class="lead mb-0">Discover how our team can help you achieve your goals. Let's start a conversation today.</p>
        </div>
        <div class="col-lg-4 text-lg-end">
          <a href="contact.html" class="btn btn-primary btn-lg">Contact Us</a>
          <p class="mt-2">or call us at <strong>(555) 123-4567</strong></p>
        </div>
      </div>
    </div>
  </div>
</section>`,
        css: `#about-cta {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.cta-box {
  background-color: white;
  padding: 60px 40px;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

#about-cta h2 {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 1rem;
}

#about-cta .lead {
  color: #555;
}

#about-cta .btn {
  padding: 12px 30px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

#about-cta .btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

#about-cta strong {
  color: var(--primary-color);
  font-size: 1.1rem;
}`
    }
};

const servicesPageExamples = {
  // Services Header
  header: {
    html: `<section id="services-header" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 text-center">
        <h1 class="display-4 fw-bold">Our Services</h1>
        <p class="lead">Comprehensive solutions tailored to your needs</p>
        <div class="services-breadcrumb">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb justify-content-center">
              <li class="breadcrumb-item"><a href="index.html">Home</a></li>
              <li class="breadcrumb-item active" aria-current="page">Services</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#services-header {
  padding: 80px 0;
  background-color: #f8f9fa;
  position: relative;
}

#services-header h1 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

#services-header .lead {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.services-breadcrumb {
  margin-top: 2rem;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
}

.breadcrumb-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumb-item.active {
  color: #666;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: #ccc;
}`
  },

  // Services Overview
  overview: {
    html: `<section id="services-overview" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>What We Offer</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Comprehensive solutions designed to help your business succeed</p>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <div class="service-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>Business Consulting</h3>
          <p>Strategic guidance to help your business grow and overcome challenges in today's competitive market.</p>
          <a href="#business-consulting" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <div class="service-icon">
            <i class="fas fa-laptop-code"></i>
          </div>
          <h3>Digital Marketing</h3>
          <p>Comprehensive digital marketing strategies that increase your online presence and drive customer engagement.</p>
          <a href="#digital-marketing" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="service-card">
          <div class="service-icon">
            <i class="fas fa-paint-brush"></i>
          </div>
          <h3>Brand Development</h3>
          <p>Create a compelling brand identity that resonates with your target audience and sets you apart from competitors.</p>
          <a href="#brand-development" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#services-overview {
  padding: 100px 0;
  background-color: white;
}

.section-heading {
  margin-bottom: 3rem;
}

.section-heading h2 {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 1rem;
}

.heading-line {
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.service-card {
  background-color: white;
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 3px solid transparent;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  border-bottom: 3px solid var(--primary-color);
}

.service-icon {
  width: 70px;
  height: 70px;
  line-height: 70px;
  text-align: center;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  font-size: 1.75rem;
  border-radius: 50%;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.service-card:hover .service-icon {
  background-color: var(--primary-color);
  color: white;
  transform: rotateY(180deg);
}

.service-card h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 15px;
}

.service-card p {
  color: #666;
  margin-bottom: 25px;
  flex-grow: 1;
}

.service-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.service-link i {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.service-link:hover i {
  transform: translateX(5px);
}`
  },

  // Detailed Service Section
  serviceDetail: {
    html: `<section id="business-consulting" class="py-5 bg-light">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <img src="images/business-consulting.jpg" alt="Business Consulting Services" class="img-fluid rounded shadow-lg">
      </div>
      <div class="col-lg-6">
        <div class="service-detail">
          <div class="service-badge">Featured Service</div>
          <h2>Business Consulting</h2>
          <p class="lead">Strategic guidance to help your business grow and overcome challenges.</p>
          <p>Our business consulting services are designed to help organizations improve performance, enhance efficiency, and drive growth. We work with businesses of all sizes to identify opportunities, develop strategic plans, and implement solutions that deliver measurable results.</p>
          
          <div class="service-features mt-4">
            <div class="row">
              <div class="col-md-6">
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Strategic Planning</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Market Analysis</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Risk Assessment</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Process Optimization</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Growth Strategies</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Performance Metrics</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="service-cta mt-4">
            <a href="contact.html" class="btn btn-primary">Get a Consultation</a>
            <a href="#" class="btn btn-outline-primary ms-2">Download Brochure</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#business-consulting {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.service-detail {
  padding-left: 30px;
}

.service-badge {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.service-detail h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.service-detail .lead {
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.service-detail p {
  color: #555;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.feature-item i {
  color: var(--primary-color);
  margin-right: 10px;
  font-size: 1.2rem;
}

.feature-item span {
  color: #444;
  font-weight: 500;
}

.service-cta .btn {
  padding: 10px 25px;
}

.service-cta .btn-outline-primary {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.service-cta .btn-outline-primary:hover {
  background-color: var(--primary-color);
  color: white;
}`
  },

  // Process Section
  process: {
    html: `<section id="our-process" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Our Process</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">How we approach each project to ensure success</p>
        </div>
      </div>
    </div>
    
    <div class="process-timeline">
      <div class="row">
        <div class="col-lg-10 mx-auto">
          <div class="process-step">
            <div class="process-number">1</div>
            <div class="process-content">
              <h3>Discovery & Analysis</h3>
              <p>We begin by understanding your business, goals, and challenges through in-depth research and analysis. This crucial first step allows us to develop strategies that are tailored to your specific needs.</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="process-number">2</div>
            <div class="process-content">
              <h3>Strategy Development</h3>
              <p>Based on our analysis, we develop a comprehensive strategy that outlines the approach, timeline, deliverables, and expected outcomes. This roadmap guides the entire project and ensures alignment with your objectives.</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="process-number">3</div>
            <div class="process-content">
              <h3>Implementation</h3>
              <p>Our expert team executes the strategy with precision and attention to detail. We utilize industry best practices and innovative approaches to deliver high-quality results that meet or exceed expectations.</p>
            </div>
          </div>
          
          <div class="process-step">
            <div class="process-number">4</div>
            <div class="process-content">
              <h3>Evaluation & Refinement</h3>
              <p>We continuously monitor progress, gather feedback, and make necessary adjustments to optimize performance. This iterative approach ensures that we achieve the desired outcomes and maximize value.</p>
            </div>
          </div>
          
          <div class="process-step mb-0">
            <div class="process-number">5</div>
            <div class="process-content">
              <h3>Ongoing Support</h3>
              <p>Our relationship doesn't end with project completion. We provide ongoing support, regular check-ins, and strategic guidance to help you maintain momentum and adapt to changing business conditions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#our-process {
  padding: 100px 0;
  background-color: white;
  position: relative;
}

.process-timeline {
  position: relative;
  padding-top: 30px;
}

.process-timeline:before {
  content: '';
  position: absolute;
  top: 0;
  left: 40px;
  height: 100%;
  width: 3px;
  background-color: var(--primary-color);
}

.process-step {
  position: relative;
  padding-left: 100px;
  margin-bottom: 60px;
}

.process-number {
  position: absolute;
  left: 0;
  top: 0;
  width: 80px;
  height: 80px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  z-index: 1;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.process-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.process-step:hover .process-content {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.process-content h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.process-content p {
  color: #666;
  margin-bottom: 0;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .process-timeline:before {
    left: 30px;
  }
  
  .process-step {
    padding-left: 80px;
  }
  
  .process-number {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
}`
  },

  // Pricing Section
  pricing: {
    html: `<section id="pricing" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Our Pricing</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Transparent pricing options designed to fit your needs</p>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-4">
        <div class="pricing-card">
          <div class="pricing-header">
            <h3>Basic</h3>
            <div class="pricing-price">
              <span class="currency">$</span>
              <span class="amount">499</span>
              <span class="period">/month</span>
            </div>
            <p>Perfect for small businesses just getting started</p>
          </div>
          
          <div class="pricing-features">
            <ul>
              <li><i class="fas fa-check"></i> Business Strategy Analysis</li>
              <li><i class="fas fa-check"></i> Monthly Performance Report</li>
              <li><i class="fas fa-check"></i> 5 Hours Consulting</li>
              <li><i class="fas fa-check"></i> Email Support</li>
              <li class="disabled"><i class="fas fa-times"></i> Market Research</li>
              <li class="disabled"><i class="fas fa-times"></i> Competitor Analysis</li>
              <li class="disabled"><i class="fas fa-times"></i> 24/7 Phone Support</li>
            </ul>
          </div>
          
          <div class="pricing-footer">
            <a href="contact.html" class="btn btn-outline-primary btn-block">Get Started</a>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="pricing-card featured">
          <div class="pricing-badge">Most Popular</div>
          <div class="pricing-header">
            <h3>Professional</h3>
            <div class="pricing-price">
              <span class="currency">$</span>
              <span class="amount">999</span>
              <span class="period">/month</span>
            </div>
            <p>Ideal for growing businesses with specific goals</p>
          </div>
          
          <div class="pricing-features">
            <ul>
              <li><i class="fas fa-check"></i> Business Strategy Analysis</li>
              <li><i class="fas fa-check"></i> Weekly Performance Reports</li>
              <li><i class="fas fa-check"></i> 15 Hours Consulting</li>
              <li><i class="fas fa-check"></i> Email & Phone Support</li>
              <li><i class="fas fa-check"></i> Market Research</li>
              <li><i class="fas fa-check"></i> Competitor Analysis</li>
              <li class="disabled"><i class="fas fa-times"></i> 24/7 Phone Support</li>
            </ul>
          </div>
          
          <div class="pricing-footer">
            <a href="contact.html" class="btn btn-primary btn-block">Get Started</a>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="pricing-card">
          <div class="pricing-header">
            <h3>Enterprise</h3>
            <div class="pricing-price">
              <span class="currency">$</span>
              <span class="amount">1999</span>
              <span class="period">/month</span>
            </div>
            <p>Advanced solutions for established organizations</p>
          </div>
          
          <div class="pricing-features">
            <ul>
              <li><i class="fas fa-check"></i> Business Strategy Analysis</li>
              <li><i class="fas fa-check"></i> Daily Performance Reports</li>
              <li><i class="fas fa-check"></i> Unlimited Consulting</li>
              <li><i class="fas fa-check"></i> Priority Support</li>
              <li><i class="fas fa-check"></i> Comprehensive Market Research</li>
              <li><i class="fas fa-check"></i> In-depth Competitor Analysis</li>
              <li><i class="fas fa-check"></i> 24/7 Phone Support</li>
            </ul>
          </div>
          
          <div class="pricing-footer">
            <a href="contact.html" class="btn btn-outline-primary btn-block">Get Started</a>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-lg-8 mx-auto text-center">
        <p class="pricing-note">All plans include a 14-day free trial. No credit card required. Need a custom solution? <a href="contact.html">Contact us</a> for a tailored proposal.</p>
      </div>
    </div>
  </div>
</section>`,
    css: `#pricing {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.pricing-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.pricing-card.featured {
  border: 2px solid var(--primary-color);
  transform: scale(1.05);
  z-index: 1;
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-10px);
}

.pricing-badge {
  position: absolute;
  top: 20px;
  right: 0;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 5px 15px;
  border-radius: 20px 0 0 20px;
}

.pricing-header {
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.pricing-header h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.pricing-price {
  margin-bottom: 15px;
}

.pricing-price .currency {
  font-size: 1.5rem;
  font-weight: 700;
  vertical-align: top;
  margin-right: 5px;
  position: relative;
  top: 10px;
}

.pricing-price .amount {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.pricing-price .period {
  font-size: 1rem;
  color: #777;
}

.pricing-header p {
  color: #666;
  margin-bottom: 0;
}

.pricing-features {
  padding: 30px;
  flex-grow: 1;
}

.pricing-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pricing-features li {
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  display: flex;
  align-items: center;
}

.pricing-features li:last-child {
  border-bottom: none;
}

.pricing-features i {
  margin-right: 10px;
  font-size: 0.9rem;
}

.pricing-features .fa-check {
  color: #28a745;
}

.pricing-features .fa-times {
  color: #dc3545;
}

.pricing-features li.disabled {
  color: #aaa;
  text-decoration: line-through;
}

.pricing-footer {
  padding: 30px;
  border-top: 1px solid #eee;
}

.btn-block {
  display: block;
  width: 100%;
}

.pricing-note {
  margin-top: 30px;
  color: #777;
  font-size: 0.9rem;
}

.pricing-note a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.pricing-note a:hover {
  text-decoration: underline;
}`
  },

  // FAQ Section
  faq: {
    html: `<section id="faq" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Frequently Asked Questions</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Answers to common questions about our services</p>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-lg-10 mx-auto">
        <div class="accordion" id="faqAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                What industries do you specialize in?
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                We work with clients across a wide range of industries, including technology, healthcare, finance, retail, manufacturing, and professional services. Our team has specialized expertise in each sector, allowing us to provide tailored solutions that address industry-specific challenges and opportunities.
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                How long does a typical project take to complete?
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Project timelines vary depending on scope, complexity, and specific requirements. A small consulting project might take 2-4 weeks, while a comprehensive digital transformation initiative could span several months. During our initial consultation, we'll provide a detailed timeline based on your unique situation and goals.
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Do you offer custom solutions or only pre-packaged services?
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                We offer both standardized packages and fully customized solutions. Our structured service packages provide cost-effective options for common business needs, while our custom solutions are tailored to address complex or unique challenges. We'll work with you to determine the most appropriate approach based on your specific requirements and budget.
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFour">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                How do you measure the success of your services?
              </button>
            </h2>
            <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                We establish clear, measurable KPIs at the beginning of each project, aligned with your business objectives. These may include financial metrics, operational improvements, customer acquisition, retention rates, or other relevant indicators. We provide regular reports tracking progress against these KPIs and make adjustments as needed to ensure optimal results.
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFive">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                What is your client communication process?
              </button>
            </h2>
            <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Communication is a priority in our client relationships. We establish a tailored communication plan at project kickoff, typically including weekly progress updates, scheduled check-in calls, and a dedicated account manager for ongoing support. We use collaborative tools like project management platforms and shared workspaces to maintain transparency and facilitate real-time updates.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-lg-8 mx-auto text-center">
        <p class="faq-note">Can't find the answer you're looking for? <a href="contact.html">Contact our team</a> for assistance.</p>
      </div>
    </div>
  </div>
</section>`,
    css: `#faq {
  padding: 100px 0;
  background-color: white;
}

.accordion-item {
  border: none;
  margin-bottom: 15px;
  border-radius: 10px !important;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.accordion-button {
  font-weight: 600;
  padding: 20px 30px;
  background-color: white;
  color: #333;
  box-shadow: none;
}

.accordion-button:not(.collapsed) {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: transparent;
}

.accordion-button::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23333'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

.accordion-button:not(.collapsed)::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%230d6efd'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

.accordion-body {
  padding: 20px 30px 30px;
  color: #666;
  line-height: 1.7;
}

.faq-note {
  color: #777;
  font-size: 1.1rem;
  margin-top: 40px;
}

.faq-note a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.faq-note a:hover {
  text-decoration: underline;
}`
  },

  // CTA Section
  cta: {
    html: `<section id="services-cta" class="py-5 bg-primary text-white">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-10 text-center">
        <h2 class="display-5 fw-bold">Ready to Elevate Your Business?</h2>
        <p class="lead mb-5">Let's work together to achieve your goals and drive meaningful results for your business.</p>
        <div class="cta-buttons">
          <a href="contact.html" class="btn btn-light btn-lg">Schedule a Consultation</a>
          <a href="tel:5551234567" class="btn btn-outline-light btn-lg ms-md-3 mt-3 mt-md-0">Call Us: (555) 123-4567</a>
        </div>
      </div>
    </div>
  </div>
  <div class="cta-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>
</section>`,
    css: `#services-cta {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
  position: relative;
  overflow: hidden;
}

#services-cta h2 {
  margin-bottom: 1.5rem;
}

#services-cta .lead {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto 2rem;
}

.cta-buttons .btn {
  padding: 15px 30px;
  font-weight: 600;
  border-radius: 50px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-buttons .btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.cta-buttons .btn-light {
  color: var(--primary-color);
}

.cta-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.shape-1 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: -100px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: 10%;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 10%;
  right: 5%;
}

@media (max-width: 768px) {
  .cta-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .cta-buttons .btn {
    margin: 0 !important;
  }
}`
  }
};

const contactPageExamples = {
  // Contact Header
  header: {
    html: `<section id="contact-header" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8 text-center">
        <h1 class="display-4 fw-bold">Contact Us</h1>
        <p class="lead">We're here to answer your questions and help your business grow</p>
        <div class="contact-breadcrumb">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb justify-content-center">
              <li class="breadcrumb-item"><a href="index.html">Home</a></li>
              <li class="breadcrumb-item active" aria-current="page">Contact</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#contact-header {
  padding: 80px 0;
  background-color: #f8f9fa;
  position: relative;
}

#contact-header h1 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

#contact-header .lead {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.contact-breadcrumb {
  margin-top: 2rem;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
}

.breadcrumb-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumb-item.active {
  color: #666;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: #ccc;
}`
  },

  // Contact Form
  form: {
    html: `<section id="contact-form" class="py-5">
  <div class="container">
    <div class="row">
      <div class="col-lg-6 mb-5 mb-lg-0">
        <div class="contact-form-container">
          <div class="section-heading mb-4">
            <h2>Send Us a Message</h2>
            <div class="heading-line"></div>
            <p>Fill out the form below, and we'll get back to you as soon as possible.</p>
          </div>
          
          <form id="contactForm" class="needs-validation" novalidate>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input type="text" class="form-control" id="name" placeholder="Your Name" required>
                  <label for="name">Your Name</label>
                  <div class="invalid-feedback">
                    Please enter your name.
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input type="email" class="form-control" id="email" placeholder="Email Address" required>
                  <label for="email">Email Address</label>
                  <div class="invalid-feedback">
                    Please enter a valid email address.
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input type="tel" class="form-control" id="phone" placeholder="Phone Number">
                  <label for="phone">Phone Number (optional)</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <select class="form-select" id="subject" required>
                    <option value="" selected disabled>Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Service Information">Service Information</option>
                    <option value="Price Quote">Price Quote</option>
                    <option value="Support">Technical Support</option>
                    <option value="Other">Other</option>
                  </select>
                  <label for="subject">Subject</label>
                  <div class="invalid-feedback">
                    Please select a subject.
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-floating mb-3">
              <textarea class="form-control" id="message" placeholder="Your Message" style="height: 150px" required></textarea>
              <label for="message">Your Message</label>
              <div class="invalid-feedback">
                Please enter your message.
              </div>
            </div>
            
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="privacyCheck" required>
              <label class="form-check-label" for="privacyCheck">
                I agree to the <a href="#">Privacy Policy</a> and consent to being contacted regarding my inquiry.
              </label>
              <div class="invalid-feedback">
                You must agree before submitting.
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
            
            <div class="mt-4 form-response d-none">
              <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i> Thank you! Your message has been sent successfully.
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div class="col-lg-6">
        <div class="contact-info-container">
          <div class="section-heading mb-4">
            <h2>Contact Information</h2>
            <div class="heading-line"></div>
            <p>You can reach us through any of the following methods.</p>
          </div>
          
          <div class="contact-info-boxes">
            <div class="contact-info-box">
              <div class="contact-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="contact-details">
                <h3>Visit Us</h3>
                <p>123 Business Avenue, Suite 500<br>New York, NY 10001</p>
                <a href="https://goo.gl/maps/your-location" target="_blank" class="contact-link">Get Directions <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
            
            <div class="contact-info-box">
              <div class="contact-icon">
                <i class="fas fa-phone-alt"></i>
              </div>
              <div class="contact-details">
                <h3>Call Us</h3>
                <p>Main: (555) 123-4567<br>Support: (555) 987-6543</p>
                <a href="tel:5551234567" class="contact-link">Call Now <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
            
            <div class="contact-info-box">
              <div class="contact-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="contact-details">
                <h3>Email Us</h3>
                <p>info@yourcompany.com<br>support@yourcompany.com</p>
                <a href="mailto:info@yourcompany.com" class="contact-link">Send Email <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
            
            <div class="contact-info-box">
              <div class="contact-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="contact-details">
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 2:00 PM<br>Sunday: Closed</p>
              </div>
            </div>
          </div>
          
          <div class="social-connections mt-4">
            <h3>Connect With Us</h3>
            <div class="social-icons">
              <a href="#" class="social-icon" title="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-icon" title="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-icon" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              <a href="#" class="social-icon" title="Instagram"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#contact-form {
  padding: 100px 0;
  background-color: white;
}

.section-heading h2 {
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 1rem;
}

.heading-line {
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.section-heading p {
  color: #666;
  margin-bottom: 2rem;
}

.contact-form-container {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.form-floating > .form-control,
.form-floating > .form-select {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}

.form-floating > .form-control:focus ~ label,
.form-floating > .form-control:not(:placeholder-shown) ~ label,
.form-floating > .form-select ~ label {
  opacity: .65;
  transform: scale(.85) translateY(-.5rem) translateX(.15rem);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.25rem rgba(var(--primary-color-rgb), 0.25);
}

.btn-primary {
  padding: 0.8rem 2rem;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.contact-info-container {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.contact-info-boxes {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-info-box {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.contact-info-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.contact-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 20px;
}

.contact-details h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
}

.contact-details p {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.6;
}

.contact-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.contact-link i {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.contact-link:hover i {
  transform: translateX(5px);
}

.social-connections h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 45px;
  height: 45px;
  background-color: #f8f9fa;
  color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-5px);
}

@media (max-width: 991px) {
  .contact-info-container {
    margin-top: 50px;
  }
}`
  },

  // Map Section
  map: {
    html: `<section id="map-section" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Find Us</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Visit our office for a meeting with our team</p>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-12">
        <div class="map-container">
          <div class="embed-responsive embed-responsive-16by9">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215151652784!2d-73.9878531846984!3d40.75839897932692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620160598715!5m2!1sen!2sus" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
          </div>
          
          <div class="map-overlay">
            <div class="map-card">
              <h3>Our Location</h3>
              <p><i class="fas fa-map-marker-alt"></i> 123 Business Avenue, Suite 500<br>New York, NY 10001</p>
              <p><i class="fas fa-subway"></i> Nearest Subway: 34th St - Herald Square</p>
              <p><i class="fas fa-parking"></i> Parking: Available nearby</p>
              <a href="https://goo.gl/maps/your-location" target="_blank" class="btn btn-primary">Get Directions</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#map-section {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.map-container {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.embed-responsive {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
}

.embed-responsive:before {
  display: block;
  content: "";
  padding-top: 450px;
}

.embed-responsive iframe {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.map-overlay {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 1;
}

.map-card {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-width: 320px;
}

.map-card h3 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.map-card p {
  color: #666;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.map-card i {
  color: var(--primary-color);
  margin-right: 10px;
  min-width: 20px;
}

.map-card .btn {
  margin-top: 10px;
}

@media (max-width: 768px) {
  .map-overlay {
    position: static;
    margin-top: 20px;
  }
  
  .map-card {
    max-width: 100%;
  }
}`
  },

  // Office Tour Section
  officeTour: {
    html: `<section id="office-tour" class="py-5">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Our Office</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Take a virtual tour of our modern workspace</p>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="office-image-card">
          <img src="images/office-1.jpg" alt="Office Reception" class="img-fluid">
          <div class="office-caption">
            <h3>Reception Area</h3>
            <p>Our welcoming front desk where visitors are greeted</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="office-image-card">
          <img src="images/office-2.jpg" alt="Meeting Room" class="img-fluid">
          <div class="office-caption">
            <h3>Conference Room</h3>
            <p>Fully equipped meeting space for client consultations</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="office-image-card">
          <img src="images/office-3.jpg" alt="Work Area" class="img-fluid">
          <div class="office-caption">
            <h3>Collaborative Space</h3>
            <p>Where our team works together on client projects</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-12 text-center">
        <a href="#" class="btn btn-outline-primary">Schedule an Office Visit <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </div>
</section>`,
    css: `#office-tour {
  padding: 100px 0;
  background-color: white;
}

.office-image-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.office-image-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.office-image-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.office-image-card:hover img {
  transform: scale(1.1);
}

.office-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  color: white;
}

.office-caption h3 {
  font-size: 1.3rem;
  margin-bottom: 5px;
}

.office-caption p {
  margin-bottom: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.btn-outline-primary {
  border-color: var(--primary-color);
  color: var(--primary-color);
  padding: 10px 25px;
  margin-top: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.btn-outline-primary i {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.btn-outline-primary:hover i {
  transform: translateX(5px);
}`
  },

  // Support Options Section
  supportOptions: {
    html: `<section id="support-options" class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center mb-5">
      <div class="col-lg-8 text-center">
        <div class="section-heading">
          <h2>Support Options</h2>
          <div class="heading-line mx-auto"></div>
          <p class="lead">Multiple ways to get assistance when you need it</p>
        </div>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-3">
        <div class="support-card">
          <div class="support-icon">
            <i class="fas fa-headset"></i>
          </div>
          <h3>Phone Support</h3>
          <p>Speak directly with our support team for immediate assistance.</p>
          <p class="support-availability">Available: Mon-Fri, 9AM-6PM</p>
          <a href="tel:5551234567" class="btn btn-primary btn-sm">Call Support</a>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="support-card">
          <div class="support-icon">
            <i class="fas fa-envelope-open-text"></i>
          </div>
          <h3>Email Support</h3>
          <p>Send us a detailed message and we'll respond within 24 hours.</p>
          <p class="support-availability">24/7 Ticket Submission</p>
          <a href="mailto:support@yourcompany.com" class="btn btn-primary btn-sm">Email Support</a>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="support-card">
          <div class="support-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h3>Live Chat</h3>
          <p>Chat with our support team in real-time for quick answers.</p>
          <p class="support-availability">Available: Mon-Fri, 9AM-9PM</p>
          <button class="btn btn-primary btn-sm" id="startChatBtn">Start Chat</button>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="support-card">
          <div class="support-icon">
            <i class="fas fa-book"></i>
          </div>
          <h3>Knowledge Base</h3>
          <p>Browse our help articles and tutorials for self-service support.</p>
          <p class="support-availability">Available 24/7</p>
          <a href="#" class="btn btn-primary btn-sm">Visit Knowledge Base</a>
        </div>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-lg-8 mx-auto">
        <div class="faq-preview-box">
          <h3>Frequently Asked Questions</h3>
          <div class="accordion" id="faqPreviewAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="previewHeadingOne">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#previewCollapseOne" aria-expanded="false" aria-controls="previewCollapseOne">
                  What are your business hours?
                </button>
              </h2>
              <div id="previewCollapseOne" class="accordion-collapse collapse" aria-labelledby="previewHeadingOne" data-bs-parent="#faqPreviewAccordion">
                <div class="accordion-body">
                  Our standard business hours are Monday through Friday from 9:00 AM to 6:00 PM Eastern Time. We also offer limited hours on Saturday from 10:00 AM to 2:00 PM. Our office is closed on Sundays and major holidays.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="previewHeadingTwo">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#previewCollapseTwo" aria-expanded="false" aria-controls="previewCollapseTwo">
                  How quickly can I expect a response?
                </button>
              </h2>
              <div id="previewCollapseTwo" class="accordion-collapse collapse" aria-labelledby="previewHeadingTwo" data-bs-parent="#faqPreviewAccordion">
                <div class="accordion-body">
                  For phone calls during business hours, you'll speak with a representative immediately. Email inquiries are typically responded to within 24 hours. Form submissions through our website receive an automatic confirmation, followed by a personalized response within 1-2 business days.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="previewHeadingThree">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#previewCollapseThree" aria-expanded="false" aria-controls="previewCollapseThree">
                  Can I schedule an in-person meeting?
                </button>
              </h2>
              <div id="previewCollapseThree" class="accordion-collapse collapse" aria-labelledby="previewHeadingThree" data-bs-parent="#faqPreviewAccordion">
                <div class="accordion-body">
                  Yes, we welcome in-person meetings at our office. To ensure that the appropriate team members are available, we recommend scheduling appointments at least 48 hours in advance. You can request an appointment through our contact form, by calling our office, or by emailing info@yourcompany.com.
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-4">
            <a href="faq.html" class="btn btn-outline-primary">View All FAQs</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#support-options {
  padding: 100px 0;
  background-color: #f8f9fa;
}

.support-card {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.support-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.support-icon {
  width: 70px;
  height: 70px;
  line-height: 70px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  font-size: 1.8rem;
  border-radius: 50%;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.support-card:hover .support-icon {
  background-color: var(--primary-color);
  color: white;
  transform: rotateY(180deg);
}

.support-card h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
}

.support-card p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 15px;
}

.support-availability {
  font-style: italic;
  color: #999;
  font-size: 0.85rem !important;
  margin-bottom: 20px;
}

.support-card .btn {
  margin-top: auto;
}

.faq-preview-box {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.faq-preview-box h3 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
}

.faq-preview-box h3:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background-color: var(--primary-color);
}

.accordion-item {
  border: none;
  margin-bottom: 10px;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
}

.accordion-button {
  font-weight: 600;
  padding: 15px 20px;
  background-color: white;
  color: #333;
}

.accordion-button:not(.collapsed) {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.accordion-button:focus {
  box-shadow: none;
  border-color: transparent;
}

.accordion-body {
  padding: 15px 20px 20px;
  color: #666;
}

.btn-outline-primary {
  margin-top: 20px;
}`
  },

  // CTA Section
  cta: {
    html: `<section id="contact-cta" class="py-5">
  <div class="container">
    <div class="row">
      <div class="col-lg-10 mx-auto">
        <div class="cta-card">
          <div class="row align-items-center">
            <div class="col-lg-8 mb-4 mb-lg-0">
              <h2>Need a Custom Solution?</h2>
              <p class="lead mb-0">Our team is ready to discuss your specific requirements and create a tailored approach for your business.</p>
            </div>
            <div class="col-lg-4 text-lg-end">
              <a href="#contact-form" class="btn btn-primary btn-lg">Request a Consultation</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
    css: `#contact-cta {
  padding: 80px 0;
  background-color: white;
}

.cta-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
  color: white;
  padding: 60px;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.cta-card:before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.cta-card:after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 150px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.cta-card h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-card .lead {
  opacity: 0.9;
}

.cta-card .btn {
  background-color: white;
  color: var(--primary-color);
  border: none;
  padding: 15px 30px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.cta-card .btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 991px) {
  .cta-card {
    padding: 40px 30px;
    text-align: center;
  }
  
  .cta-card .col-lg-4 {
    text-align: center !important;
  }
}`
  }
};
// Export all examples
module.exports = {
    homePageExamples,
    aboutPageExamples,
    servicesPageExamples,
    contactPageExamples,
    
};