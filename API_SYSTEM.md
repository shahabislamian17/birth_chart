# Two Diagram System - Complete API Documentation

## Overview

The Two Diagram System manages two separate birth charts:
1. **Original Diagram** - Immutable birth chart generated from astrology calculations
2. **Desired Diagram** - Editable 28-day constellation placement grid with energy management

## Architecture

### Data Models

All models defined in [lib/db/models.ts](lib/db/models.ts):

- **User** - Authentication and birth data
- **OriginalDiagram** - Immutable birth chart (one per user)
- **UserInventory** - Collection of redeemed constellations
- **DesiredDiagram** - Editable grid with 28-day lifecycle
- **QRCode** - 12 constellation codes (Aries-Pisces)
- **QRRedemption** - Audit trail (prevents duplicates)
- **NebulaMatrixState** - Grid state and energy balance

### Backend Technology

- **Next.js 14** - API routes in `/api/*`
- **Mock MongoDB** - In-memory database for development (easily replaceable with real MongoDB)
- **TypeScript** - Full type safety
- **No external database library needed** - Simple async CRUD

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register new user and generate original diagram
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "birthData": {
    "date": "1990-05-15",
    "time": "14:30:00",
    "location": "New York, NY"
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_xyz123",
    "email": "user@example.com",
    "originalDiagramId": "diag_orig_123"
  }
}
```

#### GET `/api/auth/register?action=login`
Login with email and password (Basic Auth)
```
Authorization: Basic base64(email:password)
```
**Response:** Same as register

---

### QR Redemption

#### POST `/api/qr/redeem`
Redeem QR code and add constellation to inventory
```json
{
  "userId": "user_xyz123",
  "qrUniqueId": "QR_ARIES_001"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "constellation": "Aries",
    "isNew": true,
    "totalEnergies": 1
  },
  "message": "Aries constellation added!"
}
```

**Error if duplicate:**
```json
{
  "success": false,
  "error": "Already redeemed",
  "isDuplicate": true
}
```
Status: 409

#### GET `/api/qr/inventory?userId={userId}`
Fetch user's constellation inventory
```json
{
  "success": true,
  "data": {
    "constellations": [
      {
        "id": "const_aries",
        "name": "Aries",
        "redeemedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "totalEnergies": 1
  }
}
```

---

### Desired Diagram Lifecycle

#### POST `/api/desired-diagram/create-or-get`
Create new 28-day diagram or retrieve existing
```json
{
  "userId": "user_xyz123"
}
```
**Response (new):**
```json
{
  "success": true,
  "data": {
    "id": "desired_xyz789",
    "userId": "user_xyz123",
    "status": "active",
    "isLocked": false,
    "placements": [],
    "energyDensity": {},
    "expiresAt": "2024-02-15T10:30:00Z",
    "createdAt": "2024-01-18T10:30:00Z"
  },
  "message": "New 28-day cycle created"
}
```

#### GET `/api/desired-diagram?userId={userId}`
Fetch user's diagram with auto-expiration check
```json
{
  "success": true,
  "data": {
    "id": "desired_xyz789",
    "status": "active|expired",
    "isLocked": true|false,
    "placements": [...],
    "expiresAt": "2024-02-15T10:30:00Z",
    "daysRemaining": 27
  }
}
```

---

### Placement Management

#### POST `/api/desired-diagram/placements`
Add constellation to grid cell (uses 1 energy point)
```json
{
  "userId": "user_xyz123",
  "cellId": "0-5",
  "constellationId": "const_aries",
  "constellationName": "Aries"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "placement": {
      "cellId": "0-5",
      "constellationId": "const_aries",
      "constellationName": "Aries",
      "placedAt": "2024-01-18T11:00:00Z"
    },
    "totalPlacements": 1,
    "energyDensity": {
      "Aries": 1
    }
  },
  "message": "Aries placed at cell 0-5"
}
```

#### DELETE `/api/desired-diagram/placements?userId={userId}&cellId={cellId}`
Remove placement from cell (returns 1 energy point)
```json
{
  "success": true,
  "data": {
    "removedPlacement": {...},
    "totalPlacements": 0
  },
  "message": "Placement removed"
}
```

---

### Diagram Finalization

#### POST `/api/desired-diagram/lock`
Lock diagram and prevent further edits
```json
{
  "userId": "user_xyz123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "isLocked": true,
    "totalPlacements": 12,
    "energyDensity": {...},
    "lockedAt": "2024-02-15T10:30:00Z"
  },
  "message": "Diagram locked successfully"
}
```

#### PUT `/api/desired-diagram/lock` (or POST with action=reset)
Create new 28-day cycle
```json
{
  "userId": "user_xyz123"
}
```
**Response:** New diagram object

---

### Energy Scoring

#### GET `/api/desired-diagram/scores?userId={userId}`
Get energy distribution by zodiac sign
```json
{
  "success": true,
  "data": {
    "scores": {
      "Aries": 2,
      "Taurus": 1,
      "Gemini": 0,
      "Cancer": 3,
      ...
    },
    "statistics": {
      "totalPlacements": 12,
      "avgScore": 1.0,
      "maxScore": 3,
      "minScore": 0,
      "balanced": true
    },
    "status": "active",
    "isLocked": false,
    "daysRemaining": 27
  }
}
```

---

## Frontend Integration

### Using API Hooks

The [lib/hooks/useApi.ts](lib/hooks/useApi.ts) provides React hooks for all endpoints:

```typescript
'use client'
import { useDesiredDiagram, useQRRedemption } from '@/lib/hooks/useApi'

export function MyComponent() {
  const { addPlacement, getScores, lock } = useDesiredDiagram()
  const { redeem, getInventory } = useQRRedemption()

  const handlePlacement = async () => {
    try {
      const result = await addPlacement(userId, cellId, constellationId, name)
      console.log(result.message)
    } catch (error) {
      console.error(error.message)
    }
  }

  return <button onClick={handlePlacement}>Place Energy</button>
}
```

---

## Cell ID Format

Cells use format: `{zodiacIndex}-{houseIndex}`

**Zodiac indices (0-11):**
- 0 = Aries, 1 = Taurus, 2 = Gemini, 3 = Cancer
- 4 = Leo, 5 = Virgo, 6 = Libra, 7 = Scorpio
- 8 = Sagittarius, 9 = Capricorn, 10 = Aquarius, 11 = Pisces

**House indices (0-11):**
- 0-11 representing the 12 astrological houses

Example: `0-5` = Aries house 5

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- **200** - Success
- **400** - Missing or invalid parameters
- **403** - Forbidden (e.g., already locked, not owner)
- **404** - Resource not found
- **409** - Conflict (e.g., duplicate QR redemption)
- **410** - Gone (e.g., diagram expired)
- **500** - Server error

---

## 28-Day Lifecycle

1. **Day 1-27**: `status = 'active'`, `isLocked = false`
   - User can add/remove placements
   - Energy points available to spend

2. **Day 28**: Auto-check on any GET request
   - If `now > expiresAt`: `status = 'expired'`, `isLocked = true`
   - No further edits allowed

3. **Locked State**: User can
   - View final scores via `/api/desired-diagram/scores`
   - Reset to create new cycle via PUT `/api/desired-diagram/lock`

---

## Development vs Production

### Current (Development)
- Mock in-memory database in [lib/db/mock-db.ts](lib/db/mock-db.ts)
- 12 pre-seeded QR codes ready for testing
- No database setup required

### Production Ready
Replace mock-db with MongoDB:
```typescript
// lib/db/mongodb.ts
import { MongoClient } from 'mongodb'

export const mongoDb = {
  async saveUser(user) { ... },
  async getUser(userId) { ... },
  // Same interface as mock-db
}
```

Then update imports in route.ts files:
```typescript
import { mongoDb as mockDb } from '@/lib/db/mongodb'
```

---

## Testing Guide

### Test Sequence

1. **Register User:**
   ```bash
   POST /api/auth/register
   ```
   Save `userId` and `originalDiagramId`

2. **Redeem QR Code:**
   ```bash
   POST /api/qr/redeem
   { userId, qrUniqueId: "QR_ARIES_001" }
   ```
   Try redemption again to test duplicate prevention (expect 409)

3. **Get Inventory:**
   ```bash
   GET /api/qr/inventory?userId=...
   ```
   Should show 1 constellation

4. **Create Desired Diagram:**
   ```bash
   POST /api/desired-diagram/create-or-get
   { userId }
   ```
   Should return 28-day diagram

5. **Add Placement:**
   ```bash
   POST /api/desired-diagram/placements
   { userId, cellId: "0-5", constellationId: "const_aries", constellationName: "Aries" }
   ```

6. **Get Scores:**
   ```bash
   GET /api/desired-diagram/scores?userId=...
   ```
   Should show Aries with 1 point

7. **Lock Diagram:**
   ```bash
   POST /api/desired-diagram/lock
   { userId }
   ```
   Should prevent further placements

8. **Reset (Create New Cycle):**
   ```bash
   PUT /api/desired-diagram/lock
   { userId }
   ```
   Should create fresh 28-day diagram

---

## File Structure

```
app/
  api/
    auth/register/route.ts          # User registration & login
    qr/
      redeem/route.ts               # QR code redemption
      inventory/route.ts (via GET)  # Inventory retrieval
    desired-diagram/
      route.ts                      # Create/get diagram
      placements/route.ts           # Add/remove placements
      lock/route.ts                 # Lock & reset
      scores/route.ts               # Calculate scores
  chart-tool/
    page.tsx                        # Main form page
    result.tsx                      # Results display
    nebula-matrix.tsx               # 144-cell grid component

lib/
  db/
    models.ts                       # TypeScript interfaces
    mock-db.ts                      # In-memory mock database
  hooks/
    useApi.ts                       # React API hooks
```

---

## Next Steps

1. Integrate API hooks into `nebula-matrix.tsx` for real data
2. Create `OriginalDiagramDisplay` component
3. Create `InventoryManagement` component
4. Add authentication UI (login/register page)
5. Deploy to production with real MongoDB
