import { NavBar } from "@/app/components/layout/navBarComponents"

export default function TemporadasLayout({
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
