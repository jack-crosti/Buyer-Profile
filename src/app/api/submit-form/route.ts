import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Helper function to format multi-select fields
const formatMultiSelect = (value: string): string => {
  if (!value) return '';
  return value.split(',').join('\n');
};

// Helper function to format the data for better readability
const formatFormData = (data: any) => {
  return {
    "Full Name": data.name,
    "Email": data.email,
    "Phone": data.mobile,
    "Business Types Interested In": formatMultiSelect(data.type),
    "Other Business Type": data.typeOther,
    "Preferred Locations": formatMultiSelect(data.preferredLocation),
    "Other Location": data.preferredLocationOther,
    "Budget Range": data.budget,
    "Industry Experience": data.experience,
    "Current Role": data.currentJob,
    "Other Current Role": data.currentJobOther,
    "Previous Business Purchase": data.pastPurchase,
    "Business Ownership Familiarity": data.familiarity,
    "Available Capital": data.capital,
    "Planning Finance": data.financeReady,
    "Consider Vendor Finance": data.vendorFinance,
    "Primary Motivation": data.motivation,
    "Other Motivation": data.motivationOther,
    "Ideal Day": data.idealDay,
    "Non-Negotiables": data.nonNegotiable,
    "Other Non-Negotiables": data.nonNegotiableOther,
    "Off-Market Interest": data.offMarketAccess,
    "Next Steps": data.nextStep,
    "Additional Notes": data.finalNotes
  };
};

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const formattedData = formatFormData(formData);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT,
      subject: `New Buyer Profile: ${formData.name} - ${formData.type ? formData.type.split(',')[0] : 'Any'}`,
      text: `
New buyer profile submitted by ${formData.name}

Contact Details:
- Email: ${formData.email}
- Phone: ${formData.mobile}

Business Type: ${formData.type ? formData.type.split(',')[0] : 'Any'}
Budget: ${formData.budget}

Please find the detailed profile in the attached Excel file.
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { error: 'Failed to process form submission' },
      { status: 500 }
    );
  }
} 