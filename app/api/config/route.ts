import { NextResponse, NextRequest } from 'next/server'
import clientPromise from '@/app/lib/mongodb'

const DB_NAME = 'printbrawl'
const CONFIG_COLLECTION = 'config'

// Middleware to check authentication
function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  const authHeader = request.headers.get('authorization')
  
  // Allow if token exists (simplified - in production, verify token properly)
  return !!(token || authHeader?.startsWith('Bearer '))
}

// GET - Read config
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(CONFIG_COLLECTION)
    
    // Try to get config, if not found return default
    const config = await collection.findOne({ _id: 'main' } as any)
    
    if (config) {
      // Remove _id from response
      const { _id, ...configData } = config as any
      return NextResponse.json(configData)
    }
    
    // Return default config if not found
    const defaultConfig = {
      designA: {
        name: "Design A",
        image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=800&fit=crop&q=80",
        mockups: [
          "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=800&fit=crop&q=80"
        ],
        purchases: 127,
        link: "YOUR_GUMROAD_DESIGN_A_LINK"
      },
      designB: {
        name: "Design B",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=800&fit=crop&q=80",
        mockups: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=800&fit=crop&q=80"
        ],
        purchases: 143,
        link: "YOUR_GUMROAD_DESIGN_B_LINK"
      },
      price: "24.99",
      heroText: "Your purchase is your vote. The champion stays in the collection. The loser is vaulted forever. Choose your design—and protect your phone in style.",
      features: [
        "Military-grade shock absorption keeps your phone safe from drops and impacts.",
        "Compatible with iPhone & Samsung models. Precise cutouts for all ports and buttons.",
        "Durable TPU with polycarbonate backing. Lightweight, slim, and built to last."
      ],
      nextDropDate: null
    }
    return NextResponse.json(defaultConfig)
  } catch (error) {
    console.error('Config error:', error)
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }
}

// PUT - Update config
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.designA || !body.designB || !body.price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const config = {
      _id: 'main',
      designA: {
        name: body.designA.name || "Design A",
        image: body.designA.image || "",
        mockups: Array.isArray(body.designA.mockups) ? body.designA.mockups.filter((m: string) => m.trim()) : [],
        purchases: parseInt(body.designA.purchases) || 0,
        link: body.designA.link || ""
      },
      designB: {
        name: body.designB.name || "Design B",
        image: body.designB.image || "",
        mockups: Array.isArray(body.designB.mockups) ? body.designB.mockups.filter((m: string) => m.trim()) : [],
        purchases: parseInt(body.designB.purchases) || 0,
        link: body.designB.link || ""
      },
      price: body.price || "24.99",
      heroText: body.heroText || "",
      features: body.features || [],
      nextDropDate: body.nextDropDate || null
    }
    
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(CONFIG_COLLECTION)
    
    // Upsert config
    await collection.updateOne(
      { _id: 'main' } as any,
      { $set: config } as any,
      { upsert: true }
    )
    
    // Remove _id from response
    const { _id, ...configData } = config
    return NextResponse.json({ success: true, config: configData })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
