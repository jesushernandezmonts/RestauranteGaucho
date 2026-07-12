"use client";

import { useContext } from "react";
import { FestividadContextType, FestividadContext } from "../contexts/FestividadContext";

export function useFestividad(): FestividadContextType {
  const context = useContext(FestividadContext);
  if (context === undefined) {
    throw new Error("useFestividad debe usarse dentro de un FestividadProvider");
  }
  return context;
}
