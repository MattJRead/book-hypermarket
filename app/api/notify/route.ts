import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Correct: It looks for an environment variable named RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
// ... the rest of your code remains exactly the same