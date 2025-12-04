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
        setPyodide(pyodideRef.current);
        setIsLoading(false);
        return;
      }

      try {
        // Wait for the script to load if it hasn't already
        if (!window.loadPyodide) {
            // Retry a few times or wait? 
            // Better to rely on the script being in layout and ready.
            // But we can dynamically load it here if we want.
            // Let's assume it's in layout for now, but we might need to poll.
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
