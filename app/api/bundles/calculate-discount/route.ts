import { NextRequest, NextResponse } from 'next/server'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew/api'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItems } = body

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/bundles/public/calculate-discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error calculating bundle discount:', error)
    return NextResponse.json(
      { error: 'Failed to calculate bundle discount' },
      { status: 500 }
    )
  }
} 