import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export async function GET() {
    try {
        const tags = movieDB.getAllTags();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Tag name is required' },
                { status: 400 }
            );
        }

        const tag = movieDB.createTag(name);
        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Tag already exists') {
            return NextResponse.json(
                { error: 'Tag already exists' },
                { status: 409 }
            );
        }
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { error: 'Failed to create tag' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name } = body;

        if (!id || !name) {
            return NextResponse.json(
                { error: 'ID and name are required' },
                { status: 400 }
            );
        }

        movieDB.updateTag(id, name);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json(
            { error: 'Failed to update tag' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        movieDB.deleteTag(Number(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json(
            { error: 'Failed to delete tag' },
            { status: 500 }
        );
    }
}
