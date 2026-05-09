const pincodeInput = document.getElementById('pincodeInput');
const searchPincodeBtn = document.getElementById('searchPincodeBtn');
const pincodeResult = document.getElementById('pincodeResult');
const areaInput = document.getElementById('areaInput');
const searchAreaBtn = document.getElementById('searchAreaBtn');
const areaResult = document.getElementById('areaResult');

// ----- Autocomplete Dropdown for Area Input -----
let dropdownContainer = null;

function createDropdown() {
  if (dropdownContainer) dropdownContainer.remove();
  dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'autocomplete-dropdown';
  areaInput.parentNode.style.position = 'relative';
  areaInput.parentNode.appendChild(dropdownContainer);
}

function showSuggestions(suggestions) {
  if (!dropdownContainer) createDropdown();
  if (!suggestions.length) {
    dropdownContainer.style.display = 'none';
    return;
  }
  dropdownContainer.innerHTML = '';
  suggestions.forEach(sugg => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = sugg;
    item.addEventListener('click', () => {
      areaInput.value = sugg;
      dropdownContainer.style.display = 'none';
      searchByArea(); // Automatically search after selection
    });
    dropdownContainer.appendChild(item);
  });
  dropdownContainer.style.display = 'block';
}

function hideDropdown() {
  if (dropdownContainer) dropdownContainer.style.display = 'none';
}

async function fetchSuggestions(prefix) {
  if (prefix.length === 0) {
    hideDropdown();
    return;
  }
  try {
    const response = await fetch(`/api/area-suggest?prefix=${encodeURIComponent(prefix)}`);
    const data = await response.json();
    if (data.success) {
      showSuggestions(data.suggestions);
    } else {
      hideDropdown();
    }
  } catch (err) {
    console.error('Suggestions error:', err);
    hideDropdown();
  }
}

// Attach event listeners for autocomplete
areaInput.addEventListener('input', (e) => {
  const prefix = e.target.value.trim();
  fetchSuggestions(prefix);
});

// Hide dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (areaInput !== e.target && (!dropdownContainer || !dropdownContainer.contains(e.target))) {
    hideDropdown();
  }
});

// ----- Existing search functions -----
function showResult(element, content, isError = false) {
  element.innerHTML = `<div class="${isError ? 'error' : 'success'}">${content}</div>`;
}

async function searchByPincode() {
  const pincode = pincodeInput.value.trim();
  if (!pincode) {
    showResult(pincodeResult, '❌ Please enter a pincode', true);
    return;
  }
  if (!/^\d{6}$/.test(pincode)) {
    showResult(pincodeResult, '❌ Pincode must be 6 digits', true);
    return;
  }
  pincodeResult.innerHTML = '<div>🔍 Searching...</div>';
  try {
    const response = await fetch(`/api/pincode/${pincode}`);
    const data = await response.json();
    if (data.success) {
      const areaList = data.areas.map(area => `📍 ${area}`).join('<br>');
      showResult(pincodeResult, `✅ <strong>Areas under pincode ${pincode}:</strong><br>${areaList}`);
    } else {
      showResult(pincodeResult, `❌ ${data.message || 'Pincode not found'}`, true);
    }
  } catch (err) {
    showResult(pincodeResult, '⚠️ Network error. Please try again.', true);
  }
}

async function searchByArea() {
  const areaName = areaInput.value.trim();
  if (!areaName) {
    showResult(areaResult, '❌ Please enter an area name', true);
    return;
  }
  areaResult.innerHTML = '<div>🔍 Searching...</div>';
  try {
    const response = await fetch(`/api/area?name=${encodeURIComponent(areaName)}`);
    const data = await response.json();
    if (data.success) {
      let resultHtml = `✅ <strong>Pincode(s) matching "${areaName}":</strong><br><br>`;
      data.results.forEach(item => {
        resultHtml += `📮 <strong>${item.pincode}</strong> → ${item.areas.join(', ')}<br>`;
      });
      showResult(areaResult, resultHtml);
    } else {
      showResult(areaResult, `❌ ${data.message || 'No matching areas found'}`, true);
    }
  } catch (err) {
    showResult(areaResult, '⚠️ Network error. Please try again.', true);
  }
}

// Event binding
searchPincodeBtn.addEventListener('click', searchByPincode);
searchAreaBtn.addEventListener('click', searchByArea);
pincodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByPincode(); });
areaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByArea(); });
