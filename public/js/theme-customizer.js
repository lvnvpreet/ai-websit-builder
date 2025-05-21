// Theme customizer real-time preview functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get form and preview iframe elements
  const themeForm = document.getElementById('themeCustomizerForm');
  const previewFrame = document.getElementById('previewFrame');
  const saveThemeBtn = document.getElementById('saveThemeBtn');
  const applyThemeBtn = document.getElementById('applyThemeBtn');
  
  // Get all color input elements
  const colorInputs = document.querySelectorAll('input[type="color"]');
  const colorTextInputs = document.querySelectorAll('.color-hex-input');
  
  // Get all font selection elements
  const fontSelects = document.querySelectorAll('select[name*="font"]');
  
  // Get all spacing and layout inputs
  const layoutInputs = document.querySelectorAll('input[name*="spacing"], input[name*="radius"], select[name*="layout"]');
  
  // Theme templates selection
  const templateButtons = document.querySelectorAll('.template-card');
  
  // Timer for debouncing preview updates
  let previewUpdateTimer;
  
  // Function to apply CSS changes to the preview iframe
  function updatePreview() {
    if (!previewFrame.contentDocument) return;
    
    // Get all current values from the form
    const formData = new FormData(themeForm);
    const themeData = {};
    
    // Convert form data to object
    for (const [key, value] of formData.entries()) {
      themeData[key] = value;
    }
    
    // Create or update the style element in the iframe
    let styleEl = previewFrame.contentDocument.getElementById('dynamic-theme-styles');
    
    if (!styleEl) {
      styleEl = previewFrame.contentDocument.createElement('style');
      styleEl.id = 'dynamic-theme-styles';
      previewFrame.contentDocument.head.appendChild(styleEl);
    }
    
    // Build CSS rules based on theme values
    let css = `
      :root {
        --primary-color: ${themeData.primary || '#007bff'};
        --secondary-color: ${themeData.secondary || '#6c757d'};
        --accent-color: ${themeData.accent || '#e74c3c'};
        --text-color: ${themeData.textColor || '#333333'};
        --background-color: ${themeData.backgroundColor || '#ffffff'};
        --heading-font: ${themeData.headingFont || 'inherit'};
        --body-font: ${themeData.bodyFont || 'inherit'};
        --section-spacing: ${themeData.sectionSpacing || '2rem'};
        --element-spacing: ${themeData.elementSpacing || '1rem'};
        --border-radius: ${themeData.borderRadius || '0.25rem'};
      }
      
      /* Primary color elements */
      .btn-primary, .bg-primary, .nav-pills .nav-link.active, .badge-primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
      }
      
      a, .text-primary {
        color: var(--primary-color) !important;
      }
      
      /* Secondary color elements */
      .btn-secondary, .bg-secondary, .badge-secondary {
        background-color: var(--secondary-color) !important;
        border-color: var(--secondary-color) !important;
      }
      
      /* Accent color elements */
      .btn-accent, .bg-accent, .badge-accent {
        background-color: var(--accent-color) !important;
        border-color: var(--accent-color) !important;
      }
      
      /* Text color */
      body, p, .text-body {
        color: var(--text-color) !important;
      }
      
      /* Background color */
      body, .bg-light {
        background-color: var(--background-color) !important;
      }
      
      /* Typography */
      h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
        font-family: var(--heading-font) !important;
      }
      
      body, p, div, span, a, button, input, select, textarea {
        font-family: var(--body-font) !important;
      }
      
      /* Spacing */
      section, .section {
        margin-bottom: var(--section-spacing) !important;
      }
      
      .card, .form-group, .form-control, .btn, .alert {
        border-radius: var(--border-radius) !important;
      }
      
      /* Additional customizations based on layout type */
      ${themeData.layoutType === 'compact' ? `
        .container {
          max-width: 960px !important;
        }
        section, .section {
          padding: 2rem 0 !important;
        }
      ` : ''}
      
      ${themeData.layoutType === 'spacious' ? `
        .container {
          max-width: 1200px !important;
        }
        section, .section {
          padding: 4rem 0 !important;
        }
      ` : ''}
    `;
    
    // Apply CSS to the style element
    styleEl.textContent = css;
  }
  
  // Function to debounce preview updates
  function debouncePreviewUpdate() {
    clearTimeout(previewUpdateTimer);
    previewUpdateTimer = setTimeout(updatePreview, 300);
  }
  
  // Add event listeners to all input elements
  const addInputListeners = (elements) => {
    elements.forEach(input => {
      input.addEventListener('input', debouncePreviewUpdate);
      input.addEventListener('change', debouncePreviewUpdate);
    });
  };
  
  // Initialize listeners
  addInputListeners(colorInputs);
  addInputListeners(colorTextInputs);
  addInputListeners(fontSelects);
  addInputListeners(layoutInputs);
  
  // Sync color inputs with their hex text inputs
  colorInputs.forEach(colorInput => {
    const hexInput = document.getElementById(`${colorInput.id}Hex`);
    if (hexInput) {
      colorInput.addEventListener('input', () => {
        hexInput.value = colorInput.value;
      });
      
      hexInput.addEventListener('input', () => {
        // Validate hex color
        if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
          colorInput.value = hexInput.value;
        }
      });
    }
  });
  
  // Handle template selection
  templateButtons.forEach(templateBtn => {
    templateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all templates
      templateButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to selected template
      templateBtn.classList.add('active');
      
      // Get template data
      const templateData = JSON.parse(templateBtn.getAttribute('data-template'));
      
      // Apply template values to inputs
      Object.keys(templateData).forEach(key => {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = templateData[key];
          
          // Also update any corresponding hex inputs
          if (input.type === 'color') {
            const hexInput = document.getElementById(`${input.id}Hex`);
            if (hexInput) {
              hexInput.value = templateData[key];
            }
          }
        }
      });
      
      // Update preview with the new theme
      updatePreview();
    });
  });
  
  // Wait for iframe to load before applying theme
  previewFrame.addEventListener('load', () => {
    updatePreview();
  });
  
  // Save theme
  saveThemeBtn.addEventListener('click', async () => {
    try {
      const formData = new FormData(themeForm);
      const themeData = {};
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        themeData[key] = value;
      }
      
      // Make API request to save theme
      const response = await fetch(`/theme-customization/${new URLSearchParams(window.location.search).get('id')}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(themeData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
          <strong>Success!</strong> Theme saved.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.card-body').prepend(alert);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          alert.remove();
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to save theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      
      // Show error message
      const alert = document.createElement('div');
      alert.className = 'alert alert-danger alert-dismissible fade show';
      alert.innerHTML = `
        <strong>Error!</strong> ${error.message || 'Failed to save theme. Please try again.'}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.querySelector('.card-body').prepend(alert);
    }
  });
  
  // Apply theme to website
  applyThemeBtn.addEventListener('click', async () => {
    try {
      const formData = new FormData(themeForm);
      const themeData = {};
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        themeData[key] = value;
      }
      
      // Make API request to apply theme
      const response = await fetch(`/theme-customization/${new URLSearchParams(window.location.search).get('id')}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(themeData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
          <strong>Success!</strong> Theme applied to website.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.card-body').prepend(alert);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          alert.remove();
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to apply theme');
      }
    } catch (error) {
      console.error('Error applying theme:', error);
      
      // Show error message
      const alert = document.createElement('div');
      alert.className = 'alert alert-danger alert-dismissible fade show';
      alert.innerHTML = `
        <strong>Error!</strong> ${error.message || 'Failed to apply theme. Please try again.'}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.querySelector('.card-body').prepend(alert);
    }
  });
});
