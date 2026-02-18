import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Route segment config for file uploads
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Fetch a specific resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PUT: Update resource (title or replace file)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;

    const existingResource = await prisma.resource.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date()
    };

    if (title) {
      updateData.title = title;
    }

    // If a new file is provided, replace the old one
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Only PDF files are allowed' },
          { status: 400 }
        );
      }

      // Delete old file
      const oldFilePath = join(process.cwd(), 'public', existingResource.filePath);
      if (existsSync(oldFilePath)) {
        await unlink(oldFilePath);
      }

      // Save new file
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'resources');
      const filePath = join(uploadDir, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      updateData.fileName = file.name;
      updateData.filePath = `/uploads/resources/${fileName}`;
      updateData.fileSize = file.size;
    }

    const resource = await prisma.resource.update({
      where: { id: parseInt(params.id) },
      data: updateData,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    const filePath = join(process.cwd(), 'public', resource.filePath);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete from database
    await prisma.resource.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
