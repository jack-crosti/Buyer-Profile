import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
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

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([formattedData], {
      header: Object.keys(formattedData)
    });

    // Set column widths
    const columnWidths = Object.keys(formattedData).map(key => ({
      wch: Math.max(key.length, 30) // Minimum width of 30 characters
    }));
    worksheet['!cols'] = columnWidths;

    // Set row heights for multi-line content
    const rowHeights: { [key: string]: number } = {};
    Object.entries(formattedData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('\n')) {
        const lineCount = value.split('\n').length;
        rowHeights[XLSX.utils.encode_row(1)] = 20 * lineCount; // 20 pixels per line
      }
    });
    worksheet['!rows'] = [{ hpt: 30 }, { hpt: 120 }]; // Header height and data row height

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyer Profile');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer',
      bookType: 'xlsx',
      cellStyles: true
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Format the filename with name, business type, and budget
    const businessType = formData.type ? formData.type.split(',')[0] : 'Any';  // Get first business type if multiple
    const fileName = `${formData.name} - ${businessType} - ${formData.budget} - Buyer Form.xlsx`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT,
      subject: `New Buyer Profile: ${formData.name} - ${businessType}`,
      text: `
New buyer profile submitted by ${formData.name}

Contact Details:
- Email: ${formData.email}
- Phone: ${formData.mobile}

Business Type: ${businessType}
Budget: ${formData.budget}

Please find the detailed profile in the attached Excel file.
      `,
      attachments: [
        {
          filename: fileName,
          content: excelBuffer
        }
      ]
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