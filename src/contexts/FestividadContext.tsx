"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from "react";

interface FestividadState {
  festividadActiva: string;
  titulo: string;
  mensaje: string;
  esFestividad: boolean;
}

type FestividadAction =
  | { type: "SET_FESTIVIDAD_ACTIVA"; payload: string }
  | { type: "SET_TITULO"; payload: string }
  | { type: "SET_MENSAJE"; payload: string }
  | { type: "SET_FESTIVIDAD_COMPLETA"; payload: { festividad: string; titulo: string; mensaje: string } }
  | { type: "LOAD_FROM_CONFIG"; payload: Partial<FestividadState> }
  | { type: "BROADCAST_UPDATE"; payload: Partial<FestividadState> };

const initialState: FestividadState = {
  festividadActiva: "ninguna",
  titulo: "",
  mensaje: "",
  esFestividad: false,
};

function festividadReducer(state: FestividadState, action: FestividadAction): FestividadState {
  switch (action.type) {
    case "SET_FESTIVIDAD_ACTIVA":
      return {
        ...state,
        festividadActiva: action.payload,
        esFestividad: action.payload !== "ninguna",
      };
    case "SET_TITULO":
      return { ...state, titulo: action.payload };
    case "SET_MENSAJE":
      return { ...state, mensaje: action.payload };
    case "SET_FESTIVIDAD_COMPLETA": {
      const { festividad, titulo, mensaje } = action.payload;
      return {
        ...state,
        festividadActiva: festividad,
        titulo,
        mensaje,
        esFestividad: festividad !== "ninguna",
      };
    }
    case "LOAD_FROM_CONFIG":
      return { ...state, ...action.payload };
    case "BROADCAST_UPDATE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export interface FestividadContextType extends FestividadState {
  setFestividadActiva: (festividad: string) => void;
  setTitulo: (titulo: string) => void;
  setMensaje: (mensaje: string) => void;
  setFestividadCompleta: (festividad: string, titulo: string, mensaje: string) => void;
  cargarConfiguracion: () => Promise<void>;
}

export const FestividadContext = createContext<FestividadContextType | undefined>(undefined);

interface FestividadProviderProps {
  children: ReactNode;
}

export function FestividadProvider({ children }: FestividadProviderProps) {
  const [state, dispatch] = useReducer(festividadReducer, initialState);

  // Cargar configuración inicial desde la API
  const cargarConfiguracion = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data.festividad_activa) {
        dispatch({
          type: "LOAD_FROM_CONFIG",
          payload: {
            festividadActiva: data.festividad_activa || "ninguna",
            titulo: data.festividad_titulo || "",
            mensaje: data.festividad_mensaje || "",
            esFestividad: (data.festividad_activa || "ninguna") !== "ninguna",
          },
        });
      }
    } catch (e) {
      console.error("Error cargando configuración de festividad:", e);
    }
  }, []);

  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  // BroadcastChannel nativo para sincronización entre pestañas
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("gaucho_config_changes");
      channel.onmessage = (event) => {
        if (event.data?.type === "festividad_update") {
          dispatch({ type: "BROADCAST_UPDATE", payload: event.data.payload });
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel no disponible:", e);
    }
    return () => {
      try { channel?.close(); } catch {}
    };
  }, []);

  // Notificar cambios a otras pestañas
  const broadcastUpdate = useCallback((payload: Partial<FestividadState>) => {
    try {
      const bc = new BroadcastChannel("gaucho_config_changes");
      bc.postMessage({ type: "festividad_update", payload });
      bc.close();
    } catch {}
  }, []);

  const setFestividadActiva = useCallback((festividad: string) => {
    dispatch({ type: "SET_FESTIVIDAD_ACTIVA", payload: festividad });
    broadcastUpdate({ festividadActiva: festividad, esFestividad: festividad !== "ninguna" });
  }, [broadcastUpdate]);

  const setTitulo = useCallback((titulo: string) => {
    dispatch({ type: "SET_TITULO", payload: titulo });
    broadcastUpdate({ titulo });
  }, [broadcastUpdate]);

  const setMensaje = useCallback((mensaje: string) => {
    dispatch({ type: "SET_MENSAJE", payload: mensaje });
    broadcastUpdate({ mensaje });
  }, [broadcastUpdate]);

  const setFestividadCompleta = useCallback((festividad: string, titulo: string, mensaje: string) => {
    dispatch({ type: "SET_FESTIVIDAD_COMPLETA", payload: { festividad, titulo, mensaje } });
    broadcastUpdate({ festividadActiva: festividad, titulo, mensaje, esFestividad: festividad !== "ninguna" });
  }, [broadcastUpdate]);

  const contextValue: FestividadContextType = {
    ...state,
    setFestividadActiva,
    setTitulo,
    setMensaje,
    setFestividadCompleta,
    cargarConfiguracion,
  };

  return (
    <FestividadContext.Provider value={contextValue}>
      {children}
    </FestividadContext.Provider>
  );
}

export function useFestividad(): FestividadContextType {
  const context = useContext(FestividadContext);
  if (context === undefined) {
    throw new Error("useFestividad debe usarse dentro de un FestividadProvider");
  }
  return context;
}
