const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const pincodeData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pincodes.json'), 'utf8'));

app.use(express.static(path.join(__dirname, 'public')));

// API: Get areas by pincode
app.get('/api/pincode/:pincode', (req, res) => {
  const pincode = req.params.pincode;
  const entry = pincodeData.find(item => item.pincode === pincode);
  if (entry) {
    res.json({ success: true, areas: entry.areas });
  } else {
    res.status(404).json({ success: false, message: 'Pincode not found in Bangalore' });
  }
});

// API: Get pincodes by area name (substring match)
app.get('/api/area', (req, res) => {
  const areaQuery = req.query.name;
  if (!areaQuery) {
    return res.status(400).json({ success: false, message: 'Area name is required' });
  }
  const lowerQuery = areaQuery.toLowerCase();
  const matchingPincodes = pincodeData
    .filter(item => item.areas.some(area => area.toLowerCase().includes(lowerQuery)))
    .map(item => ({ pincode: item.pincode, areas: item.areas }));
  if (matchingPincodes.length > 0) {
    res.json({ success: true, results: matchingPincodes });
  } else {
    res.status(404).json({ success: false, message: 'No pincodes found for this area name' });
  }
});

// NEW API: Suggest area names that start with a given prefix (for autocomplete)
app.get('/api/area-suggest', (req, res) => {
  const prefix = req.query.prefix || '';
  if (prefix.trim().length === 0) {
    return res.json({ success: true, suggestions: [] });
  }
  const lowerPrefix = prefix.toLowerCase();
  // Extract unique area names from all entries
  const allAreas = [];
  pincodeData.forEach(entry => {
    entry.areas.forEach(area => {
      if (!allAreas.includes(area)) allAreas.push(area);
    });
  });
  // Filter areas that start with the prefix (case-insensitive)
  const matches = allAreas.filter(area => 
    area.toLowerCase().startsWith(lowerPrefix)
  ).sort(); // alphabetical order
  res.json({ success: true, suggestions: matches.slice(0, 10) }); // limit to 10 suggestions
});

// All other routes fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bangalore Pincode Explorer running on http://localhost:${PORT}`);
});