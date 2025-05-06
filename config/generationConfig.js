/**
 * Configuration settings for the website generation pipeline
 */
module.exports = {
    // Ollama generation parameters
    generation: {
      // Default parameters for text generation
      defaultParams: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        stop: []
      },
      
      // Custom parameters for specific generation tasks
      jsonParams: {
        temperature: 0.2,  // Lower temperature for more consistent JSON outputs
        top_p: 0.8,
        max_tokens: 8192
      },
      
      // Timeouts in milliseconds
      timeouts: {
        default: 60000,     // 1 minute
        header: 60000,      // 1 minute
        page: 120000,       // 2 minutes
        complex: 180000     // 3 minutes
      },
      
      // Retry configuration
      retry: {
        attempts: 3,
        initialDelay: 1000,
        maxDelay: 10000
      }
    },
    
    // Website component templates
    templates: {
      // Default structure for different page types
      pageStructures: {
        home: [
          { name: 'hero', title: 'Hero Section' },
          { name: 'intro', title: 'Introduction Section' },
          { name: 'features', title: 'Features Section' },
          { name: 'testimonials', title: 'Testimonials Section' },
          { name: 'cta', title: 'Call to Action Section' }
        ],
        about: [
          { name: 'story', title: 'Our Story Section' },
          { name: 'team', title: 'Team Section' },
          { name: 'values', title: 'Our Values Section' },
          { name: 'cta', title: 'Call to Action Section' }
        ],
        services: [
          { name: 'overview', title: 'Services Overview Section' },
          { name: 'details', title: 'Service Details Section' },
          { name: 'process', title: 'Process Section' },
          { name: 'pricing', title: 'Pricing Section' },
          { name: 'cta', title: 'Call to Action Section' }
        ],
        contact: [
          { name: 'form', title: 'Contact Form Section' },
          { name: 'info', title: 'Contact Information Section' },
          { name: 'map', title: 'Map Section' }
        ],
        blog: [
          { name: 'header', title: 'Blog Header Section' },
          { name: 'featured', title: 'Featured Posts Section' },
          { name: 'recent', title: 'Recent Posts Section' }
        ],
        default: [
          { name: 'header', title: 'Page Header Section' },
          { name: 'content', title: 'Main Content Section' },
          { name: 'cta', title: 'Call to Action Section' }
        ]
      },
      
      // HTML templates for special components
      fallbackHTML: {
        header: `<header class="navbar navbar-expand-lg navbar-dark bg-primary">
          <div class="container">
            <a class="navbar-brand" href="/">{{businessName}}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link active" href="/">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="/about">About</a></li>
                <li class="nav-item"><a class="nav-link" href="/services">Services</a></li>
                <li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
        </header>`,
        
        footer: `<footer class="bg-dark text-white py-4 mt-5">
          <div class="container">
            <div class="row">
              <div class="col-md-6">
                <h5>{{businessName}}</h5>
                <p class="small">{{businessDescription}}</p>
              </div>
              <div class="col-md-6">
                <h5>Contact</h5>
                <p class="small">{{address}}<br>{{email}}<br>{{phone}}</p>
                <div class="social-links">
                  <a href="#" class="text-white me-2"><i class="fab fa-facebook"></i></a>
                  <a href="#" class="text-white me-2"><i class="fab fa-twitter"></i></a>
                  <a href="#" class="text-white me-2"><i class="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-12 text-center">
                <p class="small mb-0">&copy; ${new Date().getFullYear()} {{businessName}}. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>`
      }
    }
  };