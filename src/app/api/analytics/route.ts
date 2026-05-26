import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate payload
    if (data.isWin === undefined || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const analyticsDir = path.join(process.cwd(), 'data', 'analytics');
    const resultsFile = path.join(analyticsDir, 'results.json');

    // Ensure directory exists
    await fs.mkdir(analyticsDir, { recursive: true });

    let existingResults = [];
    try {
      const fileContent = await fs.readFile(resultsFile, 'utf-8');
      existingResults = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist or is empty, start fresh
    }

    // Append new result
    const resultEntry = {
      timestamp: new Date().toISOString(),
      isWin: data.isWin,
      category: data.category,
      turnsTaken: data.turnsTaken || 0,
      timeElapsed: data.timeElapsed || 0,
      finalGuess: data.finalGuess || null
    };

    existingResults.push(resultEntry);

    // Write back to file
    await fs.writeFile(resultsFile, JSON.stringify(existingResults, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Analytics saved locally' });

  } catch (error) {
    console.error('[Analytics API] Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save analytics' }, { status: 500 });
  }
}
