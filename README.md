# 📍 Bangalore Pincode Explorer

A full-stack web application to explore Bangalore's postal pincodes. Search any area to get its pincode, or enter a pincode to see all areas under it — with live autocomplete suggestions as you type.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

- 🔢 **Pincode → Area** — Enter a 6-digit Bangalore pincode and get all matching localities
- 🏙️ **Area → Pincode** — Search by area name with partial/substring matching
- ⌨️ **Live Autocomplete** — Suggestions appear as you type in the area search box
- 🛡️ **Server-side Validation** — Every API route validates and sanitizes input before processing
- 📱 **Responsive UI** — Works cleanly on desktop and mobile
- ⚡ **REST API** — Clean JSON API you can use independently of the UI

---

## 🖥️ Demo

| Pincode → Area | Area → Pincode |
|---|---|
| Enter `560038` → returns Indiranagar, 100 Feet Road, CMH Road | Type `Koram` → autocomplete suggests Koramangala |

---

## 🗂️ Project Structure

```
bangalore-pincode-explorer/
├── data/
│   └── pincodes.json        # Dataset: 75+ Bangalore pincodes with area mappings
├── public/
│   ├── index.html           # Frontend UI
│   ├── script.js            # Client-side logic + autocomplete
│   └── style.css            # Styling
├── server.js                # Express server + REST API + validation
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/bangalore-pincode-explorer.git
cd bangalore-pincode-explorer

# 2. Install dependencies
npm install

# 3. Start the server
node server.js
```

### Open in browser
```
http://localhost:3000
```

---

## 🔌 API Reference

All endpoints return JSON. Base URL: `http://localhost:3000`

---

### `GET /api/pincode/:pincode`

Returns all areas mapped to a given pincode.

**Validations:** Must be exactly 6 digits and a valid Bangalore pincode (starts with `56`).

**Request**
```
GET /api/pincode/560038
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "areas": ["Indiranagar", "100 Feet Road", "CMH Road", "Defence Colony"]
}
```

**Error Response** `400 Bad Request`
```json
{
  "success": false,
  "message": "Pincode must be a valid Bangalore pincode (starting with 56)"
}
```

**Error Response** `404 Not Found`
```json
{
  "success": false,
  "message": "Pincode not found in Bangalore dataset"
}
```

---

### `GET /api/area?name={areaName}`

Returns all pincodes that contain a matching area name (substring match, case-insensitive).

**Validations:** Min 2 chars, max 100 chars, alphanumeric + spaces/hyphens only.

**Request**
```
GET /api/area?name=Koramangala
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "results": [
    { "pincode": "560013", "areas": ["Koramangala", "Sony World Junction", "Jyoti Nivas College Road"] },
    { "pincode": "560051", "areas": ["Koramangala 1st Block", "Koramangala 5th Block", "Sony World Signal"] }
  ]
}
```

**Error Response** `400 Bad Request`
```json
{
  "success": false,
  "message": "Area name must be at least 2 characters"
}
```

---

### `GET /api/area-suggest?prefix={prefix}`

Returns up to 10 area name suggestions starting with the given prefix. Used for the autocomplete dropdown.

**Request**
```
GET /api/area-suggest?prefix=Indi
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "suggestions": ["Indiranagar", "Indira Nagar Extension"]
}
```

---

### `GET /api/health`

Health check endpoint. Returns server status and dataset size.

**Request**
```
GET /api/health
```

**Success Response** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "pincodeCount": 75
}
```

---

## 🛡️ Input Validation

All API routes perform server-side validation before processing any request:

| Route | Validation Rules |
|---|---|
| `/api/pincode/:pincode` | Digits only · Exactly 6 characters · Must start with `56` |
| `/api/area` | Required · Min 2 chars · Max 100 chars · Safe characters only |
| `/api/area-suggest` | Max 50 chars · Safe characters only |

Invalid requests receive a `400 Bad Request` with a descriptive error message.

---

## 📦 Dataset

The `data/pincodes.json` file contains **75+ Bangalore pincodes** covering major localities including:

- Central Bangalore (560001–560025)
- South Bangalore — Jayanagar, BTM Layout, JP Nagar, HSR Layout, Electronic City
- North Bangalore — Hebbal, Yelahanka, RT Nagar, Yeshwanthpur
- East Bangalore — Indiranagar, Whitefield, Marathahalli, KR Puram
- West Bangalore — Rajajinagar, Vijayanagar, Nagarbhavi
- Outskirts — Devanahalli, Anekal, Hoskote, Sarjapur

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Data | JSON flat file |
| API Style | REST |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
