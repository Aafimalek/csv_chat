"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, BarChart3 } from "lucide-react";

interface ResultDisplayProps {
    output: string;
    plotImage: string | null;
}

export default function ResultDisplay({ output, plotImage }: ResultDisplayProps) {
    if (!output && !plotImage) return null;

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {output && (
                <Card className="bg-muted/30 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Terminal className="w-4 h-4" />
                            Analysis Result
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground bg-background/50 p-4 rounded-lg overflow-x-auto border border-border/50">
                            {output}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {plotImage && (
                <Card className="bg-muted/30 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="w-4 h-4" />
                            Visualization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center bg-white rounded-lg overflow-hidden p-2">
                            <img
                                src={`data:image/png;base64,${plotImage}`}
                                alt="Generated Plot"
                                className="max-w-full h-auto rounded-md shadow-sm"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
