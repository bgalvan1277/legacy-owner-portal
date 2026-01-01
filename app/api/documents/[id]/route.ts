import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const document = await prisma.document.findUnique({
            where: { id: params.id },
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Authorization: Admin or Owner
        if (user.role !== 'ADMIN' && document.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Return the file content
        // We need to convert the Bytes (Buffer) to a valid response
        const headers = new Headers();
        headers.set('Content-Type', document.fileType);
        headers.set('Content-Disposition', `attachment; filename="${document.filename}"`);
        headers.set('Content-Length', document.size.toString());

        return new NextResponse(new Uint8Array(document.data), {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
