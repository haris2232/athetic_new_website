import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://athlekt.com/backendnew/api'

// Mock settings data - in a real app, this would come from a database
let settings = {
  currency: "USD",
  homepageImage1: "",
  homepageImage1Type: "image",
  homepageImage2: "",
  homepageImage3: "",
  homepageImage4: "",
  homepageImage5: "",
  homepageImage6: "",
  homepageImage7: ""
}

export async function GET() {
  // Try to get settings from backend first
  try {
    const response = await fetch(`${API_BASE_URL}/settings/public`)
    if (response.ok) {
      const backendSettings = await response.json()
      // Merge all settings including homepage images
      settings = { 
        ...settings, 
        ...backendSettings,
        // Ensure all homepage image fields are included
        homepageImage1: backendSettings.homepageImage1 || '',
        homepageImage1Type: backendSettings.homepageImage1Type || 'image',
        homepageImage2: backendSettings.homepageImage2 || '',
        homepageImage3: backendSettings.homepageImage3 || '',
        homepageImage4: backendSettings.homepageImage4 || '',
        homepageImage5: backendSettings.homepageImage5 || '',
        homepageImage6: backendSettings.homepageImage6 || '',
        homepageImage7: backendSettings.homepageImage7 || ''
      }
    }
  } catch (error) {
    console.error('Failed to fetch from backend:', error)
  }

  return NextResponse.json(settings, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Update local settings
    settings = { ...settings, ...body }
    
    // Also update the backend
    try {
      const backendResponse = await fetch('https://athlekt.com/backendnew/api/settings/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settingsData: JSON.stringify(body)
        }),
      })
      
      if (backendResponse.ok) {
        console.log('Successfully synced currency to backend')
      } else {
        console.error('Failed to sync to backend:', backendResponse.status)
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error)
    }
    
    return NextResponse.json(settings, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 