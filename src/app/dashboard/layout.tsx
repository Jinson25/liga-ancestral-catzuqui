'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        async function checkAccess() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }

            const { data: userData } = await supabase
                .from('usuarios')
                .select('rol')
                .eq('id', session.user.id)
                .single();

            if (!userData || userData.rol !== 'presidente') {
                router.push('/');
                return;
            }

            setLoading(false);
        }

        checkAccess();
    }, [supabase, router]);

    if (loading) {
        return (
            <>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </div>
        </>
    );
}
