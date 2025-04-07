import { NavBar } from "@/app/components/layout/navBarComponents"

export default function EquiposLayout({
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
