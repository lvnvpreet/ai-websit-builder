// Page Editor - Partial Regeneration Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const pageContainer = document.getElementById('page-content');
  const sectionsList = document.getElementById('sections-list');
  const regenerateBtn = document.getElementById('regenerate-section-btn');
  const savePageBtn = document.getElementById('save-page-btn');
  const addSectionForm = document.getElementById('add-section-form');
  const addSectionBtn = document.getElementById('add-section-btn');
  const regenerationModal = new bootstrap.Modal(document.getElementById('regeneration-modal'), {
    backdrop: 'static'
  });
  
  // Set up sortable sections
  if (sectionsList) {
    setupSortable();
  }
  
  // Set up section highlighting on hover
  if (pageContainer && sectionsList) {
    setupSectionHighlighting();
  }
  
  // Set up regeneration modal
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', function() {
      const selectedSection = document.querySelector('.section-item.selected');
      if (selectedSection) {
        const sectionId = selectedSection.getAttribute('data-section-id');
        const sectionName = selectedSection.querySelector('.section-name').textContent;
        
        // Set values in modal
        document.getElementById('section-id-to-regenerate').value = sectionId;
        document.getElementById('section-name-to-regenerate').textContent = sectionName;
        
        // Show modal
        regenerationModal.show();
      } else {
        showAlert('warning', 'Please select a section to regenerate');
      }
    });
  }
  
  // Handle regeneration form submission
  const regenerationForm = document.getElementById('section-regeneration-form');
  if (regenerationForm) {
    regenerationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const sectionId = document.getElementById('section-id-to-regenerate').value;
      const instructions = document.getElementById('regeneration-instructions').value;
      const websiteId = window.location.pathname.split('/')[2];
      const pageId = window.location.pathname.split('/')[3];
      
      // Disable form elements and show loading state
      document.getElementById('regeneration-instructions').disabled = true;
      document.getElementById('regenerate-btn').disabled = true;
      document.getElementById('regenerate-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Regenerating...';
      
      try {
        // Make API request to regenerate section
        const response = await fetch(`/page-editor/${websiteId}/${pageId}/regenerate-section/${sectionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ instructions })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Close modal
          regenerationModal.hide();
          
          // Show success message
          showAlert('success', 'Section regenerated successfully!');
          
          // Reload page after a short delay
          setTimeout(() => {
            location.reload();
          }, 1500);
        } else {
          throw new Error(result.message || 'Failed to regenerate section');
        }
      } catch (error) {
        console.error('Error regenerating section:', error);
        showAlert('danger', `Error: ${error.message || 'Failed to regenerate section'}`);
        
        // Reset form elements
        document.getElementById('regeneration-instructions').disabled = false;
        document.getElementById('regenerate-btn').disabled = false;
        document.getElementById('regenerate-btn').innerHTML = 'Regenerate Section';
      }
    });
  }
  
  // Handle add section form submission
  if (addSectionForm) {
    addSectionForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const sectionType = document.getElementById('section-type').value;
      const sectionContent = document.getElementById('section-content').value;
      const websiteId = window.location.pathname.split('/')[2];
      const pageId = window.location.pathname.split('/')[3];
      
      // Disable form elements and show loading state
      document.getElementById('section-type').disabled = true;
      document.getElementById('section-content').disabled = true;
      addSectionBtn.disabled = true;
      addSectionBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
      
      try {
        // Make API request to add new section
        const response = await fetch(`/page-editor/${websiteId}/${pageId}/add-section`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: sectionType, content: sectionContent })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Show success message
          showAlert('success', 'New section added successfully!');
          
          // Reload page after a short delay
          setTimeout(() => {
            location.reload();
          }, 1500);
        } else {
          throw new Error(result.message || 'Failed to add section');
        }
      } catch (error) {
        console.error('Error adding section:', error);
        showAlert('danger', `Error: ${error.message || 'Failed to add section'}`);
        
        // Reset form elements
        document.getElementById('section-type').disabled = false;
        document.getElementById('section-content').disabled = false;
        addSectionBtn.disabled = false;
        addSectionBtn.innerHTML = 'Add Section';
      }
    });
  }
  
  // Handle save page changes (reordering)
  if (savePageBtn) {
    savePageBtn.addEventListener('click', async function() {
      const websiteId = window.location.pathname.split('/')[2];
      const pageId = window.location.pathname.split('/')[3];
      
      // Get section order
      const sectionItems = document.querySelectorAll('.section-item');
      const sectionOrder = Array.from(sectionItems).map(item => item.getAttribute('data-section-id'));
      
      // Disable button and show loading state
      savePageBtn.disabled = true;
      savePageBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
      
      try {
        // Make API request to save section order
        const response = await fetch(`/page-editor/${websiteId}/${pageId}/reorder-sections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sectionOrder })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Show success message
          showAlert('success', 'Page changes saved successfully!');
          
          // Reset button
          savePageBtn.disabled = false;
          savePageBtn.innerHTML = 'Save Page Changes';
        } else {
          throw new Error(result.message || 'Failed to save page changes');
        }
      } catch (error) {
        console.error('Error saving page changes:', error);
        showAlert('danger', `Error: ${error.message || 'Failed to save page changes'}`);
        
        // Reset button
        savePageBtn.disabled = false;
        savePageBtn.innerHTML = 'Save Page Changes';
      }
    });
  }
  
  // Set up sortable sections
  function setupSortable() {
    // Check if Sortable library is loaded
    if (typeof Sortable === 'undefined') {
      // Add Sortable.js if not loaded
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js';
      script.onload = initSortable;
      document.head.appendChild(script);
    } else {
      initSortable();
    }
  }
  
  // Initialize Sortable
  function initSortable() {
    const sortable = Sortable.create(sectionsList, {
      animation: 150,
      ghostClass: 'section-ghost',
      chosenClass: 'section-chosen',
      dragClass: 'section-drag',
      handle: '.drag-handle',
      onEnd: function() {
        // Enable save button when sections are reordered
        if (savePageBtn) {
          savePageBtn.disabled = false;
        }
      }
    });
  }
  
  // Set up section highlighting
  function setupSectionHighlighting() {
    const sectionItems = document.querySelectorAll('.section-item');
    const previewSections = pageContainer.querySelectorAll('section');
    
    // Add click handler to select sections
    sectionItems.forEach((item, index) => {
      item.addEventListener('click', function() {
        // Remove selected class from all items
        sectionItems.forEach(i => i.classList.remove('selected'));
        
        // Add selected class to clicked item
        item.classList.add('selected');
        
        // Enable regenerate button
        if (regenerateBtn) {
          regenerateBtn.disabled = false;
        }
        
        // Highlight corresponding section in preview
        if (previewSections[index]) {
          // Remove highlight from all sections
          previewSections.forEach(section => section.classList.remove('highlight-section'));
          
          // Add highlight to corresponding section
          previewSections[index].classList.add('highlight-section');
          
          // Scroll to section
          previewSections[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
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
    
    const container = document.querySelector('.page-editor-container') || document.body;
    container.prepend(alertEl);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertEl.remove();
    }, 5000);
  }
});
