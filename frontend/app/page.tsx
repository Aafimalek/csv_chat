"use client";
import { useState } from 'react';
import usePyodide from '@/hooks/usePyodide';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import { Loader2, Sparkles, Github } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  const { pyodide, isLoading: isPyodideLoading } = usePyodide();
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      pyodide.FS.writeFile(selectedFile.name, text);
      pyodide.runPython(`
        import pandas as pd
        df = pd.read_csv('${selectedFile.name}')
        columns = df.columns.tolist()
      `);
      const cols = pyodide.globals.get('columns').toJs();
      setColumns(cols);
    } catch (error) {
      console.error("Error processing file:", error);
      // Ideally use a toast here
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPyodideLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10 mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Initializing AI Environment</h2>
            <p className="text-muted-foreground">Loading Python engine (Pyodide)...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuroraBackground>
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              CSV Chat RAG
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com/Aafimalek/csv_chat', '_blank')}
              className="gap-2"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
            {file && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                Reset / New File
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl"
            >
              <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-8">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Analyze your data
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Upload a CSV file to start chatting with your data.
                    <br />
                    <span className="text-primary font-medium">Private & Secure. Client-side processing.</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileSelect={handleFileSelect} />
                </CardContent>
              </Card>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">Reading CSV and extracting schema...</p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full"
            >
              <ChatInterface
                pyodide={pyodide}
                columns={columns}
                fileName={file.name}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}
