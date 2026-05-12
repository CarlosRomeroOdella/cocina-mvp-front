/**
 * context/ProductsContext.jsx — Estado global del catálogo
 *
 * Carga y mantiene en memoria: platillos, ingredientes, extras y relaciones.
 * Expone funciones CRUD que actualizan tanto la API como el estado local.
 * Se usa con: const { platillos, guardarPlatillo, ... } = useProducts()
 *
 * Solo carga datos cuando hay un usuario logueado.
 * Si el usuario cierra sesión, limpia todos los datos.
 */
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getProducts,
  getIngredientes,
  getExtras,
  getRelaciones,
  updateProduct,
  createProduct,
  deleteProduct,
  createIngrediente,
  updateIngrediente,
  deleteIngrediente,
  createExtra,
  updateExtra,
  deleteExtra,
} from "../services/productsService";

const defaultValue = {
  platillos: [],
  ingredientes: [],
  extras: [],
  relaciones: [],
  loading: true,
  error: null,
  toggleDisponible: () => {},
  guardarPlatillo: async () => {},
  eliminarPlatillo: async () => {},
  crearIngrediente: async () => {},
  actualizarIngrediente: async () => {},
  eliminarIngrediente: async () => {},
  crearExtra: async () => {},
  actualizarExtra: async () => {},
  eliminarExtra: async () => {},
};

export const ProductsContext = createContext(defaultValue);

export function ProductsProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [platillos, setPlatillos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [extras, setExtras] = useState([]);
  const [relaciones, setRelaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial: se dispara cuando cambia el usuario o termina de cargar el auth
  useEffect(() => {
    if (authLoading) return; // Espera a que AuthContext sepa si hay sesión

    if (!user) {
      setPlatillos([]);
      setIngredientes([]);
      setExtras([]);
      setRelaciones([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Carga los 4 recursos en paralelo para minimizar tiempo de espera
    (async () => {
      try {
        const [p, i, e, r] = await Promise.all([
          getProducts(),
          getIngredientes(),
          getExtras(),
          getRelaciones(),
        ]);
        setPlatillos(p);
        setIngredientes(i);
        setExtras(e);
        setRelaciones(r);
      } catch (err) {
        setError("Error cargando datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  // Cambia disponible de un platillo (optimistic update):
  // actualiza el estado local de inmediato y si falla la API, revierte.
  const toggleDisponible = async (id) => {
    const platillo = platillos.find((p) => p.id === id);
    const actualizado = { ...platillo, disponible: !platillo.disponible };
    setPlatillos((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
    try {
      await updateProduct(id, actualizado);
    } catch {
      setPlatillos((prev) => prev.map((p) => (p.id === id ? platillo : p)));
    }
  };

  // Crea o actualiza un platillo según si tiene ID o no.
  // También sincroniza el estado local de "relaciones" con los nuevos ingredientes.
  const guardarPlatillo = async (platillo) => {
    const existe = platillos.find((p) => p.id === platillo.id);
    if (existe) {
      const actualizado = await updateProduct(platillo.id, platillo);
      setPlatillos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      if (platillo.ingredientes !== undefined) {
        const requeridos = new Set(actualizado.ingredientesRequeridos ?? []);
        setRelaciones((prev) => [
          ...prev.filter((r) => r.platilloId !== platillo.id),
          ...(actualizado.ingredientes ?? []).map((ingredienteId) => ({
            platilloId: platillo.id,
            ingredienteId,
            requerido: requeridos.has(ingredienteId),
          })),
        ]);
      }
    } else {
      const nuevo = await createProduct(platillo);
      setPlatillos((prev) => [...prev, nuevo]);
      if (nuevo.ingredientes?.length > 0) {
        const requeridos = new Set(nuevo.ingredientesRequeridos ?? []);
        setRelaciones((prev) => [
          ...prev,
          ...(nuevo.ingredientes ?? []).map((ingredienteId) => ({
            platilloId: nuevo.id,
            ingredienteId,
            requerido: requeridos.has(ingredienteId),
          })),
        ]);
      }
    }
  };

  const eliminarPlatillo = async (id) => {
    await deleteProduct(id);
    setPlatillos((prev) => prev.filter((p) => p.id !== id));
  };

  const crearIngrediente = async (nombre, _precio = null, _categoria = null, imagen = null) => {
    const nuevo = await createIngrediente({ nombre, imagen });
    setIngredientes((prev) => [...prev, nuevo]);
    return nuevo;
  };

  const actualizarIngrediente = async (id, data) => {
    const actualizado = await updateIngrediente(id, data);
    setIngredientes((prev) => prev.map((i) => (i.id === id ? actualizado : i)));
    return actualizado;
  };

  const eliminarIngrediente = async (id) => {
    await deleteIngrediente(id);
    setIngredientes((prev) => prev.filter((i) => i.id !== id));
    setPlatillos((prev) =>
      prev.map((p) => ({
        ...p,
        ingredientes: (p.ingredientes ?? []).filter((iId) => iId !== id),
        ingredientesRequeridos: (p.ingredientesRequeridos ?? []).filter((iId) => iId !== id),
      }))
    );
  };

  const crearExtra = async (nombre, precio = null, categoria = null, imagen = null) => {
    const nuevo = await createExtra({ nombre, precio, categoria, imagen });
    setExtras((prev) => [...prev, nuevo]);
    return nuevo;
  };

  const actualizarExtra = async (id, data) => {
    const actualizado = await updateExtra(id, data);
    setExtras((prev) => prev.map((e) => (e.id === id ? actualizado : e)));
    return actualizado;
  };

  const eliminarExtra = async (id) => {
    await deleteExtra(id);
    setExtras((prev) => prev.filter((e) => e.id !== id));
    setPlatillos((prev) =>
      prev.map((p) => ({
        ...p,
        extras: (p.extras ?? []).filter((eId) => eId !== id),
      }))
    );
  };

  return (
    <ProductsContext.Provider
      value={{
        platillos,
        ingredientes,
        extras,
        relaciones,
        loading,
        error,
        toggleDisponible,
        guardarPlatillo,
        eliminarPlatillo,
        crearIngrediente,
        actualizarIngrediente,
        eliminarIngrediente,
        crearExtra,
        actualizarExtra,
        eliminarExtra,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
