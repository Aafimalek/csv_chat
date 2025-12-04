"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Code2, Terminal } from 'lucide-react';
import ResultDisplay from './ResultDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    plot?: string | null;
    code?: string;
}

interface ChatInterfaceProps {
    pyodide: any;
    columns: string[];
    fileName: string;
    selectedFile: File | null;
    messages: Message[];
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

export default function ChatInterface({ pyodide, columns, fileName, selectedFile, messages, setMessages }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Check if df is loaded using JS API
        try {
            const isDfLoaded = pyodide.globals.get('df');

            if (!isDfLoaded) {
                // Try to reload if file exists using FS API
                let fileExists = false;
                try {
                    pyodide.FS.stat(fileName);
                    fileExists = true;
                } catch (e) {
                    fileExists = false;
                }

                if (fileExists) {
                    console.log("Reloading df from file:", fileName);
                    pyodide.runPython(`
                        import pandas as pd
                        df = pd.read_csv('${fileName.replace(/'/g, "\\'")}')
                    `);
                } else if (selectedFile && selectedFile.name === fileName && typeof selectedFile.text === 'function') {
                    // Recovery: Write file to FS if we have the object
                    console.log("Restoring file to FS from memory:", fileName);
                    const text = await selectedFile.text();
                    pyodide.FS.writeFile(fileName, text);
                    pyodide.runPython(`
                        import pandas as pd
                        df = pd.read_csv('${fileName.replace(/'/g, "\\'")}')
                    `);
                } else {
                    console.warn("File not found in FS:", fileName);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: "⚠️ Error: The dataset is not currently loaded in memory. Please re-upload the CSV file to continue analysis."
                    }]);
                    setIsLoading(false);
                    return;
                }
            }
        } catch (e) {
            console.error("Error checking df state:", e);
        }

        try {
            const response = await fetch('http://localhost:8000/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ columns, question: userMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to generate code' }));
                throw new Error(errorData.detail || 'Failed to generate code');
            }

            const data = await response.json();
            const code = data.code;

            pyodide.runPython(`
        import sys
        import io
        import matplotlib.pyplot as plt
        plt.close('all')
        sys.stdout = io.StringIO()
      `);

            await pyodide.runPythonAsync(code);

            const stdout = pyodide.runPython("sys.stdout.getvalue()");

            let plotBase64 = null;
            const hasPlot = pyodide.runPython(`
        import matplotlib.pyplot as plt
        len(plt.get_fignums()) > 0
      `);

            if (hasPlot) {
                pyodide.runPython(`
          import io
          import base64
          buf = io.BytesIO()
          plt.savefig(buf, format='png')
          buf.seek(0)
          img_str = base64.b64encode(buf.read()).decode('utf-8')
          plt.close('all')
        `);
                plotBase64 = pyodide.globals.get('img_str');
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: stdout || "Done.",
                plot: plotBase64,
                code: code
            }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full w-full max-w-4xl mx-auto border-border shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-primary" />
                            Chatting with {fileName}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            {columns.length} columns available for analysis
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[500px] max-h-[600px] scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 opacity-50">
                        <Bot className="w-12 h-12" />
                        <div>
                            <p className="text-lg font-medium">Ask questions about your data</p>
                            <p className="text-sm mt-1">Try: "Show me the distribution of {columns[0]}"</p>
                        </div>
                    </div>
                )}
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={cn("flex w-full", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                            <div className={cn(
                                "flex gap-3 max-w-[90%]",
                                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={cn(
                                    "rounded-none p-4 shadow-sm neo-border",
                                    msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted/50 border border-border rounded-tl-none'
                                )}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {msg.code && (
                                                <details className="group">
                                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1 list-none">
                                                        <Code2 className="w-3 h-3" />
                                                        <span className="group-open:hidden">View Generated Code</span>
                                                        <span className="hidden group-open:inline">Hide Generated Code</span>
                                                    </summary>
                                                    <div className="mt-2 rounded-md bg-black/90 p-3 overflow-x-auto border border-border/50">
                                                        <pre className="text-xs text-green-400 font-mono">
                                                            {msg.code}
                                                        </pre>
                                                    </div>
                                                </details>
                                            )}
                                            <ResultDisplay output={msg.content} plotImage={msg.plot || null} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Analyzing data...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-border">
                <form onSubmit={handleSubmit} className="flex gap-2 relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your data..."
                        className="pr-24 h-12 bg-background/50"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-1 top-1 bottom-1 h-auto px-4"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                    </Button>
                </form>
            </div>
        </Card>
    );
}
