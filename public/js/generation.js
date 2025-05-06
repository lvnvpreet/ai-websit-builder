/**
 * Generation page functionality
 */
class GenerationManager {
    constructor(websiteId) {
      this.websiteId = websiteId;
      this.progressBar = document.getElementById('progressBar');
      this.progressPercent = document.getElementById('progressPercent');
      this.statusText = document.getElementById('statusText');
      this.generationSteps = document.getElementById('generationSteps');
      this.errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
      this.intervalId = null;
      
      this.init();
    }
    
    init() {
      // Start generation automatically
      this.startGeneration();
      
      // Start polling for status updates
      this.intervalId = setInterval(() => this.checkStatus(), 2000);
      
      // Set up retry button
      document.getElementById('retryButton').addEventListener('click', () => {
        this.errorModal.hide();
        this.startGeneration();
      });
    }
    
    async startGeneration() {
      try {
        const response = await fetch(`/generate/${this.websiteId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!data.success) {
          this.showError(data.message);
        }
      } catch (error) {
        console.error('Error starting generation:', error);
        this.showError('Failed to start generation process');
      }
    }
    
    async checkStatus() {
      try {
        const response = await fetch(`/generate/${this.websiteId}/status`);
        const data = await response.json();
        
        if (data.success) {
          this.updateProgress(data.progress, data.message, data.status);
          
          // If generation is complete or failed, stop polling
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(this.intervalId);
            
            if (data.status === 'completed') {
              // Redirect to completion page
              setTimeout(() => {
                window.location.href = `/generate/${this.websiteId}/complete`;
              }, 1000);
            } else if (data.status === 'failed') {
              this.showError('Website generation failed');
            }
          }
        } else {
          this.showError(data.message);
          clearInterval(this.intervalId);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }
    
    updateProgress(progress, message, status) {
      // Update progress bar
      this.progressBar.style.width = `${progress}%`;
      this.progressBar.setAttribute('aria-valuenow', progress);
      this.progressPercent.textContent = `${Math.round(progress)}%`;
      
      // Update status text
      this.statusText.textContent = message;
      
      // Update steps
      let currentStep = 0;
      
      if (progress < 5) {
        currentStep = 0;
      } else if (progress < 20) {
        currentStep = 1;
      } else if (progress < 35) {
        currentStep = 2;
      } else if (progress < 50) {
        currentStep = 3;
      } else if (progress < 65) {
        currentStep = 4;
      } else if (progress < 80) {
        currentStep = 5;
      } else {
        currentStep = 6;
      }
      
      // Update step classes
      const steps = document.querySelectorAll('.step');
      steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index < currentStep) {
          step.classList.add('completed');
          const icon = step.querySelector('i');
          icon.classList.remove('fa-spinner', 'fa-spin');
          icon.classList.add('fa-check');
        } else if (index === currentStep) {
          step.classList.add('active');
          const icon = step.querySelector('i');
          if (index < 6) {
            icon.classList.add('fa-spinner', 'fa-spin');
          }
        }
      });
      
      // Change progress bar color based on status
      if (status === 'failed') {
        this.progressBar.classList.remove('bg-primary', 'bg-success');
        this.progressBar.classList.add('bg-danger');
      } else if (progress === 100) {
        this.progressBar.classList.remove('bg-primary', 'bg-danger');
        this.progressBar.classList.add('bg-success');
      }
    }
    
    showError(message) {
      const errorDetails = document.getElementById('errorDetails');
      errorDetails.textContent = message;
      this.errorModal.show();
    }
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    const websiteId = document.getElementById('websiteId').value;
    if (websiteId) {
      new GenerationManager(websiteId);
    }
  });