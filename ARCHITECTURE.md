# System Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Birth Chart Application                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Components                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────────┐  │
│  │  TwoDiagramView      │         │ DesiredDiagramEditor     │  │
│  ├──────────────────────┤         ├──────────────────────────┤  │
│  │ • Original Diagram   │         │ • Canvas                 │  │
│  │ • Desired Diagram    │         │ • Constellation Grid     │  │
│  │ • Status Display     │         │ • Control Panel          │  │
│  │ • Expiration Timer   │         │ • Scale/Rotation Sliders │  │
│  │ • Action Buttons     │         │ • Save/Reset Functions   │  │
│  └──────────────────────┘         └──────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────────┐  │
│  │  Auth Pages          │         │ QR Scanner Page          │  │
│  ├──────────────────────┤         ├──────────────────────────┤  │
│  │ • Register Form      │         │ • Camera Access          │  │
│  │ • Login Form         │         │ • QR Detection           │  │
│  │ • Token Storage      │         │ • Scan Feedback          │  │
│  └──────────────────────┘         └──────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/JSON
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend APIs (Next.js)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │
│  │   /api/auth/        │  │   /api/qr/scan/             │    │
│  ├──────────────────────┤  ├──────────────────────────────┤    │
│  │ POST register        │  │ POST scan QR code           │    │
│  │ POST login           │  │ GET user collections        │    │
│  └──────────────────────┘  └──────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           /api/diagrams/                               │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ POST create - Create new diagram                       │    │
│  │ POST update - Update placements                        │    │
│  │ POST lock   - Lock diagram                             │    │
│  │ POST reset  - Reset diagram                            │    │
│  │ GET         - Retrieve diagrams                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Data Persistence
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Development (In-Memory):                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Maps: users, sessions, qrCodes, diagrams, placements   │  │
│  │ (Data lost on restart)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Production (PostgreSQL):                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Users Table           • Constellations Table            │  │
│  │ SessionTokens Table   • QRCodes Table                   │  │
│  │ UserConstellations    • DesiredDiagrams Table           │  │
│  │ OriginalCharts Table  • DiagramPlacements Table         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. QR Code Collection Flow

```
Physical Product
      │
      ├─ QR Code Label
      │  (e.g., "QR_const_aries")
      │
      ▼
User Scans QR
      │
      ▼
POST /api/qr/scan
{
  qrCode: "QR_const_aries",
  userId: "user_123"
}
      │
      ▼
Server Validates QR
      ├─ Lookup constellation: Aries ♈
      ├─ Check duplicate: Already owned?
      └─ Create entry if new
      │
      ▼
Response
{
  success: true,
  constellation: { name: "Aries", emoji: "🐏" },
  isNewConstellation: true  ← Prevents duplicates
}
      │
      ▼
Update UI
├─ Add to collection
├─ Show success message
└─ Update count
```

### 2. Desired Diagram Creation Flow

```
User Clicks "Create Desired Diagram"
      │
      ▼
POST /api/diagrams/create
{
  userId: "user_123",
  originalChartId: "chart_123"
}
      │
      ▼
Server Creates Diagram
├─ Generate diagramId
├─ Set expiresAt = now + 30 days
├─ Set isLocked = false
├─ Set status = "active"
└─ Initialize placements = []
      │
      ▼
Return Diagram
{
  id: "diagram_456",
  expiresAt: "2025-03-28",
  isLocked: false,
  status: "active",
  placements: []
}
      │
      ▼
Show Editor Component
├─ Display collected constellations
├─ Display empty canvas
└─ Enable drag-and-drop
```

### 3. Placement Update Flow

```
User Places Constellation
      │
      ├─ Drags emoji from sidebar
      ├─ Positions on canvas
      ├─ Adjusts scale (slider 0.5-2x)
      ├─ Adjusts rotation (slider 0-360°)
      └─ Clicks Save
      │
      ▼
POST /api/diagrams/update
{
  userId: "user_123",
  diagramId: "diagram_456",
  placements: [
    {
      id: "p1",
      constellationId: "const_aries",
      position: { x: 25, y: 25 },
      zIndex: 0,
      scale: 1.5,
      rotation: 45
    }
  ]
}
      │
      ▼
Server Validates
├─ Verify user ownership
├─ Check diagram not locked
├─ Check diagram not expired
├─ Validate placement data
│  ├─ x: 0-100 ✓
│  ├─ y: 0-100 ✓
│  ├─ scale: 0.5-2 ✓
│  └─ rotation: 0-360 ✓
└─ Save to storage
      │
      ▼
Return Updated Diagram
{
  id: "diagram_456",
  placements: [{ ...saved placement }],
  updatedAt: "2025-02-26T10:30:00Z"
}
      │
      ▼
Update UI
├─ Dismiss save loading
├─ Show success message
└─ Update preview
```

### 4. Expiration & Reset Flow

```
Timeline:
Day 0: Diagram Created
├─ expiresAt = Day 30 24:00
├─ status = "active"
└─ isLocked = false

Day 29: User Sees Warning
├─ "1 day remaining"
└─ Can edit or lock

Day 30 24:00: Auto-Expiration
├─ status = "expired"
├─ isLocked = true (auto-lock)
└─ Cannot edit

User Action: Reset
      │
      ▼
POST /api/diagrams/reset
{
  userId: "user_123",
  diagramId: "diagram_456"
}
      │
      ▼
Server Processes Reset
├─ Delete all placements
├─ expiresAt = now + 30 days
├─ status = "active"
└─ isLocked = false
      │
      ▼
Return Reset Diagram
{
  placements: [],
  expiresAt: "2025-03-28",
  status: "active",
  isLocked: false
}
      │
      ▼
User Can Build New Diagram
```

### 5. Lock Flow

```
User Wants to Preserve Diagram
      │
      ▼
POST /api/diagrams/lock
{
  userId: "user_123",
  diagramId: "diagram_456"
}
      │
      ▼
Server Locks Diagram
├─ isLocked = true
└─ updatedAt = now
      │
      ▼
Response
{
  success: true,
  diagram: { isLocked: true }
}
      │
      ▼
UI Changes
├─ Disable edit button
├─ Disable remove buttons
├─ Disable scale/rotation sliders
├─ Show lock icon
└─ Show message: "🔒 This diagram is locked"
```

## Database Schema

```
Users
├─ id (PK)
├─ email (UNIQUE)
├─ name
├─ passwordHash
├─ createdAt
└─ updatedAt

Constellations (Static)
├─ id (PK)
├─ name (e.g., "Aries")
├─ symbol (e.g., "♈")
├─ emoji (e.g., "🐏")
└─ description

QRCodes
├─ id (PK)
├─ code (UNIQUE, e.g., "QR_const_aries")
├─ constellationId (FK)
├─ isActive
├─ createdAt
└─ expiresAt

UserConstellations (Collection)
├─ id (PK)
├─ userId (FK)
├─ constellationId (FK)
├─ qrCodeId (FK)
├─ acquiredAt
├─ isRedeemed
└─ UNIQUE(userId, constellationId) ← Prevents duplicates

OriginalCharts (Immutable)
├─ id (PK)
├─ userId (FK)
├─ birthName
├─ birthDate
├─ birthTime
├─ birthLocation
├─ latitude
├─ longitude
├─ chartData (JSON)
└─ createdAt

DesiredDiagrams
├─ id (PK)
├─ userId (FK)
├─ originalChartId (FK)
├─ expiresAt
├─ isLocked
├─ status (active|expired|reset)
├─ createdAt
└─ updatedAt

DiagramPlacements
├─ id (PK)
├─ diagramId (FK)
├─ constellationId (FK)
├─ positionX (0-100)
├─ positionY (0-100)
├─ zIndex
├─ scale (0.5-2)
├─ rotation (0-360)
├─ createdAt
└─ updatedAt

SessionTokens
├─ id (PK)
├─ userId (FK)
├─ token (UNIQUE)
├─ expiresAt
└─ createdAt
```

## State Management Flow

### Component State Example

```
ResultPage Component
├─ userId: string | null
├─ isAuthenticated: boolean
├─ collectedConstellations: Constellation[]
├─ desiredDiagram: DesiredDiagram | null
├─ originalChartData: any
├─ showDesiredEditor: boolean
└─ isSaving: boolean

Effects:
├─ useEffect([])
│  └─ loadUser() → setUserId, setIsAuthenticated
├─ useEffect([userId])
│  ├─ loadCollectedConstellations() → setCollectedConstellations
│  └─ loadDesiredDiagram() → setDesiredDiagram
└─ useEffect([showDesiredEditor])
   └─ resetIfNeeded()

Event Handlers:
├─ handleCreateNewDesired()
│  └─ POST /api/diagrams/create
│     └─ setDesiredDiagram()
│     └─ setShowDesiredEditor(true)
├─ handleSaveDiagram(placements)
│  └─ POST /api/diagrams/update
│     └─ setDesiredDiagram()
│     └─ setShowDesiredEditor(false)
└─ handleResetDiagram()
   └─ POST /api/diagrams/reset
      └─ setDesiredDiagram()
```

## Duplicate Prevention Logic

```
User Scans QR Code
      │
      ▼
Check: Does UserConstellation exist?
├─ Query: UserConstellations
│          WHERE userId = user_123
│          AND constellationId = const_aries
│
├─ Result: FOUND
│  └─ Return: "Already collected Aries"
│     └─ isNewConstellation = false
│     └─ No new entry created
│     └─ No reward given
│
└─ Result: NOT FOUND
   └─ Create new UserConstellation entry
   └─ Return: "New constellation unlocked: Aries"
   └─ isNewConstellation = true
   └─ Constellation added to collection
```

## Expiration Logic

```
Diagram State Check:
      │
      ├─ Current Time > expiresAt?
      │  ├─ YES → status = "expired", isLocked = true
      │  └─ NO → continue
      │
      ├─ Days until expiration:
      │  ├─ > 3 days: No warning
      │  ├─ 1-3 days: "Expires soon" warning
      │  └─ 0 days: "Expiring today" warning
      │
      └─ User Options:
         ├─ If NOT expired:
         │  ├─ Edit diagram
         │  └─ Lock diagram
         ├─ If expired:
         │  ├─ View locked diagram
         │  ├─ Reset (new 30-day period)
         │  └─ Create new diagram
         └─ If locked:
            └─ View only
```

## Error Handling Flow

```
API Request
      │
      ▼
Validate Input
├─ Missing fields? → Return 400
├─ Invalid format? → Return 400
└─ Invalid data? → Return 400
      │
      ▼
Check Authorization
├─ User not authenticated? → Return 401
├─ User doesn't own resource? → Return 403
└─ OK → Continue
      │
      ▼
Business Logic
├─ Resource not found? → Return 404
├─ Duplicate entry? → Return 409
├─ Expired/Locked? → Return 410
└─ OK → Process request
      │
      ▼
Database Operation
├─ Connection error? → Return 500
├─ Query error? → Return 500
└─ Success → Continue
      │
      ▼
Return Success Response
{
  success: true,
  data: { ... }
}
```

## Performance Considerations

```
Frontend:
├─ Component Memoization
│  └─ Prevent unnecessary re-renders
├─ Lazy Loading
│  └─ Load components on demand
└─ Image Optimization
   └─ Use next/image

Backend:
├─ Database Indexes
│  ├─ userId (QRCodes, UserConstellations)
│  ├─ constellationId
│  └─ expiresAt (for expiration queries)
├─ Query Optimization
│  ├─ Use SELECT specific columns
│  ├─ Join only needed tables
│  └─ Batch operations
└─ Caching
   ├─ Cache constellation list (static)
   ├─ Cache user collections (TTL 5min)
   └─ Cache diagram data (TTL 1min)

API:
├─ Response Caching
│  └─ Cache GET requests
├─ Request Batching
│  └─ Reduce API calls
└─ Compression
   └─ gzip responses
```

## Security Architecture

```
User Registration/Login
      │
      ▼
Password Hashing (bcryptjs)
├─ Hash password
└─ Store hash only (never plain text)
      │
      ▼
Session Token Generation
├─ Generate UUID
├─ Set expiration (30 days)
└─ Store token securely
      │
      ▼
API Authorization
├─ Check token validity
├─ Verify user ownership
└─ Validate permissions
      │
      ▼
Data Validation
├─ Input sanitization
├─ Type checking
└─ Business rule validation
      │
      ▼
Rate Limiting (Future)
├─ Limit API calls per minute
└─ Prevent brute force attacks
```

This architecture provides scalability, security, and maintainability for your two-diagram system.
