# Two-Diagram System Implementation Guide

## Overview

Your birth chart application now has a complete two-diagram system:

1. **Original Diagram** - Immutable, generated from birth data, never changes
2. **Desired Diagram** - User-editable, built from scanned QR code constellations, expires after 30 days

## System Components

### 1. Database Schema (lib/types.ts)

Core types defining the data model:

- **User** - User account information
- **Constellation** - Available constellation definitions (12 zodiac signs)
- **QRCode** - Physical product QR codes that unlock constellations
- **UserConstellation** - User's collected constellations (prevents duplicates)
- **DesiredDiagram** - User's aspirational chart with placements
- **DiagramPlacement** - Individual constellation placement on canvas
- **OriginalChart** - User's natal chart (immutable)

### 2. API Endpoints

#### Authentication (`/api/auth/route.ts`)

```bash
# Register new user
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure_password"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "success": true,
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "session_token"
}
```

#### QR Code Scanning (`/api/qr/scan/route.ts`)

```bash
# Scan QR code and add constellation
POST /api/qr/scan
{
  "qrCode": "QR_const_aries",
  "userId": "user_id"
}

# Get user's collected constellations
GET /api/qr/scan?userId=user_id
```

Response:
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

#### Diagram Management (`/api/diagrams/route.ts`)

```bash
# Create new Desired Diagram
POST /api/diagrams/create
{
  "userId": "user_id",
  "originalChartId": "chart_id"
}

# Update placements
POST /api/diagrams/update
{
  "userId": "user_id",
  "diagramId": "diagram_id",
  "placements": [
    {
      "id": "placement_1",
      "constellationId": "const_aries",
      "position": { "x": 25, "y": 25 },
      "zIndex": 0,
      "scale": 1,
      "rotation": 0
    }
  ]
}

# Lock diagram (prevent further edits)
POST /api/diagrams/lock
{
  "userId": "user_id",
  "diagramId": "diagram_id"
}

# Reset diagram (clear placements and extend expiration)
POST /api/diagrams/reset
{
  "userId": "user_id",
  "diagramId": "diagram_id"
}

# Get diagrams
GET /api/diagrams?userId=user_id
GET /api/diagrams?userId=user_id&diagramId=diagram_id
```

### 3. UI Components

#### DesiredDiagramEditor (`app/chart-tool/desired-diagram-editor.tsx`)

Interactive canvas for building the Desired Diagram:

- **Features:**
  - Drag constellations from sidebar to canvas
  - Move, scale, and rotate placements
  - Real-time editing with instant preview
  - Auto-expiration warnings
  - Lock state prevents editing

#### TwoDiagramView (`app/chart-tool/two-diagram-view.tsx`)

Side-by-side display of Original and Desired diagrams:

- Shows both diagrams for comparison
- Displays expiration status and countdown
- Provides edit/reset actions
- Shows collected constellations list

### 4. Utility Functions (`lib/diagram-utils.ts`)

```typescript
// Check expiration status
getTimeRemaining(expiresAt: Date): DiagramStatus

// Format time for display
formatTimeRemaining(expiresAt: Date): string

// Calculate 30-day expiration
calculateExpirationDate(): Date

// Get expiration warning message
getExpirationMessage(expiresAt: Date, isLocked: boolean): string | null

// Get suggested actions
getSuggestedActions(expiresAt: Date, isLocked: boolean, hasConstellations: boolean): string[]

// Auto-check and update status
checkAndUpdateDiagramStatus(diagram: any): any

// Validate reset eligibility
canResetDiagram(expiresAt: Date, isLocked: boolean): boolean
```

## Integration Steps

### Step 1: Install Dependencies

Add to `package.json`:

```bash
npm install uuid bcryptjs
npm install --save-dev @types/uuid
```

Update [package.json](package.json):

```json
{
  "dependencies": {
    "uuid": "^9.0.0",
    "bcryptjs": "^2.4.3"
  }
}
```

### Step 2: Update Existing Components

Modify [app/chart-tool/result.tsx](app/chart-tool/result.tsx) to include `TwoDiagramView`:

```tsx
import TwoDiagramView from './two-diagram-view'

// In your ResultPage component:
const [desiredDiagram, setDesiredDiagram] = useState(null)
const [collectedConstellations, setCollectedConstellations] = useState([])
const [userId, setUserId] = useState<string | null>(null)

useEffect(() => {
  // Load user from session
  // Load collected constellations
  // Load desired diagram if exists
}, [])

return (
  <>
    {/* Original result content */}
    
    <TwoDiagramView
      originalChartData={apiChartData}
      desiredDiagramData={desiredDiagram}
      collectedConstellations={collectedConstellations}
      onEditDesired={() => setShowDesiredEditor(true)}
      onCreateNewDesired={handleCreateNewDiagram}
    />
    
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
```

### Step 3: Create Auth Pages

Create [app/auth/login/page.tsx](app/auth/login/page.tsx) and [app/auth/register/page.tsx](app/auth/register/page.tsx) for user authentication flows.

### Step 4: Add QR Scanner

Implement QR code scanning (use a library like `jsqr` or `qr-scanner`):

```bash
npm install qr-scanner
```

Create [app/qr-scanner/page.tsx](app/qr-scanner/page.tsx) for scanning functionality.

### Step 5: Database Integration

**Important:** Current implementation uses in-memory storage. For production:

Replace in-memory Maps with a real database:

- **PostgreSQL** with Prisma ORM
- **MongoDB** with Mongoose
- **Firebase** with Realtime Database

Example Prisma schema to replace in-memory storage:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  passwordHash String
  constellations UserConstellation[]
  diagrams  DesiredDiagram[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Constellation {
  id        String   @id @default(cuid())
  name      String   @unique
  symbol    String
  emoji     String
  users     UserConstellation[]
}

model UserConstellation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  constellationId String
  constellation Constellation @relation(fields: [constellationId], references: [id])
  qrCodeId  String
  acquiredAt DateTime @default(now())
  isRedeemed Boolean  @default(true)
}

model DesiredDiagram {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  originalChartId String
  placements Json    // Store as JSON array
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  expiresAt DateTime
  isLocked  Boolean  @default(false)
  status    String   @default("active")
}
```

## QR Code Integration

### QR Code Mapping

Each physical product has a QR code that maps to a constellation:

```
Physical Product → QR Code → Constellation
Example:
- Product with Aries energy → QR code "QR_const_aries" → Unlocks Aries constellation
```

### Generating QR Codes

To generate QR codes for physical products, use a service like:

- **QR Code Generator API**
- **qrcode npm package**

```typescript
import QRCode from 'qrcode'

// Generate QR code containing the constellation ID
const qrData = `QR_const_aries` // This is scanned and sent to /api/qr/scan
const qrImageUrl = await QRCode.toDataURL(qrData)
// Use qrImageUrl for printing on products
```

## Flow Examples

### User Flow 1: Register and Create Desired Diagram

1. User registers/logs in
2. Birth chart is calculated → Original Diagram created (immutable)
3. User scans QR codes on products
4. Each QR adds a constellation to their collection
5. User creates Desired Diagram and places constellations
6. Diagram is saved and visible for 30 days
7. On expiration, user can reset (clear and extend 30 days) or lock

### User Flow 2: Prevent Duplicate QR Redemptions

1. User scans "Aries" QR code
2. Aries constellation added to collection
3. User scans same Aries QR code again
4. API returns: "Already collected Aries. No duplicate rewards."
5. No duplicate entry created

### User Flow 3: Auto-Expiration After 30 Days

1. Desired Diagram created on Day 0
2. Expiration Date = Day 0 + 30 days
3. On Day 30 at 24:00, diagram status → "expired"
4. Diagram auto-locks (cannot be edited)
5. User sees options to:
   - **Reset**: Clear placements and restart (new 30-day period)
   - **Create New**: Start fresh Desired Diagram

## Security Considerations

1. **Authentication**
   - Use JWT tokens or sessions
   - Validate user ownership before allowing edits
   - Expire sessions after 30 days

2. **QR Code Security**
   - Prevent scanning same QR twice
   - Store redemption history
   - Validate QR codes against active registry

3. **Data Validation**
   - Validate all placements (x, y must be 0-100)
   - Validate scale (0.5-2)
   - Validate rotation (0-360)
   - Verify constellation ownership before allowing placement

4. **Rate Limiting**
   - Limit QR scans per user per minute
   - Limit diagram updates per minute
   - Prevent brute force attacks on auth endpoints

## Testing QR Codes

Sample QR codes for testing (in-memory system):

```
QR_const_aries     → Aries ♈
QR_const_taurus    → Taurus ♉
QR_const_gemini    → Gemini ♊
QR_const_cancer    → Cancer ♋
QR_const_leo       → Leo ♌
QR_const_virgo     → Virgo ♍
QR_const_libra     → Libra ♎
QR_const_scorpio   → Scorpio ♏
QR_const_sagittarius → Sagittarius ♐
QR_const_capricorn → Capricorn ♑
QR_const_aquarius  → Aquarius ♒
QR_const_pisces    → Pisces ♓
```

## Production Checklist

- [ ] Replace in-memory storage with database
- [ ] Implement proper authentication (JWT/OAuth)
- [ ] Add rate limiting to API endpoints
- [ ] Implement background jobs for expiration checks
- [ ] Add input validation and sanitization
- [ ] Set up error logging and monitoring
- [ ] Add SSL/TLS certificates
- [ ] Set up CORS properly
- [ ] Implement backups and disaster recovery
- [ ] Add analytics tracking
- [ ] Set up performance monitoring
- [ ] Prepare deployment pipeline

## Future Enhancements

1. **Social Features**
   - Share desired diagrams with friends
   - Compare your original vs desired diagram
   - Community constellation gallery

2. **Advanced Placements**
   - Predefined constellation templates
   - Guided placement suggestions
   - Constellation synergy scoring

3. **Extended Expiration**
   - Premium: Lock diagram permanently
   - Premium: Extend expiration beyond 30 days
   - Premium: Create multiple active diagrams

4. **Integration**
   - Email reminders before expiration
   - Push notifications for QR scan rewards
   - Calendar integration for expiration tracking

5. **Analytics**
   - Track which constellations are most popular
   - User engagement metrics
   - Reset vs lock patterns
