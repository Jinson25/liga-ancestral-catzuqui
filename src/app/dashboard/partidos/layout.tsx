import { NavBar } from "@/app/components/layout/navBarComponents"

export default function PartidosLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <NavBar />
            {children}
        </>
    )
}
