"use client";

import { NavBar } from "../components/layout/navBarComponents";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function CrearEquipoPage() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(""); // Aquí guardaremos el id de la categoría
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCategorias() {
      const { data, error } = await supabase.from("categorias").select("id, nombre");
      if (data) {
        setCategorias(data);
      }
    }
    fetchCategorias();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMensaje("Debes iniciar sesión para crear un equipo.");
      setLoading(false);
      return;
    }
    // Insertar equipo en estado 'pendiente' con categoria_id y creado_por correctos
    const { error } = await supabase
      .from("equipos")
      .insert([
        {
          nombre,
          categoria_id: parseInt(categoria), // id de la categoría seleccionado
          estado: "pendiente",
          creado_por: session.user.id, // UUID del usuario actual
        },
      ]);
    setLoading(false);
    if (error) {
      setMensaje("Error al crear el equipo: " + error.message);
    } else {
      setMensaje("Equipo creado correctamente. Será validado por un administrador.");
      setNombre("");
      setCategoria("");
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  };

  return (
    <>
      <NavBar />
      <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Crear equipo</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del equipo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow"
          >
            {loading ? "Creando..." : "Crear equipo"}
          </button>
        </form>
        {mensaje && <p className="mt-6 text-center text-md text-blue-700 font-semibold">{mensaje}</p>}
      </div>
    </>
  );
}
