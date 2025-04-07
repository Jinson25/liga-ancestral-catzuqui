import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers";
import { AuthButton } from "./auth-button";

export async function AuthButtonServer() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    return <AuthButton session={session} />
}