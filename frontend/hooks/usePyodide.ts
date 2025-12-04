"use client";
import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export default function usePyodide() {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      if (pyodideRef.current) {
        // Ensure seaborn is loaded even if instance exists (hot reload case)
        try {
          await pyodideRef.current.loadPackage("micropip");
          const micropip = pyodideRef.current.pyimport("micropip");
          await micropip.install("seaborn");
        } catch (e) {
          console.error("Failed to load seaborn on reload:", e);
        }
        setPyodide(pyodideRef.current);
        setIsLoading(false);
        return;
      }

      try {
        // Wait for the script to load if it hasn't already
        if (!window.loadPyodide) {
          let retries = 0;
          while (!window.loadPyodide && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
          }
          if (!window.loadPyodide) {
            console.error("Pyodide script not loaded");
            return;
          }
        }

        const py = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });

        await py.loadPackage("pandas");
        await py.loadPackage("matplotlib");
        await py.loadPackage("micropip");

        const micropip = py.pyimport("micropip");
        await micropip.install("seaborn");

        pyodideRef.current = py;
        setPyodide(py);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Pyodide:", error);
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return { pyodide, isLoading };
}
