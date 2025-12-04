"use client";
import { useState, useCallback } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            className={cn(
                "w-full max-w-xl p-12 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden",
                isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 bg-card"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleChange}
            />
            <div className={cn(
                "p-4 rounded-full mb-4 transition-all duration-300",
                isDragging ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
                {isDragging ? <FileUp className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Upload your CSV file</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs group-hover:text-foreground/80 transition-colors">
                Drag and drop your file here, or click to browse to start analyzing your data
            </p>
        </div>
    );
}
