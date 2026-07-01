"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      themes={['light', 'dark', 'theme-nature', 'theme-ocean', 'theme-sunset', 'theme-rose', 'theme-violet', 'theme-monochrome', 'theme-cyberpunk', 'theme-midnight']} 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
