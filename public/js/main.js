// Global app functionality

// Form validation
const validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    let isValid = true;
    const requiredInputs = form.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });
    
    return isValid;
  };
  
  // Password match validation
  if (document.getElementById('password2')) {
    document.getElementById('password2').addEventListener('input', function() {
      const password = document.getElementById('password').value;
      if (this.value !== password) {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
    });
  }
  
  // Color picker preview
  document.querySelectorAll('input[type="color"]').forEach(colorInput => {
    colorInput.addEventListener('input', function() {
      const previewId = this.dataset.preview;
      if (previewId) {
        document.getElementById(previewId).style.backgroundColor = this.value;
      }
    });
  });