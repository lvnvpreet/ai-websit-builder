// A/B Testing Analytics
document.addEventListener('DOMContentLoaded', function() {
  const testVariantForm = document.getElementById('testVariantForm');
  const createVariantBtn = document.getElementById('createVariantBtn');
  const variantCards = document.querySelectorAll('.variant-card');
  const publishVariantBtn = document.getElementById('publishVariantBtn');
  const analyticsChartContainer = document.getElementById('analyticsChart');
  
  // Initialize chart if container exists
  let analyticsChart = null;
  if (analyticsChartContainer) {
    initAnalyticsChart();
  }
  
  // Create test variant
  if (createVariantBtn && testVariantForm) {
    createVariantBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(testVariantForm);
        const variantData = {};
        
        // Convert form data to object
        for (const [key, value] of formData.entries()) {
          variantData[key] = value;
        }
        
        // Make API request to create variant
        const websiteId = new URLSearchParams(window.location.search).get('id') || window.location.pathname.split('/').pop();
        const response = await fetch(`/ab-testing/${websiteId}/variants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variantData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Reload page to show new variant
          window.location.reload();
        } else {
          throw new Error(result.message || 'Failed to create variant');
        }
      } catch (error) {
        console.error('Error creating variant:', error);
        
        // Show error message
        showAlert('danger', `Error: ${error.message || 'Failed to create variant. Please try again.'}`);
      }
    });
  }
  
  // Handle variant selection
  if (variantCards) {
    variantCards.forEach(card => {
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        variantCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Enable publish button
        if (publishVariantBtn) {
          publishVariantBtn.disabled = false;
        }
      });
    });
  }
  
  // Publish selected variant
  if (publishVariantBtn) {
    publishVariantBtn.addEventListener('click', async () => {
      try {
        const selectedCard = document.querySelector('.variant-card.selected');
        if (!selectedCard) {
          showAlert('warning', 'Please select a variant to publish');
          return;
        }
        
        const variantId = selectedCard.getAttribute('data-variant-id');
        const websiteId = new URLSearchParams(window.location.search).get('id') || window.location.pathname.split('/').pop();
        
        const response = await fetch(`/ab-testing/${websiteId}/publish/${variantId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          showAlert('success', 'Variant published successfully');
          
          // Update UI to show published variant
          const publishedBadge = document.createElement('div');
          publishedBadge.className = 'badge bg-success publish-badge';
          publishedBadge.textContent = 'Published';
          
          // Remove existing published badges
          document.querySelectorAll('.publish-badge').forEach(badge => badge.remove());
          
          // Add badge to selected variant
          selectedCard.querySelector('.card-body').appendChild(publishedBadge);
        } else {
          throw new Error(result.message || 'Failed to publish variant');
        }
      } catch (error) {
        console.error('Error publishing variant:', error);
        showAlert('danger', `Error: ${error.message || 'Failed to publish variant. Please try again.'}`);
      }
    });
  }
  
  // Initialize analytics chart
  function initAnalyticsChart() {
    // Load analytics data for variants
    const websiteId = new URLSearchParams(window.location.search).get('id') || window.location.pathname.split('/').pop();
    
    fetch(`/ab-testing/${websiteId}/analytics`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.analytics) {
          renderAnalyticsChart(data.analytics);
        }
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
        analyticsChartContainer.innerHTML = '<div class="alert alert-warning">Failed to load analytics data</div>';
      });
  }
  
  // Render analytics chart
  function renderAnalyticsChart(analyticsData) {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      // Add Chart.js script if not loaded
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => createChart(analyticsData);
      document.head.appendChild(script);
    } else {
      createChart(analyticsData);
    }
  }
  
  // Create chart with analytics data
  function createChart(analyticsData) {
    // Prepare data for chart
    const labels = analyticsData.map(item => item.variantName || `Variant ${item.variantId.slice(-5)}`);
    const visitData = analyticsData.map(item => item.visits || 0);
    const conversionData = analyticsData.map(item => item.conversions || 0);
    const conversionRateData = analyticsData.map(item => {
      const visits = item.visits || 0;
      const conversions = item.conversions || 0;
      return visits > 0 ? (conversions / visits * 100).toFixed(2) : 0;
    });
    
    // Create chart
    analyticsChart = new Chart(analyticsChartContainer, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Visits',
            data: visitData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          },
          {
            label: 'Conversions',
            data: conversionData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          },
          {
            label: 'Conversion Rate (%)',
            data: conversionRateData,
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            borderColor: 'rgb(255, 159, 64)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Variants'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Conversion Rate (%)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.raw;
                return `${label}: ${value}${context.dataset.label === 'Conversion Rate (%)' ? '%' : ''}`;
              }
            }
          }
        }
      }
    });
  }
  
  // Helper function to show alerts
  function showAlert(type, message) {
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show`;
    alertEl.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.prepend(alertEl);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertEl.remove();
    }, 5000);
  }
  
  // Track variant visit (only on preview page with variant parameter)
  if (window.location.pathname.includes('/preview/') && window.location.search.includes('variant=')) {
    trackVariantVisit();
  }
  
  // Function to track variant visit
  function trackVariantVisit() {
    const params = new URLSearchParams(window.location.search);
    const variantId = params.get('variant');
    const websiteId = window.location.pathname.split('/')[2]; // Extract website ID from URL
    
    if (variantId && websiteId) {
      // Send tracking request
      fetch(`/ab-testing/${websiteId}/track-visit/${variantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error('Error tracking visit:', error);
      });
    }
  }
  
  // Track conversion (when a CTA button is clicked)
  document.addEventListener('click', function(e) {
    // Check if click is on a CTA button
    if (e.target.matches('.btn, a.cta, [data-track="conversion"]')) {
      // Check if on a preview page with variant parameter
      if (window.location.pathname.includes('/preview/') && window.location.search.includes('variant=')) {
        trackVariantConversion();
      }
    }
  });
  
  // Function to track variant conversion
  function trackVariantConversion() {
    const params = new URLSearchParams(window.location.search);
    const variantId = params.get('variant');
    const websiteId = window.location.pathname.split('/')[2]; // Extract website ID from URL
    
    if (variantId && websiteId) {
      // Send tracking request
      fetch(`/ab-testing/${websiteId}/track-conversion/${variantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error('Error tracking conversion:', error);
      });
    }
  }
});
