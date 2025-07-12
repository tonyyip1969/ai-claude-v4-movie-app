import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const settings = movieDB.getAllSettings();
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update settings (single or bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected object with key-value pairs.' },
        { status: 400 }
      );
    }

    // Convert all values to strings for database storage
    const settings: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof key !== 'string') {
        return NextResponse.json(
          { error: 'Invalid key type. All keys must be strings.' },
          { status: 400 }
        );
      }
      
      // Convert value to string
      settings[key] = String(value);
    }

    // Update settings in database
    if (Object.keys(settings).length === 1) {
      // Single setting update
      const [key, value] = Object.entries(settings)[0];
      movieDB.setSetting(key, value);
    } else {
      // Bulk settings update
      movieDB.setSettings(settings);
    }

    // Return updated settings
    const updatedSettings = movieDB.getAllSettings();
    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings - Reset all settings
export async function DELETE() {
  try {
    movieDB.clearSettings();
    
    return NextResponse.json(
      { message: 'All settings have been reset' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}
