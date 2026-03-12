# Developer Integration Checklist

Complete this checklist to fully integrate the two-diagram system into your application.

## 📦 Phase 1: Setup & Dependencies (30 mins)

- [ ] Run `npm install uuid bcryptjs @types/uuid`
- [ ] Verify new files created in correct locations
- [ ] Check TypeScript compilation (`npm run build`)
- [ ] Verify no import errors in editor

**Files to verify:**
- ✅ `lib/types.ts` - Data types
- ✅ `lib/diagram-utils.ts` - Utility functions
- ✅ `app/api/auth/route.ts` - Auth endpoints
- ✅ `app/api/qr/scan/route.ts` - QR endpoints
- ✅ `app/api/diagrams/route.ts` - Diagram endpoints
- ✅ `app/chart-tool/desired-diagram-editor.tsx` - Editor component
- ✅ `app/chart-tool/two-diagram-view.tsx` - View component
- ✅ Documentation files

## 🧪 Phase 2: API Testing (45 mins)

### Test Authentication API
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "secure_password"
  }'
```
- [ ] Returns success with user data and token
- [ ] Duplicate email returns error

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure_password"
  }'
```
- [ ] Valid credentials return token
- [ ] Invalid credentials return 401

### Test QR Scan API
```bash
# First scan - should be new
curl -X POST http://localhost:3000/api/qr/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "QR_const_aries",
    "userId": "test_user_1"
  }'
```
- [ ] Returns `isNewConstellation: true`
- [ ] Constellation data included

```bash
# Second scan of same QR - should prevent duplicate
curl -X POST http://localhost:3000/api/qr/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "QR_const_aries",
    "userId": "test_user_1"
  }'
```
- [ ] Returns `isNewConstellation: false`
- [ ] Duplicate prevention message shown
- [ ] No duplicate entry created

```bash
# Get collected constellations
curl http://localhost:3000/api/qr/scan?userId=test_user_1
```
- [ ] Returns array of collected constellations
- [ ] Count is accurate

### Test Diagram API
```bash
# Create diagram
curl -X POST http://localhost:3000/api/diagrams/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "originalChartId": "chart_123"
  }'
```
- [ ] Returns diagram with ID
- [ ] Expiration date is 30 days from now
- [ ] Status is "active"
- [ ] `isLocked` is false

```bash
# Update placements
curl -X POST http://localhost:3000/api/diagrams/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "diagramId": "diagram_id_from_above",
    "placements": [
      {
        "id": "p1",
        "constellationId": "const_aries",
        "position": { "x": 25, "y": 25 },
        "zIndex": 0,
        "scale": 1.5,
        "rotation": 45
      }
    ]
  }'
```
- [ ] Placements saved successfully
- [ ] Can retrieve with GET request

```bash
# Get diagrams
curl http://localhost:3000/api/diagrams?userId=test_user_1
```
- [ ] Returns user's diagrams
- [ ] Placements are included

```bash
# Lock diagram
curl -X POST http://localhost:3000/api/diagrams/lock \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "diagramId": "diagram_id"
  }'
```
- [ ] `isLocked` becomes true
- [ ] Updates `updatedAt` timestamp

```bash
# Reset diagram
curl -X POST http://localhost:3000/api/diagrams/reset \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "diagramId": "diagram_id"
  }'
```
- [ ] Placements cleared
- [ ] `isLocked` becomes false
- [ ] `expiresAt` extended by 30 days
- [ ] Status returns to "active"

## 🎨 Phase 3: Component Integration (1 hour)

### Update Result Page
In [app/chart-tool/result.tsx](../app/chart-tool/result.tsx):

- [ ] Import `TwoDiagramView` component
- [ ] Import `DesiredDiagramEditor` component
- [ ] Add state for `userId`, `collectedConstellations`, `desiredDiagram`
- [ ] Add `useEffect` to load user from session
- [ ] Add `useEffect` to load collected constellations
- [ ] Add `useEffect` to load desired diagram
- [ ] Implement `handleCreateNewDiagram()`
- [ ] Implement `handleSaveDiagram()`
- [ ] Implement `handleResetDiagram()`
- [ ] Render `<TwoDiagramView />` component
- [ ] Conditionally render `<DesiredDiagramEditor />` when in edit mode

**Reference:** See [result-page-example.tsx](../app/chart-tool/result-page-example.tsx)

### Test Component Rendering
- [ ] TwoDiagramView renders without errors
- [ ] Original Diagram displays
- [ ] Desired Diagram shows empty state (no diagram yet)
- [ ] Collect Constellations list visible
- [ ] Create button appears
- [ ] No console errors

### Test Editor Component
- [ ] After creating diagram, editor appears
- [ ] Can drag constellation from sidebar to canvas
- [ ] Constellation appears on canvas
- [ ] Can adjust scale with slider
- [ ] Can adjust rotation with slider
- [ ] Can remove placement
- [ ] Can save placements
- [ ] Save updates state correctly

## 🔐 Phase 4: Authentication Integration (1 hour)

- [ ] Create [app/auth/register/page.tsx](../app/auth/register/page.tsx)
- [ ] Create [app/auth/login/page.tsx](../app/auth/login/page.tsx)
- [ ] Implement registration form
- [ ] Implement login form
- [ ] Store auth token in localStorage/cookies
- [ ] Check token on app load
- [ ] Redirect to login if not authenticated
- [ ] Clear token on logout
- [ ] Add auth check middleware (optional)

**Test:**
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token stored correctly
- [ ] Can access protected pages
- [ ] Logout clears token

## 📱 Phase 5: QR Scanner Integration (1-2 hours)

- [ ] Install QR scanner library: `npm install qr-scanner`
- [ ] Create [app/qr-scanner/page.tsx](../app/qr-scanner/page.tsx)
- [ ] Implement camera access
- [ ] Implement QR detection
- [ ] Call `/api/qr/scan` endpoint
- [ ] Show success/error messages
- [ ] Update constellation collection
- [ ] Add link from main app to scanner

**Test:**
- [ ] Can access scanner page
- [ ] Camera permission requested
- [ ] Can detect QR codes
- [ ] Collection updates on scan
- [ ] Duplicate prevention works

## 🗄️ Phase 6: Database Migration (2-4 hours)

**When ready for production:**

- [ ] Choose database (PostgreSQL recommended)
- [ ] Install Prisma: `npm install @prisma/client`
- [ ] Install Prisma CLI: `npm install -D prisma`
- [ ] Create database
- [ ] Copy schema from [DATABASE_MIGRATION.md](../DATABASE_MIGRATION.md)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Update `/api/auth/route.ts` to use Prisma
- [ ] Update `/api/qr/scan/route.ts` to use Prisma
- [ ] Update `/api/diagrams/route.ts` to use Prisma
- [ ] Test all endpoints with database
- [ ] Verify data persistence after restart

## 📊 Phase 7: End-to-End Testing (1 hour)

### Complete User Journey
- [ ] Register new user
- [ ] Generate birth chart
- [ ] View Original Diagram
- [ ] Scan multiple QR codes (test duplicate prevention)
- [ ] See collected constellations
- [ ] Create Desired Diagram
- [ ] Place constellations on canvas
- [ ] Adjust scale/rotation
- [ ] Save diagram
- [ ] See both diagrams side-by-side
- [ ] Edit existing diagram
- [ ] Lock diagram
- [ ] Reset diagram (if expired)
- [ ] View expiration countdown

### Edge Cases
- [ ] Try to place same constellation twice
- [ ] Try to edit locked diagram
- [ ] Try to reset non-expired diagram
- [ ] Try to access another user's diagram (should fail)
- [ ] Try invalid QR code
- [ ] Try duplicate email registration

## 🐛 Phase 8: Bug Fixes & Polish (varies)

### UI/UX Polish
- [ ] Responsive design on mobile
- [ ] Touch events work on mobile
- [ ] Loading states appear
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Buttons are properly disabled
- [ ] Keyboard accessibility tested

### Performance
- [ ] API responses are fast (< 200ms)
- [ ] Component rendering is smooth
- [ ] No memory leaks
- [ ] Images are optimized
- [ ] Bundle size acceptable

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid data shows error
- [ ] Missing fields caught
- [ ] Session expires correctly
- [ ] Server errors logged

## 📚 Phase 9: Documentation (30 mins)

- [ ] Add comments to custom code
- [ ] Create deployment guide
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Document API for frontend team
- [ ] Create user guide/tutorial

## 🚀 Phase 10: Deployment Preparation

- [ ] Set up environment variables in production
- [ ] Configure database backups
- [ ] Set up error logging (e.g., Sentry)
- [ ] Configure monitoring
- [ ] Set up CI/CD pipeline
- [ ] Plan database migrations
- [ ] Create rollback plan
- [ ] Document deployment process

## ✅ Final Verification

Before going live, verify:

- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] TypeScript compilation clean
- [ ] All features working as specified
- [ ] Performance acceptable
- [ ] Security best practices followed
- [ ] Database backed up
- [ ] Monitoring in place
- [ ] Documentation up to date
- [ ] Team trained on new system

## 📋 Quick Reference

### Key Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/qr/scan` - Scan QR code
- `GET /api/qr/scan?userId=...` - Get collections
- `POST /api/diagrams/create` - Create diagram
- `POST /api/diagrams/update` - Update placements
- `POST /api/diagrams/lock` - Lock diagram
- `POST /api/diagrams/reset` - Reset diagram
- `GET /api/diagrams?userId=...` - Get diagrams

### Key Components
- `DesiredDiagramEditor` - Interactive diagram editor
- `TwoDiagramView` - Side-by-side display
- `result-page-example.tsx` - Integration example

### Key Functions
- `getTimeRemaining()` - Calculate expiration
- `formatTimeRemaining()` - Format time display
- `calculateExpirationDate()` - Get 30-day date
- `getSuggestedActions()` - Get next actions

### Sample QR Codes
```
QR_const_aries, QR_const_taurus, QR_const_gemini,
QR_const_cancer, QR_const_leo, QR_const_virgo,
QR_const_libra, QR_const_scorpio, QR_const_sagittarius,
QR_const_capricorn, QR_const_aquarius, QR_const_pisces
```

## 🎯 Success Criteria

✅ Implementation is complete when:
1. All APIs functional and tested
2. Components integrated into result page
3. User can scan QR codes
4. User can create and edit Desired Diagram
5. Diagrams persist between sessions
6. Expiration and reset work correctly
7. Duplicate QR prevention works
8. No console errors
9. Mobile responsive
10. Documentation complete

---

**Estimated Total Time: 8-16 hours depending on experience level and database migration**

Good luck! 🚀
