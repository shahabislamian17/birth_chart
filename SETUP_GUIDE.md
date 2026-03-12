# Two-Diagram System - Quick Start Guide

## What Has Been Built

✅ **Complete system for managing two diagrams per user:**
- Original Diagram (immutable birth chart)
- Desired Diagram (editable, constellation-based, 30-day expiration)
- QR code collection system with duplicate prevention
- Authentication system
- All necessary APIs and UI components

## Files Created/Modified

### Core Types
- **[lib/types.ts](../lib/types.ts)** - TypeScript interfaces for all data models

### APIs
- **[app/api/auth/route.ts](../app/api/auth/route.ts)** - User registration/login
- **[app/api/qr/scan/route.ts](../app/api/qr/scan/route.ts)** - QR code scanning and constellation collection
- **[app/api/diagrams/route.ts](../app/api/diagrams/route.ts)** - Diagram CRUD operations

### UI Components
- **[app/chart-tool/desired-diagram-editor.tsx](../app/chart-tool/desired-diagram-editor.tsx)** - Interactive diagram editor
- **[app/chart-tool/two-diagram-view.tsx](../app/chart-tool/two-diagram-view.tsx)** - Side-by-side diagram display

### Utilities
- **[lib/diagram-utils.ts](../lib/diagram-utils.ts)** - Expiration, reset, and validation logic

### Examples & Documentation
- **[app/chart-tool/result-page-example.tsx](../app/chart-tool/result-page-example.tsx)** - Integration example
- **[TWO_DIAGRAM_SYSTEM.md](../TWO_DIAGRAM_SYSTEM.md)** - Comprehensive documentation

## Installation Steps

### 1. Install Required Dependencies

```bash
npm install uuid bcryptjs
npm install --save-dev @types/uuid
```

Or update [package.json](../package.json):

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "styled-components": "^6.1.18",
    "uuid": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/styled-components": "^5.1.34",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. Verify File Structure

```
app/
├── api/
│   ├── auth/
│   │   └── route.ts                    ✅ Created
│   ├── qr/
│   │   └── scan/
│   │       └── route.ts                ✅ Created
│   └── diagrams/
│       └── route.ts                    ✅ Created
└── chart-tool/
    ├── desired-diagram-editor.tsx      ✅ Created
    ├── two-diagram-view.tsx            ✅ Created
    ├── result-page-example.tsx         ✅ Created
    └── page.tsx                        (existing)

lib/
├── types.ts                            ✅ Created
└── diagram-utils.ts                    ✅ Created
```

### 3. Integration into Your Existing Result Page

In your [app/chart-tool/result.tsx](../app/chart-tool/result.tsx), add:

```tsx
import TwoDiagramView from './two-diagram-view'
import DesiredDiagramEditor from './desired-diagram-editor'

export default function ResultPage({ chartData, apiChartData, onEdit }: ResultPageProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [desiredDiagram, setDesiredDiagram] = useState(null)
  const [collectedConstellations, setCollectedConstellations] = useState([])
  const [showDesiredEditor, setShowDesiredEditor] = useState(false)

  // Load user and diagrams (see result-page-example.tsx for full implementation)
  useEffect(() => {
    // 1. Load authenticated user from session
    // 2. Load collected constellations from /api/qr/scan?userId=...
    // 3. Load desired diagram from /api/diagrams?userId=...
  }, [])

  return (
    <>
      {/* Your existing result content */}
      
      {/* Add the two-diagram view */}
      <TwoDiagramView
        originalChartData={apiChartData}
        desiredDiagramData={desiredDiagram}
        collectedConstellations={collectedConstellations}
        onEditDesired={() => setShowDesiredEditor(true)}
        onCreateNewDesired={handleCreateNewDiagram}
      />

      {/* Show editor when needed */}
      {showDesiredEditor && (
        <DesiredDiagramEditor
          diagramId={desiredDiagram?.id}
          userId={userId}
          collectedConstellations={collectedConstellations}
          onSave={handleSaveDiagram}
          initialPlacements={desiredDiagram?.placements}
          isLocked={desiredDiagram?.isLocked}
          expiresAt={desiredDiagram?.expiresAt}
        />
      )}
    </>
  )
}
```

See [result-page-example.tsx](../app/chart-tool/result-page-example.tsx) for complete integration code.

## Testing the System

### Test 1: QR Code Scanning (Without Authentication)

```bash
curl -X POST http://localhost:3000/api/qr/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "QR_const_aries",
    "userId": "test_user_1"
  }'
```

Expected response:
```json
{
  "success": true,
  "constellationName": "Aries",
  "isNewConstellation": true,
  "constellation": {
    "id": "const_aries",
    "name": "Aries",
    "symbol": "♈",
    "emoji": "🐏"
  }
}
```

### Test 2: Get Collected Constellations

```bash
curl http://localhost:3000/api/qr/scan?userId=test_user_1
```

### Test 3: Create Desired Diagram

```bash
curl -X POST http://localhost:3000/api/diagrams/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "originalChartId": "chart_1"
  }'
```

### Test 4: Update Placements

```bash
curl -X POST http://localhost:3000/api/diagrams/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "diagramId": "diagram_id_from_create_response",
    "placements": [
      {
        "id": "p1",
        "constellationId": "const_aries",
        "position": { "x": 25, "y": 25 },
        "zIndex": 0,
        "scale": 1,
        "rotation": 0
      }
    ]
  }'
```

### Available Test QR Codes

All 12 zodiac constellations are available:

```
QR_const_aries       🐏 Aries
QR_const_taurus      🐂 Taurus
QR_const_gemini      👯 Gemini
QR_const_cancer      🦀 Cancer
QR_const_leo         🦁 Leo
QR_const_virgo       👩‍🌾 Virgo
QR_const_libra       ⚖️ Libra
QR_const_scorpio     🦂 Scorpio
QR_const_sagittarius 🏹 Sagittarius
QR_const_capricorn   🐐 Capricorn
QR_const_aquarius    🏺 Aquarius
QR_const_pisces      🐟 Pisces
```

## Key Features

### ✨ Original Diagram
- Generated from birth chart data
- **Never changes** after creation
- Immutable and read-only
- Represents user's natal chart

### 🎨 Desired Diagram
- User builds by placing collected constellations
- **Editable** until expiration or lock
- Expires after **30 days**
- Can be **reset** (clears placements, extends expiration)
- Can be **locked** (preserves current design)
- After expiration, user can:
  - **Reset**: Start fresh with new 30-day period
  - **Create New**: Start a completely new diagram

### 📱 QR Code System
- Each physical product has unique QR code
- Scan QR → Constellation added to collection
- **Duplicate prevention**: Scanning same code twice only adds once
- No rewards given for duplicates
- Collection persists across sessions

### 🔐 Security Features
- User authentication required
- Ownership validation (users can only edit their own diagrams)
- QR code uniqueness tracking
- Automatic expiration prevents indefinite diagrams

## API Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### QR Codes
- `POST /api/qr/scan` - Scan QR code
- `GET /api/qr/scan?userId=...` - Get user's collected constellations

### Diagrams
- `POST /api/diagrams/create` - Create new desired diagram
- `POST /api/diagrams/update` - Update placements
- `POST /api/diagrams/lock` - Lock diagram (prevent edits)
- `POST /api/diagrams/reset` - Reset diagram (clear + extend 30 days)
- `GET /api/diagrams?userId=...` - Get user's diagrams

## Next Steps

1. **Choose a Database**
   - PostgreSQL (recommended)
   - MongoDB
   - Firebase

2. **Replace In-Memory Storage**
   - Update API routes to use real database
   - See `TWO_DIAGRAM_SYSTEM.md` for Prisma example

3. **Implement Authentication**
   - Add JWT or session-based auth
   - Protect API endpoints
   - Add login/register pages

4. **Deploy**
   - Test all flows in staging
   - Set up monitoring
   - Configure backups

## Important Notes

### Current Implementation (Development)
- In-memory storage (data lost on server restart)
- No actual database connection
- For **development/testing only**

### Production Requirements
- Real database (PostgreSQL recommended)
- Secure authentication (JWT/OAuth)
- Rate limiting on APIs
- Background jobs for expiration checks
- Email notifications
- Error logging and monitoring

## Support

For detailed documentation, see:
- **[TWO_DIAGRAM_SYSTEM.md](../TWO_DIAGRAM_SYSTEM.md)** - Complete system guide
- **[result-page-example.tsx](../app/chart-tool/result-page-example.tsx)** - Integration example
- **[app/chart-tool/desired-diagram-editor.tsx](../app/chart-tool/desired-diagram-editor.tsx)** - Editor component docs
- **[lib/diagram-utils.ts](../lib/diagram-utils.ts)** - Utility functions reference

## License

This implementation is part of your birth chart application.
