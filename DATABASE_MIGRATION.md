# Database Migration Guide - From In-Memory to PostgreSQL

This guide explains how to migrate from the current in-memory storage to a production-ready database.

## Why Migrate?

Current in-memory storage:
- ❌ Data lost on server restart
- ❌ Not scalable
- ❌ No persistence
- ❌ Only suitable for development

PostgreSQL provides:
- ✅ Persistent storage
- ✅ ACID compliance
- ✅ Scalability
- ✅ Query flexibility
- ✅ Built-in security

## Option 1: PostgreSQL + Prisma (Recommended)

### Step 1: Install Dependencies

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Step 2: Configure Environment

Create `.env.local`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/birth_chart"
```

### Step 3: Create Prisma Schema

File: `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  passwordHash String
  
  sessions  SessionToken[]
  constellations UserConstellation[]
  diagrams  DesiredDiagram[]
  originalCharts OriginalChart[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Constellation {
  id        String   @id @default(cuid())
  name      String   @unique
  symbol    String
  emoji     String
  description String?
  imageUrl  String?
  
  qrCodes   QRCode[]
  userConstellations UserConstellation[]
  placements DiagramPlacement[]
  
  createdAt DateTime @default(now())
}

model QRCode {
  id        String   @id @default(cuid())
  code      String   @unique
  constellationId String
  constellation Constellation @relation(fields: [constellationId], references: [id])
  
  isActive  Boolean  @default(true)
  userScans UserConstellation[]
  
  createdAt DateTime @default(now())
  expiresAt DateTime?
}

model UserConstellation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  constellationId String
  constellation Constellation @relation(fields: [constellationId], references: [id], onDelete: Cascade)
  
  qrCodeId  String
  qrCode    QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  
  acquiredAt DateTime @default(now())
  isRedeemed Boolean  @default(true)
  
  @@unique([userId, constellationId])
}

model OriginalChart {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  birthName String
  birthDate String
  birthTime String
  birthLocation String
  latitude  Float
  longitude Float
  
  chartData Json
  
  desiredDiagrams DesiredDiagram[]
  
  createdAt DateTime @default(now())
}

model DesiredDiagram {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  originalChartId String
  originalChart OriginalChart @relation(fields: [originalChartId], references: [id], onDelete: Cascade)
  
  placements DiagramPlacement[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  expiresAt DateTime
  isLocked  Boolean  @default(false)
  status    String   @default("active") // active, expired, reset
}

model DiagramPlacement {
  id        String   @id @default(cuid())
  diagramId String
  diagram   DesiredDiagram @relation(fields: [diagramId], references: [id], onDelete: Cascade)
  
  constellationId String
  constellation Constellation @relation(fields: [constellationId], references: [id], onDelete: Cascade)
  
  positionX Float   // 0-100
  positionY Float   // 0-100
  zIndex    Int
  scale     Float   @default(1.0)
  rotation  Float   @default(0) // 0-360 degrees
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SessionToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token     String   @unique
  expiresAt DateTime
  
  createdAt DateTime @default(now())
}

// Indexes for common queries
model _AuditLog {
  id        String   @id @default(cuid())
  action    String
  userId    String?
  targetId  String?
  targetType String
  changes   Json?
  
  createdAt DateTime @default(now())
}
```

### Step 4: Run Migrations

```bash
npx prisma migrate dev --name init
```

### Step 5: Update API Routes

Replace the in-memory Maps with Prisma queries.

#### Auth API (`app/api/auth/route.ts`)

```typescript
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (request.nextUrl.pathname.includes('/register')) {
      const { email, name, password } = body

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash password
      const passwordHash = await hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      })

      // Create session token
      const token = uuidv4()
      const session = await prisma.sessionToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token,
      })
    }

    // Login
    if (request.nextUrl.pathname.includes('/login')) {
      const { email, password } = body

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const passwordMatch = await compare(password, user.passwordHash)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const token = uuidv4()
      await prisma.sessionToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token,
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### QR Scan API (`app/api/qr/scan/route.ts`)

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { qrCode, userId } = await request.json()

    if (!qrCode || !userId) {
      return NextResponse.json(
        { error: 'Missing qrCode or userId' },
        { status: 400 }
      )
    }

    // Find QR code
    const qr = await prisma.qRCode.findUnique({
      where: { code: qrCode },
      include: { constellation: true },
    })

    if (!qr || !qr.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code' },
        { status: 404 }
      )
    }

    // Check if user already has this constellation
    const existing = await prisma.userConstellation.findFirst({
      where: {
        userId,
        constellationId: qr.constellationId,
      },
    })

    const isNewConstellation = !existing

    // Create or update user constellation
    if (existing) {
      // Already redeemed, don't add duplicate
      return NextResponse.json({
        success: true,
        constellationName: qr.constellation.name,
        message: `Already collected ${qr.constellation.name}. No duplicate rewards.`,
        isNewConstellation: false,
        constellation: qr.constellation,
      })
    }

    // Add new constellation to user
    await prisma.userConstellation.create({
      data: {
        userId,
        constellationId: qr.constellationId,
        qrCodeId: qr.id,
        isRedeemed: true,
      },
    })

    return NextResponse.json({
      success: true,
      constellationName: qr.constellation.name,
      message: `✨ New constellation unlocked: ${qr.constellation.name}!`,
      isNewConstellation: true,
      constellation: qr.constellation,
    })
  } catch (error) {
    console.error('QR scan error:', error)
    return NextResponse.json(
      { error: 'Failed to process QR code' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const collected = await prisma.userConstellation.findMany({
      where: { userId },
      include: { constellation: true },
    })

    return NextResponse.json({
      success: true,
      userId,
      collectedCount: collected.length,
      collected: collected.map((uc) => uc.constellation),
    })
  } catch (error) {
    console.error('Collection fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}
```

#### Diagrams API (`app/api/diagrams/route.ts`)

```typescript
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, diagramId, placements } = await request.json()

    if (request.nextUrl.pathname.includes('/create')) {
      const originalChartId = request.body?.originalChartId

      const diagram = await prisma.desiredDiagram.create({
        data: {
          userId,
          originalChartId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      return NextResponse.json({
        success: true,
        diagram,
      })
    }

    if (request.nextUrl.pathname.includes('/update')) {
      const diagram = await prisma.desiredDiagram.findUnique({
        where: { id: diagramId },
      })

      if (!diagram || diagram.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Delete old placements
      await prisma.diagramPlacement.deleteMany({
        where: { diagramId },
      })

      // Create new placements
      for (const placement of placements) {
        await prisma.diagramPlacement.create({
          data: {
            diagramId,
            constellationId: placement.constellationId,
            positionX: placement.position.x,
            positionY: placement.position.y,
            zIndex: placement.zIndex,
            scale: placement.scale,
            rotation: placement.rotation,
          },
        })
      }

      const updated = await prisma.desiredDiagram.update({
        where: { id: diagramId },
        data: { updatedAt: new Date() },
        include: { placements: true },
      })

      return NextResponse.json({
        success: true,
        diagram: updated,
      })
    }

    // Similar for lock, reset, get...
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  } catch (error) {
    console.error('Diagram operation error:', error)
    return NextResponse.json(
      { error: 'Failed to process' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const diagramId = request.nextUrl.searchParams.get('diagramId')

    if (diagramId) {
      const diagram = await prisma.desiredDiagram.findUnique({
        where: { id: diagramId },
        include: { placements: true },
      })

      if (!diagram || diagram.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        diagram,
      })
    }

    const diagrams = await prisma.desiredDiagram.findMany({
      where: { userId },
      include: { placements: true },
    })

    return NextResponse.json({
      success: true,
      diagrams,
    })
  } catch (error) {
    console.error('Diagram fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
```

### Step 6: Create Prisma Client Instance

File: `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Option 2: MongoDB + Mongoose

Similar approach but with MongoDB:

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

Create models in `lib/models/` directory and update API routes.

## Option 3: Firebase

Use Firebase Realtime Database or Firestore:

```bash
npm install firebase-admin
```

## Migration Checklist

- [ ] Choose database (PostgreSQL recommended)
- [ ] Install and configure chosen database
- [ ] Create schema/models
- [ ] Run migrations
- [ ] Update all API routes to use database
- [ ] Add error handling
- [ ] Test all endpoints
- [ ] Set up database backups
- [ ] Configure environment variables
- [ ] Test in staging environment
- [ ] Deploy to production

## Common Issues & Solutions

### Connection Issues
```bash
# Test PostgreSQL connection
psql -U user -d birth_chart -h localhost
```

### Schema Issues
```bash
# Reset database (development only!)
npx prisma migrate reset

# View current schema
npx prisma studio
```

### Data Migration
```bash
# Create migration
npx prisma migrate dev --name migration_name
```

## Performance Optimization

1. **Add Indexes**
   - On `userId` for faster queries
   - On `expiresAt` for expiration checks

2. **Query Optimization**
   - Use `select` to fetch only needed fields
   - Batch operations where possible

3. **Caching**
   - Consider Redis for session tokens
   - Cache frequently accessed data

## Backup & Disaster Recovery

```bash
# PostgreSQL backup
pg_dump birth_chart > backup.sql

# PostgreSQL restore
psql birth_chart < backup.sql
```

## Support

For Prisma documentation: https://www.prisma.io/docs
For PostgreSQL documentation: https://www.postgresql.org/docs
