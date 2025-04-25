import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file temporarily
    const path = join(process.cwd(), 'temp', file.name);
    await writeFile(path, buffer);

    // Process the file based on its type
    let data;
    if (file.name.endsWith('.csv')) {
      data = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
      });
    } else if (file.name.endsWith('.xlsx')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    } else if (file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'PDF files not yet supported' }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Process the data to add new columns
    const processedData = data.map((row: any) => {
      return {
        ...row,
        director: '', // Will be filled from NZ Companies Register
        shareholder: '', // Will be filled from NZ Companies Register
        phone_numbers: '', // Will be filled from various sources
        emails: '', // Will be filled from various sources
      };
    });

    // Create a new workbook with the processed data
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(processedData);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Processed Data');

    // Convert to buffer
    const excelBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="processed_${file.name}"`,
      },
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
} 