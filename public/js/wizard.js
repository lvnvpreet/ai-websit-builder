document.addEventListener('DOMContentLoaded', function() {
    // Color picker synchronization
    const primaryColorInput = document.getElementById('primaryColor');
    const primaryColorHex = document.getElementById('primaryColorHex');
    const primaryColorPreview = document.getElementById('primaryColorPreview');
    
    const secondaryColorInput = document.getElementById('secondaryColor');
    const secondaryColorHex = document.getElementById('secondaryColorHex');
    const secondaryColorPreview = document.getElementById('secondaryColorPreview');
    
    if (primaryColorInput) {
      primaryColorInput.addEventListener('input', function() {
        primaryColorHex.value = this.value;
        primaryColorPreview.style.backgroundColor = this.value;
        updatePreviewBox();
      });
    }
    
    if (secondaryColorInput) {
      secondaryColorInput.addEventListener('input', function() {
        secondaryColorHex.value = this.value;
        secondaryColorPreview.style.backgroundColor = this.value;
        updatePreviewBox();
      });
    }
    
    // Font family preview
    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) {
      fontFamilySelect.addEventListener('change', function() {
        updatePreviewBox();
      });
    }
    
    function updatePreviewBox() {
      const previewBox = document.querySelector('.preview-box');
      if (!previewBox) return;
      
      const primaryColor = primaryColorInput.value;
      const secondaryColor = secondaryColorInput.value;
      const fontFamily = fontFamilySelect.value;
      
      const heading = previewBox.querySelector('h4');
      heading.style.fontFamily = fontFamily;
      heading.style.color = primaryColor;
      
      const paragraph = previewBox.querySelector('p');
      paragraph.style.fontFamily = fontFamily;
      
      const primaryBtn = previewBox.querySelectorAll('.btn')[0];
      primaryBtn.style.backgroundColor = primaryColor;
      
      const secondaryBtn = previewBox.querySelectorAll('.btn')[1];
      secondaryBtn.style.backgroundColor = secondaryColor;
      
      const strongTag = previewBox.querySelector('strong');
      strongTag.style.color = primaryColor;
      
      const spanTag = previewBox.querySelector('span');
      spanTag.style.color = secondaryColor;
    }
    
    // Website structure toggle
    const structureSelect = document.getElementById('structure');
    const pagesSection = document.getElementById('pagesSection');
    
    if (structureSelect && pagesSection) {
      structureSelect.addEventListener('change', function() {
        if (this.value === 'Single Page') {
          pagesSection.classList.add('d-none');
        } else {
          pagesSection.classList.remove('d-none');
        }
      });
    }
    
    // Pages selection
    const pageCheckboxes = document.querySelectorAll('.page-checkbox');
    const pagesInput = document.getElementById('pagesInput');
    const selectedPages = document.getElementById('selectedPages');
    const addCustomPageBtn = document.getElementById('addCustomPage');
    const customPageInput = document.getElementById('customPageInput');
    
    // Track selected pages
    let pages = pagesInput && pagesInput.value ? pagesInput.value.split(',') : ['Home', 'About', 'Services', 'Contact'];
    
    if (pageCheckboxes.length > 0) {
      // Initial render of selected pages
      renderSelectedPages();
      
      // Add event listeners to checkboxes
      pageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          if (this.checked) {
            if (!pages.includes(this.value)) {
              pages.push(this.value);
            }
          } else {
            pages = pages.filter(page => page !== this.value);
          }
          updatePagesInput();
          renderSelectedPages();
        });
      });
    }
    
    // Add custom page
    if (addCustomPageBtn && customPageInput) {
      addCustomPageBtn.addEventListener('click', function() {
        const customPage = customPageInput.value.trim();
        if (customPage && !pages.includes(customPage)) {
          pages.push(customPage);
          updatePagesInput();
          renderSelectedPages();
          customPageInput.value = '';
        }
      });
      
      // Also allow Enter key to add a page
      customPageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomPageBtn.click();
        }
      });
    }
    
    // Handle page removal
    if (selectedPages) {
      selectedPages.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-close') || e.target.classList.contains('remove-page')) {
          const pageElement = e.target.closest('.badge');
          const pageName = pageElement.textContent.trim().replace(' ×', '');
          
          if (pageName !== 'Home') {
            pages = pages.filter(page => page !== pageName);
            
            // Also uncheck the corresponding checkbox if it exists
            const checkbox = document.querySelector(`.page-checkbox[value="${pageName}"]`);
            if (checkbox) {
              checkbox.checked = false;
            }
            
            updatePagesInput();
            renderSelectedPages();
          }
        }
      });
    }
    
    // Update hidden input with pages
    function updatePagesInput() {
      if (pagesInput) {
        pagesInput.value = pages.join(',');
      }
    }
    
    // Render the selected pages badges
    function renderSelectedPages() {
      if (!selectedPages) return;
      
      selectedPages.innerHTML = '';
      pages.forEach(page => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary me-2 mb-2';
        
        if (page === 'Home') {
          badge.textContent = page;
        } else {
          badge.innerHTML = `${page} <button type="button" class="btn-close btn-close-white remove-page" data-page="${page}"></button>`;
        }
        
        selectedPages.appendChild(badge);
      });
    }
    
    // Google Map URL toggle
    const hasGoogleMapCheckbox = document.getElementById('hasGoogleMap');
    const googleMapUrlGroup = document.getElementById('googleMapUrlGroup');
    
    if (hasGoogleMapCheckbox && googleMapUrlGroup) {
      hasGoogleMapCheckbox.addEventListener('change', function() {
        if (this.checked) {
          googleMapUrlGroup.classList.remove('d-none');
        } else {
          googleMapUrlGroup.classList.add('d-none');
        }
      });
    }
    
    // Generate button animation
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        this.disabled = true;
        this.form.submit();
      });
    }
  });