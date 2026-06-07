import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const lead = await request.json();
    
    const data = await resend.emails.send({
      from: 'Hypermarket <onboarding@resend.dev>', // This is Resend's free testing email
      to: ['matthewjread13@gmail.com'], 
      subject: `🚨 New B2B Lead: ${lead.company}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #0ea5e9;">New Retailer Waitlist Registration</h2>
          <p>A new shop has joined the Book Hypermarket POS waitlist.</p>
          <hr />
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Company:</strong> ${lead.company}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>POS System:</strong> ${lead.pos_system}</p>
          <p><strong>Infrastructure:</strong> ${lead.infrastructure}</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Automated by the Hypermarket Tripwire Engine</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger alert' }, { status: 500 });
  }
}