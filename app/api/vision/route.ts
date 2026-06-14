import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini Engine using your secure key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image payload received.' }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = "Analyze this book cover. Extract the title and the author. Prioritize text extraction aggressively, even if the image lighting is poor, blurry, dark, or distorted. Return ONLY the title and author as a single clean text string (e.g., 'The Hobbit, J.R.R. Tolkien'). Do not say hello, do not write a summary, do not use formatting.";

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const extractedText = response.text();

    return NextResponse.json({ success: true, extractedText: extractedText.trim() });
    
  } catch (error: any) {
    console.error('[CRITICAL AI FAILURE]:', error);
    
    // 🔽 DIAGNOSTIC OVERRIDE: Send the EXACT error message to the storefront popup
    return NextResponse.json({ 
      error: error.message || 'Unknown Server Crash - Check Vercel Logs' 
    }, { status: 500 });
  }
}