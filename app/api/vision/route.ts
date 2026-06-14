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

    // Strip the data URL prefix so the AI gets pure, raw image data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Summon the lightning-fast 1.5 Flash model specifically designed for images
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // The strict extraction command
    const prompt = "Analyze this book cover. Extract the title and the author. Return ONLY the title and author as a single clean text string (e.g., 'The Hobbit, J.R.R. Tolkien'). Do not say hello, do not write a summary, do not use formatting.";

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ];

    // Fire the data into the neural network
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const extractedText = response.text();

    // Send the raw text back to your storefront's search bar
    return NextResponse.json({ success: true, extractedText: extractedText.trim() });
    
  } catch (error: any) {
    console.error('[CRITICAL AI FAILURE]:', error.message);
    return NextResponse.json({ error: 'Failed to analyze cover art' }, { status: 500 });
  }
}