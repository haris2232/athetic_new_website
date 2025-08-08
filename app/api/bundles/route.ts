import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/bundles/public/active`
    if (category) {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/bundles/public/active/${category}`
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
} 