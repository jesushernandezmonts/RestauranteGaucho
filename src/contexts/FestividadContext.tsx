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

  // Apply theme colors to the HTML element
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const activeFest = state.festividadActiva;
    const theme = THEMES[activeFest] || DEFAULT_THEME;
    const colors = { ...DEFAULT_THEME, ...theme };

    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-light", colors.primaryLight);
    root.style.setProperty("--primary-dark", colors.primaryDark);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--gold", colors.gold);
    root.style.setProperty("--gold-light", colors.goldLight);
    root.style.setProperty("--gold-dark", colors.goldDark);
    root.style.setProperty("--charcoal", colors.charcoal);
    root.style.setProperty("--chocolate", colors.chocolate);
    root.style.setProperty("--cream", colors.cream);
    root.style.setProperty("--cream-warm", colors.creamWarm);

    // Toggle theme classes on document root
    Object.keys(THEMES).forEach((themeName) => {
      root.classList.remove(`theme-${themeName}`);
    });
    if (activeFest !== "ninguna") {
      root.classList.add(`theme-${activeFest}`);
    }
  }, [state.festividadActiva]);

  // BroadcastChannel nativo para sincronización entre pestañas
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("gaucho_config_changes");
      channel.onmessage = () => {
        // Reload config from API on any change notification
        cargarConfiguracion();
      };
    } catch (e) {
      console.warn("BroadcastChannel no disponible:", e);
    }
    return () => {
      try { channel?.close(); } catch {}
    };
  }, [cargarConfiguracion]);

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

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  charcoal: string;
  chocolate: string;
  cream: string;
  creamWarm: string;
}

const DEFAULT_THEME: ThemeColors = {
  primary: "#E8AB2F",
  primaryLight: "#F0C050",
  primaryDark: "#C48F1B",
  accent: "#E8AB2F",
  gold: "#E8AB2F",
  goldLight: "#F0C050",
  goldDark: "#C48F1B",
  charcoal: "#3D2A1C",
  chocolate: "#4A3228",
  cream: "#F5EDE3",
  creamWarm: "#EDE0D0",
};

const THEMES: Record<string, Partial<ThemeColors>> = {
  navidad: {
    primary: "#C41E3A",
    primaryLight: "#D83A56",
    primaryDark: "#961026",
    accent: "#FFD700",
    gold: "#FFD700",
    goldLight: "#FFE44D",
    goldDark: "#B89B00",
    charcoal: "#112B1D",
    chocolate: "#1A3A2A",
    cream: "#F5F8F6",
    creamWarm: "#E6EDE8",
  },
  diademuertos: {
    primary: "#FF6B35",
    primaryLight: "#FF8E60",
    primaryDark: "#D64A13",
    accent: "#E8A838",
    gold: "#E8A838",
    goldLight: "#F0C16C",
    goldDark: "#B37A17",
    charcoal: "#1E0B2E",
    chocolate: "#29123F",
    cream: "#F9F5EF",
    creamWarm: "#F3EAE0",
  },
  sanvalentin: {
    primary: "#E91E63",
    primaryLight: "#F45D8F",
    primaryDark: "#B00940",
    accent: "#FFD700",
    gold: "#FFD700",
    goldLight: "#FFE44D",
    goldDark: "#B89B00",
    charcoal: "#380E20",
    chocolate: "#4E142F",
    cream: "#FDF6F8",
    creamWarm: "#F8E6EC",
  },
  fiestaspatrias: {
    primary: "#006847",
    primaryLight: "#008E61",
    primaryDark: "#004730",
    accent: "#CE1126",
    gold: "#CE1126",
    goldLight: "#E53E4E",
    goldDark: "#990B18",
    charcoal: "#0F261C",
    chocolate: "#1A3D2F",
    cream: "#FAF9F5",
    creamWarm: "#F0EFE6",
  },
  semanasanta: {
    primary: "#7B2D8E",
    primaryLight: "#9A4EB0",
    primaryDark: "#5C1B6E",
    accent: "#E8A838",
    gold: "#E8A838",
    goldLight: "#F0C16C",
    goldDark: "#B37A17",
    charcoal: "#1F1C2E",
    chocolate: "#2C283F",
    cream: "#F7F5F9",
    creamWarm: "#ECE8F2",
  },
  anonuevo: {
    primary: "#FFD700",
    primaryLight: "#FFE44D",
    primaryDark: "#B89B00",
    accent: "#FFD700",
    gold: "#FFD700",
    goldLight: "#FFE44D",
    goldDark: "#B89B00",
    charcoal: "#0A0A26",
    chocolate: "#12123B",
    cream: "#F5F7FA",
    creamWarm: "#E6ECF5",
  },
  feriahuamantla: {
    primary: "#FF4081",
    primaryLight: "#FF73A3",
    primaryDark: "#C50051",
    accent: "#E8A838",
    gold: "#E8A838",
    goldLight: "#F0C16C",
    goldDark: "#B37A17",
    charcoal: "#260F35",
    chocolate: "#38174D",
    cream: "#FAF5FA",
    creamWarm: "#F0E3F0",
  },
  halloween: {
    primary: "#FF6D00",
    primaryLight: "#FF9100",
    primaryDark: "#C55300",
    accent: "#7C4DFF",
    gold: "#7C4DFF",
    goldLight: "#B47CFF",
    goldDark: "#5200CC",
    charcoal: "#0A0A0A",
    chocolate: "#1A1A1A",
    cream: "#F6F5F2",
    creamWarm: "#EBEAE1",
  },
};
