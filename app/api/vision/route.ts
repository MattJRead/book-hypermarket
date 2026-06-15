import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image payload received.' }, { status: 400 });
    }

    // Pass the image directly into the local Tesseract engine
    const { data: { text } } = await Tesseract.recognize(
      imageBase64,
      'eng'
    );

    // Clean up the raw text output to prevent the search bar from choking on line breaks
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    if (!cleanText || cleanText.length < 3) {
        return NextResponse.json({ error: 'Could not read text clearly. Try holding the camera steadier or improving lighting.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, extractedText: cleanText });
    
  } catch (error: any) {
    console.error('[CRITICAL OCR FAILURE]:', error);
    return NextResponse.json({ 
      error: error.message || 'Local OCR Engine Crash' 
    }, { status: 500 });
  }
}