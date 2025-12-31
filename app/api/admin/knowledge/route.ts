import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const snippets = await prisma.knowledgeSnippet.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(snippets);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const snippet = await prisma.knowledgeSnippet.create({
            data: { content }
        });

        return NextResponse.json({ success: true, snippet });

    } catch (error) {
        console.error('Error creating snippet:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await prisma.knowledgeSnippet.delete({ where: { id } });

        return NextResponse.json({ success: true });

    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
