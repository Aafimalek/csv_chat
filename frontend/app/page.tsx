"use client";
import { useState, useEffect } from 'react';
import usePyodide from '@/hooks/usePyodide';
import FileUpload from '@/components/FileUpload';
import ChatInterface, { Message } from '@/components/ChatInterface';
import { Loader2, Database, Github } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sidebar, ChatSession } from '@/components/Sidebar';
import { v4 as uuidv4 } from 'uuid';
import { ModeToggle } from '@/components/mode-toggle';
import { saveFileToDB, getFileFromDB } from '@/lib/db';

export default function Home() {
  const { pyodide, isLoading: isPyodideLoading } = usePyodide();
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Load messages for current session
  useEffect(() => {
    if (currentSessionId) {
      const savedMessages = localStorage.getItem(`chat_messages_${currentSessionId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Save messages to localStorage and update session preview
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(`chat_messages_${currentSessionId}`, JSON.stringify(messages));

      // Update preview in session list
      if (messages.length > 0) {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const lastMsg = messages[messages.length - 1];
            return {
              ...s,
              preview: lastMsg.role === 'user' ? `You: ${lastMsg.content}` : `AI: ${lastMsg.content.substring(0, 30)}...`
            };
          }
          return s;
        }));
      }
    }
  }, [messages, currentSessionId]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      // Save to IndexedDB for persistence across refreshes
      await saveFileToDB(selectedFile);

      const text = await selectedFile.text();
      pyodide.FS.writeFile(selectedFile.name, text);
      pyodide.runPython(`
        import pandas as pd
        df = pd.read_csv('${selectedFile.name}')
        columns = df.columns.tolist()
      `);
      const cols = pyodide.globals.get('columns').toJs();
      setColumns(cols);

      // Create a new session if none exists or if we want to associate this file with a new session
      if (!currentSessionId) {
        createNewSession(selectedFile.name, selectedFile.name, cols);
      } else {
        // Update current session with new file info
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, title: selectedFile.name, fileName: selectedFile.name, columns: cols };
          }
          return s;
        }));
      }

    } catch (error) {
      console.error("Error processing file:", error);
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const createNewSession = (title: string = "New Chat", fileName?: string, cols?: string[]) => {
    const newId = uuidv4();
    const newSession: ChatSession = {
      id: newId,
      title: title,
      date: Date.now(),
      preview: "Started a new chat",
      fileName: fileName,
      columns: cols
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
  };

  const handleSelectSession = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    setCurrentSessionId(id);

    // Determine filename
    const fileName = session.fileName || session.title || "Restored Session";

    // Restore columns if available
    if (session.columns) {
      setColumns(session.columns);
    }

    // Try to get the real file object
    let fileToSet: File | null = file;

    // If current file doesn't match, try to load from DB
    if (!file || file.name !== fileName) {
      try {
        const dbFile = await getFileFromDB(fileName);
        if (dbFile) {
          console.log("Restored file from IndexedDB:", fileName);
          fileToSet = dbFile;
        } else {
          // Fallback to dummy if not in DB (user cleared cache or used different device)
          fileToSet = { name: fileName } as File;
        }
      } catch (e) {
        console.error("Failed to load from DB:", e);
        fileToSet = { name: fileName } as File;
      }
      setFile(fileToSet);
    }

    // Try to restore Pyodide context
    if (fileName) {
      try {
        // Check if file exists in Pyodide FS
        const fileExists = pyodide.runPython(`
                  import os
                  os.path.exists('${fileName}')
              `);

        if (fileExists) {
          pyodide.runPython(`
                      import pandas as pd
                      df = pd.read_csv('${fileName}')
                  `);
          console.log("Context restored for", fileName);
        } else if (fileToSet && typeof fileToSet.text === 'function') {
          // We have the real file (from DB or memory), let ChatInterface handle the restoration
          // or we could do it here, but ChatInterface has the logic.
          // Actually, ChatInterface logic runs on submit. 
          // Let's proactively load it here to be safe and avoid the "not loaded" state initially?
          // No, let's let ChatInterface handle it lazily or we can do it here.
          // Doing it here provides immediate feedback.
          console.log("Pre-loading file into Pyodide from restored object");
          const text = await fileToSet.text();
          pyodide.FS.writeFile(fileName, text);
          pyodide.runPython(`
                import pandas as pd
                df = pd.read_csv('${fileName.replace(/'/g, "\\'")}')
           `);
        } else {
          console.warn("File not found in memory or DB:", fileName);
          // Notify user
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.content?.includes("not currently loaded")) return prev;

            return [...prev, {
              role: 'assistant',
              content: `⚠️ The file "${fileName}" is not currently loaded in memory. You can view the chat history, but to perform new analyses, please re-upload the file.`
            }];
          });
        }
      } catch (e) {
        console.error("Failed to restore context:", e);
      }
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    localStorage.removeItem(`chat_messages_${id}`);
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
      setFile(null); // Reset file as well since chat is gone
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={() => {
          setFile(null);
          setCurrentSessionId(null);
          setMessages([]);
        }}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="border-b-2 border-border bg-background sticky top-0 z-50 w-full shrink-0">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center text-primary-foreground font-bold neo-shadow border-2 border-black">
                <Database className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-black tracking-tighter">
                QueryCSV
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
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
                  onClick={() => {
                    setFile(null);
                    setCurrentSessionId(null);
                    setMessages([]);
                  }}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  Reset / New File
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-xl"
              >
                <Card className="border-2 border-border shadow-none neo-shadow bg-card">
                  <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-none flex items-center justify-center mb-4 neo-shadow border-2 border-black">
                      <Database className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tighter lg:text-5xl">
                      QueryCSV
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-foreground">
                      Upload a CSV file to start chatting.
                      <br />
                      <span className="bg-accent text-accent-foreground px-1 font-bold">Private & Secure.</span>
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
                  <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-xl font-bold uppercase tracking-widest">Processing CSV...</p>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full max-w-4xl mx-auto"
              >
                <ChatInterface
                  pyodide={pyodide}
                  columns={columns}
                  fileName={file.name}
                  selectedFile={file}
                  messages={messages}
                  setMessages={setMessages}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
