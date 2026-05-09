const pincodeInput = document.getElementById('pincodeInput');
const searchPincodeBtn = document.getElementById('searchPincodeBtn');
const pincodeResult = document.getElementById('pincodeResult');
const areaInput = document.getElementById('areaInput');
const searchAreaBtn = document.getElementById('searchAreaBtn');
const areaResult = document.getElementById('areaResult');

// ─────────────────────────────────────────────
// Button Loading State Helpers
// ─────────────────────────────────────────────

function setButtonLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Searching...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Search';
  }
}

// ─────────────────────────────────────────────
// Result Display Helper
// ─────────────────────────────────────────────

function showResult(element, content, isError = false) {
  element.innerHTML = `<div class="${isError ? 'error' : 'success'}">${content}</div>`;
}

// ─────────────────────────────────────────────
// Autocomplete Dropdown
// ─────────────────────────────────────────────

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
      searchByArea();
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

areaInput.addEventListener('input', (e) => {
  const prefix = e.target.value.trim();
  fetchSuggestions(prefix);
});

document.addEventListener('click', function (e) {
  if (areaInput !== e.target && (!dropdownContainer || !dropdownContainer.contains(e.target))) {
    hideDropdown();
  }
});

// ─────────────────────────────────────────────
// Search by Pincode
// ─────────────────────────────────────────────

async function searchByPincode() {
  const pincode = pincodeInput.value.trim();

  if (!pincode) {
    showResult(pincodeResult, '❌ Please enter a pincode', true);
    return;
  }
  if (!/^\d{6}$/.test(pincode)) {
    showResult(pincodeResult, '❌ Pincode must be exactly 6 digits', true);
    return;
  }

  setButtonLoading(searchPincodeBtn, true);
  pincodeResult.innerHTML = '';

  try {
    const response = await fetch(`/api/pincode/${pincode}`);
    const data = await response.json();

    if (data.success) {
      const areaList = data.areas.map(area => `📍 ${area}`).join('<br>');
      showResult(pincodeResult, `✅ <strong>Areas under pincode ${pincode}:</strong><br><br>${areaList}`);
    } else {
      showResult(pincodeResult, `❌ ${data.message || 'Pincode not found'}`, true);
    }
  } catch (err) {
    showResult(pincodeResult, '⚠️ Network error. Please try again.', true);
  } finally {
    setButtonLoading(searchPincodeBtn, false);
  }
}

// ─────────────────────────────────────────────
// Search by Area
// ─────────────────────────────────────────────

async function searchByArea() {
  const areaName = areaInput.value.trim();

  if (!areaName) {
    showResult(areaResult, '❌ Please enter an area name', true);
    return;
  }

  setButtonLoading(searchAreaBtn, true);
  areaResult.innerHTML = '';
  hideDropdown();

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
  } finally {
    setButtonLoading(searchAreaBtn, false);
  }
}

// ─────────────────────────────────────────────
// Event Binding
// ─────────────────────────────────────────────

searchPincodeBtn.addEventListener('click', searchByPincode);
searchAreaBtn.addEventListener('click', searchByArea);
pincodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByPincode(); });
areaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByArea(); });
