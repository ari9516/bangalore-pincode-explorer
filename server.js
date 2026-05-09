const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Load Dataset
// ─────────────────────────────────────────────

let pincodeData = [];
try {
  const raw = fs.readFileSync(path.join(__dirname, 'data', 'pincodes.json'), 'utf8');
  pincodeData = JSON.parse(raw);
  console.log(`✅ Loaded ${pincodeData.length} pincodes from dataset`);
} catch (err) {
  console.error('❌ Failed to load pincodes.json:', err.message);
  process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────

function validatePincode(pincode) {
  if (!pincode || typeof pincode !== 'string') {
    return { valid: false, message: 'Pincode is required' };
  }
  if (!/^\d+$/.test(pincode)) {
    return { valid: false, message: 'Pincode must contain digits only' };
  }
  if (pincode.length !== 6) {
    return { valid: false, message: `Pincode must be exactly 6 digits (got ${pincode.length})` };
  }
  if (!pincode.startsWith('56')) {
    return { valid: false, message: 'Pincode must be a valid Bangalore pincode (starting with 56)' };
  }
  return { valid: true };
}

function validateAreaName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Area name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: 'Area name cannot be empty or whitespace' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Area name must be at least 2 characters' };
  }
  if (trimmed.length > 100) {
    return { valid: false, message: 'Area name must not exceed 100 characters' };
  }
  if (!/^[a-zA-Z0-9\s\-'.]+$/.test(trimmed)) {
    return { valid: false, message: 'Area name contains invalid characters' };
  }
  return { valid: true, sanitized: trimmed };
}

function validatePrefix(prefix) {
  if (typeof prefix !== 'string') {
    return { valid: false, message: 'Prefix must be a string' };
  }
  const trimmed = prefix.trim();
  if (trimmed.length > 50) {
    return { valid: false, message: 'Prefix too long' };
  }
  if (trimmed.length > 0 && !/^[a-zA-Z0-9\s\-'.]+$/.test(trimmed)) {
    return { valid: false, message: 'Prefix contains invalid characters' };
  }
  return { valid: true, sanitized: trimmed };
}

// ─────────────────────────────────────────────
// API: Health Check
// ─────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    pincodeCount: pincodeData.length
  });
});

// ─────────────────────────────────────────────
// API: Get areas by pincode
// ─────────────────────────────────────────────

app.get('/api/pincode/:pincode', (req, res, next) => {
  try {
    const pincode = req.params.pincode.trim();

    const check = validatePincode(pincode);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const entry = pincodeData.find(item => item.pincode === pincode);
    if (entry) {
      res.json({ success: true, areas: entry.areas });
    } else {
      res.status(404).json({ success: false, message: 'Pincode not found in Bangalore dataset' });
    }
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// API: Get pincodes by area name
// ─────────────────────────────────────────────

app.get('/api/area', (req, res, next) => {
  try {
    const rawName = req.query.name;

    const check = validateAreaName(rawName);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const lowerQuery = check.sanitized.toLowerCase();
    const matchingPincodes = pincodeData
      .filter(item => item.areas.some(area => area.toLowerCase().includes(lowerQuery)))
      .map(item => ({ pincode: item.pincode, areas: item.areas }));

    if (matchingPincodes.length > 0) {
      res.json({ success: true, results: matchingPincodes });
    } else {
      res.status(404).json({ success: false, message: 'No pincodes found for this area name' });
    }
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// API: Autocomplete suggestions
// ─────────────────────────────────────────────

app.get('/api/area-suggest', (req, res, next) => {
  try {
    const rawPrefix = req.query.prefix || '';

    const check = validatePrefix(rawPrefix);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const lowerPrefix = check.sanitized.toLowerCase();

    if (lowerPrefix.length === 0) {
      return res.json({ success: true, suggestions: [] });
    }

    const seen = new Set();
    const allAreas = [];
    pincodeData.forEach(entry => {
      entry.areas.forEach(area => {
        if (!seen.has(area)) {
          seen.add(area);
          allAreas.push(area);
        }
      });
    });

    const matches = allAreas
      .filter(area => area.toLowerCase().startsWith(lowerPrefix))
      .sort();

    res.json({ success: true, suggestions: matches.slice(0, 10) });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// 404 Handler — unknown API routes
// ─────────────────────────────────────────────

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`
  });
});

// ─────────────────────────────────────────────
// Global Error Handler (4 params required by Express)
// ─────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${req.method} ${req.originalUrl}`);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.'
  });
});

// ─────────────────────────────────────────────
// Fallback → index.html
// ─────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bangalore Pincode Explorer running on http://localhost:${PORT}`);
});
