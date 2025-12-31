import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import ResourceGrid from '@/components/resources/ResourceGrid';

export const dynamic = 'force-dynamic';

export default function SellerResources() {
    const cookieStore = cookies();
    const userId = cookieStore.get('auth_user')?.value;

    if (!userId) {
        return <ClientRedirect to="/" />;
    }

    return (
        <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-[#FAF9F6]">
            <div className="max-w-7xl mx-auto pt-12 px-6">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-[#0B3D2E] mb-3">Seller Resource Library</h1>
                    <p className="text-xl text-gray-600 font-medium max-w-3xl">
                        Exclusive guides, checklists, and templates to help you navigate your exit with confidence.
                    </p>
                </div>

                {/* Resource Grid */}
                <ResourceGrid />
            </div>
        </div>
    );
}

