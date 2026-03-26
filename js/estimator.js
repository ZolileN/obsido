/* ============================================
   COST ESTIMATOR - JAVASCRIPT
   ============================================ */

// Furniture pricing data
const furnitureOptions = {
  'kitchen-basic': { name: 'Basic Kitchen Cabinet Set', basePrice: 41500, unit: 'set' },
  'kitchen-premium': { name: 'Premium Kitchen with Island', basePrice: 91300, unit: 'set' },
  'wardrobe-standard': { name: 'Standard Wardrobe System', basePrice: 49800, unit: 'set' },
  'wardrobe-luxury': { name: 'Luxury Walk-In Wardrobe', basePrice: 124500, unit: 'set' },
  'custom-shelving': { name: 'Custom Shelving Unit', basePrice: 29900, unit: 'unit' },
  'custom-desk': { name: 'Custom Built-In Desk', basePrice: 36500, unit: 'unit' }
};

// Flooring pricing data
const flooringOptions = {
  'laminate-standard': { name: 'Standard Laminate Flooring', pricePerSqFt: 58 },
  'laminate-premium': { name: 'Premium Laminate Flooring', pricePerSqFt: 91 },
  'flooring-luxury': { name: 'Luxury Laminate with Installation', pricePerSqFt: 133 }
};

// Add-on pricing
const addOns = {
  'delivery': 8300,
  'installation': 13300,
  'finishing': 6600,
  'warranty': 5000
};

// State
let estimatorState = {
  productType: null,
  productPrice: 0,
  quantity: 1,
  area: 500,
  selectedAddOns: {},
  tax: 0.15
};

// DOM Elements
const furnitureTypeSelect = document.getElementById('furniture-type');
const flooringTypeSelect = document.getElementById('flooring-type');
const furnitureQtySlider = document.getElementById('furniture-quantity');
const furnitureQtyDisplay = document.getElementById('furniture-qty-display');
const flooringAreaSlider = document.getElementById('flooring-area');
const flooringAreaDisplay = document.getElementById('flooring-area-display');
const flooringAreaInput = document.getElementById('flooring-area-input');
const addonCheckboxes = document.querySelectorAll('.addon-check');
const summaryContent = document.getElementById('summary-content');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0
  }).format(value);
}

function loadVisualizerEstimateRequest() {
  const stored = localStorage.getItem('visualizerEstimateRequest');
  if (!stored) return;

  try {
    const request = JSON.parse(stored);
    if (!request.furnitureType || !furnitureTypeSelect) return;

    furnitureTypeSelect.value = request.furnitureType;
    estimatorState.quantity = request.quantity || 1;

    if (furnitureQtySlider) {
      furnitureQtySlider.value = estimatorState.quantity;
    }

    if (furnitureQtyDisplay) {
      furnitureQtyDisplay.textContent = String(estimatorState.quantity);
    }

    handleFurnitureTypeChange({ target: furnitureTypeSelect });

    const sourceNote = document.createElement('div');
    sourceNote.className = 'summary-section';
    sourceNote.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Visualizer Import</span>
        <span class="summary-value">Ready</span>
      </div>
      <div class="summary-row" style="align-items:flex-start;">
        <span class="summary-label">Design Notes</span>
        <span class="summary-value" style="max-width:220px; text-align:right;">${request.visualizerSummary || 'Imported from 3D visualizer'}</span>
      </div>
    `;

    updateSummary(sourceNote.outerHTML);
  } catch (error) {
    console.error('Failed to load visualizer estimate request', error);
  } finally {
    localStorage.removeItem('visualizerEstimateRequest');
  }
}

// Event listeners
if (furnitureTypeSelect) {
  furnitureTypeSelect.addEventListener('change', handleFurnitureTypeChange);
}

if (flooringTypeSelect) {
  flooringTypeSelect.addEventListener('change', handleFlooringTypeChange);
}

if (furnitureQtySlider) {
  furnitureQtySlider.addEventListener('input', handleFurnitureQtyChange);
}

if (flooringAreaSlider) {
  flooringAreaSlider.addEventListener('input', handleFlooringAreaChange);
}

if (flooringAreaInput) {
  flooringAreaInput.addEventListener('change', handleFlooringAreaInputChange);
}

addonCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', handleAddonChange);
});

// Handlers
function handleFurnitureTypeChange(e) {
  const selectedValue = e.target.value;
  
  if (selectedValue) {
    estimatorState.productType = 'furniture';
    estimatorState.productPrice = furnitureOptions[selectedValue].basePrice;
    
    // Show quantity controls
    document.getElementById('furniture-quantity-group').style.display = 'block';
    document.getElementById('flooring-area-group').style.display = 'none';
    
    // Show add-ons
    document.getElementById('addons-section').style.display = 'block';
    
    updateSummary();
  } else {
    // Clear selection
    estimatorState.productType = null;
    estimatorState.productPrice = 0;
    document.getElementById('furniture-quantity-group').style.display = 'none';
    document.getElementById('addons-section').style.display = 'none';
    updateSummary();
  }
}

function handleFlooringTypeChange(e) {
  const selectedValue = e.target.value;
  
  if (selectedValue) {
    estimatorState.productType = 'flooring';
    estimatorState.productPrice = flooringOptions[selectedValue].pricePerSqFt;
    
    // Show area controls
    document.getElementById('flooring-area-group').style.display = 'block';
    document.getElementById('furniture-quantity-group').style.display = 'none';
    
    // Show add-ons
    document.getElementById('addons-section').style.display = 'block';
    
    updateSummary();
  } else {
    // Clear selection
    estimatorState.productType = null;
    estimatorState.productPrice = 0;
    document.getElementById('flooring-area-group').style.display = 'none';
    document.getElementById('addons-section').style.display = 'none';
    updateSummary();
  }
}

function handleFurnitureQtyChange(e) {
  estimatorState.quantity = parseInt(e.target.value);
  furnitureQtyDisplay.textContent = estimatorState.quantity;
  updateSummary();
}

function handleFlooringAreaChange(e) {
  estimatorState.area = parseInt(e.target.value);
  flooringAreaDisplay.textContent = estimatorState.area;
  flooringAreaInput.value = estimatorState.area;
  updateSummary();
}

function handleFlooringAreaInputChange(e) {
  let value = parseInt(e.target.value);
  if (value < 100) value = 100;
  if (value > 5000) value = 5000;
  estimatorState.area = value;
  flooringAreaSlider.value = value;
  flooringAreaDisplay.textContent = value;
  updateSummary();
}

function handleAddonChange(e) {
  const addonName = e.target.getAttribute('data-addon');
  const addonPrice = parseInt(e.target.getAttribute('data-price'));
  
  if (e.target.checked) {
    estimatorState.selectedAddOns[addonName] = addonPrice;
  } else {
    delete estimatorState.selectedAddOns[addonName];
  }
  
  updateSummary();
}

function incrementFurnitureQty() {
  if (estimatorState.quantity < 10) {
    estimatorState.quantity++;
    furnitureQtySlider.value = estimatorState.quantity;
    furnitureQtyDisplay.textContent = estimatorState.quantity;
    updateSummary();
  }
}

function decrementFurnitureQty() {
  if (estimatorState.quantity > 1) {
    estimatorState.quantity--;
    furnitureQtySlider.value = estimatorState.quantity;
    furnitureQtyDisplay.textContent = estimatorState.quantity;
    updateSummary();
  }
}

function resetEstimator() {
  // Reset form
  if (furnitureTypeSelect) furnitureTypeSelect.value = '';
  if (flooringTypeSelect) flooringTypeSelect.value = '';
  if (furnitureQtySlider) furnitureQtySlider.value = 1;
  if (flooringAreaSlider) flooringAreaSlider.value = 500;
  if (flooringAreaInput) flooringAreaInput.value = 500;
  
  // Reset checkboxes
  addonCheckboxes.forEach(checkbox => checkbox.checked = false);
  
  // Reset state
  estimatorState = {
    productType: null,
    productPrice: 0,
    quantity: 1,
    area: 500,
    selectedAddOns: {},
    tax: 0.15
  };
  
  // Reset display
  furnitureQtyDisplay.textContent = '1';
  flooringAreaDisplay.textContent = '500';
  document.getElementById('furniture-quantity-group').style.display = 'none';
  document.getElementById('flooring-area-group').style.display = 'none';
  document.getElementById('addons-section').style.display = 'none';
  
  updateSummary();
}

function updateSummary(extraContent = '') {
  if (!estimatorState.productType) {
    summaryContent.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--muted);">
        <p>Select a product to see pricing</p>
      </div>
    `;
    return;
  }
  
  let subtotal = 0;
  let productName = '';
  let productLine = '';
  
  if (estimatorState.productType === 'furniture') {
    // Find product name
    const selectedOption = furnitureTypeSelect.options[furnitureTypeSelect.selectedIndex];
    productName = selectedOption.text.split(' — ')[0];
    subtotal = estimatorState.productPrice * estimatorState.quantity;
    productLine = `${estimatorState.quantity} × ${productName}`;
  } else if (estimatorState.productType === 'flooring') {
    // Find product name
    const selectedOption = flooringTypeSelect.options[flooringTypeSelect.selectedIndex];
    productName = selectedOption.text.split(' — ')[0];
    subtotal = estimatorState.productPrice * estimatorState.area;
    productLine = `${estimatorState.area} sq ft × ${productName}`;
  }
  
  // Calculate add-ons total
  let addOnsTotal = 0;
  let addOnsHTML = '';
  
  for (const [addonName, addonPrice] of Object.entries(estimatorState.selectedAddOns)) {
    addOnsTotal += addonPrice;
    const addonLabel = addonName.charAt(0).toUpperCase() + addonName.slice(1);
    addOnsHTML += `
      <div class="summary-row">
        <span class="summary-label">${addonLabel}</span>
        <span class="summary-value">${formatCurrency(addonPrice)}</span>
      </div>
    `;
  }
  
  const subtotalWithAddOns = subtotal + addOnsTotal;
  const tax = Math.round(subtotalWithAddOns * estimatorState.tax);
  const total = subtotalWithAddOns + tax;
  
  summaryContent.innerHTML = `
    ${extraContent}
    <div class="summary-section">
      <div class="summary-row">
        <span class="summary-label">${productLine}</span>
        <span class="summary-value">${formatCurrency(subtotal)}</span>
      </div>
      ${addOnsHTML}
      <div class="summary-row" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">${formatCurrency(subtotalWithAddOns)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">VAT (15%)</span>
        <span class="summary-value">${formatCurrency(tax)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatCurrency(total)}</span>
      </div>
    </div>
  `;
}

function submitQuoteRequest() {
  if (!estimatorState.productType) {
    alert('Please select a product first');
    return;
  }
  
  // Prepare quote data
  let quoteData = {
    productType: estimatorState.productType,
    timestamp: new Date().toLocaleString(),
    ...estimatorState
  };
  
  // Store in localStorage for demo
  localStorage.setItem('lastQuote', JSON.stringify(quoteData));
  
  // Show confirmation
  alert('Quote request submitted! We will contact you shortly with a detailed estimate.');
  
  // In a real application, this would send data to a backend
  console.log('Quote Request:', quoteData);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateSummary();
  loadVisualizerEstimateRequest();
});
