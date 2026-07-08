import { createContext, useContext, useMemo, useState } from 'react'

const UbicacionContext = createContext(null)

export const UBICACIONES = {
  ALMACEN_CENTRAL: {
    id: 1,
    key: 'warehouse',
    label: 'Almacen Central',
    shortLabel: 'Almacen',
    emoji: '📦',
  },
  TIENDA: {
    id: 2,
    key: 'store',
    label: 'Tienda',
    shortLabel: 'Tienda',
    emoji: '🏪',
  },
}

export function UbicacionProvider({ children }) {
  const [ubicacionActiva, setUbicacionActiva] = useState(UBICACIONES.TIENDA)

  const value = useMemo(() => ({
    ubicacionActiva,
    ubicacionId: ubicacionActiva.id,
    esTienda: ubicacionActiva.id === UBICACIONES.TIENDA.id,
    esAlmacen: ubicacionActiva.id === UBICACIONES.ALMACEN_CENTRAL.id,
    setUbicacionActiva,
    setTienda: () => setUbicacionActiva(UBICACIONES.TIENDA),
    setAlmacen: () => setUbicacionActiva(UBICACIONES.ALMACEN_CENTRAL),
  }), [ubicacionActiva])

  return (
    <UbicacionContext.Provider value={value}>
      {children}
    </UbicacionContext.Provider>
  )
}

export function useUbicacion() {
  const ctx = useContext(UbicacionContext)
  if (!ctx) throw new Error('useUbicacion must be used within UbicacionProvider')
  return ctx
}
