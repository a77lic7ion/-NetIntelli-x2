
import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine, TerminalLineType } from '../types';
import { TerminalIcon, DownloadIcon } from './icons';

interface TerminalProps {
    output: TerminalLine[];
    onSubmit: (command: string) => void;
    isConnected: boolean;
}

const TerminalLineDisplay: React.FC<{ line: TerminalLine }> = ({ line }) => {
    const getLineColor = (type: TerminalLineType) => {
        switch (type) {
            case TerminalLineType.INPUT:
                return 'text-cyan-400';
            case TerminalLineType.OUTPUT:
                return 'text-gray-200';
            case TerminalLineType.ERROR:
                return 'text-red-400';
            case TerminalLineType.SYSTEM:
                return 'text-yellow-400';
            case TerminalLineType.PROMPT:
                return 'text-green-400';
            case TerminalLineType.SUCCESS:
                return 'text-green-400';
            default:
                return 'text-gray-200';
        }
    };
    
    return (
        <div className={`whitespace-pre-wrap ${getLineColor(line.type)}`}>
            {line.command && <span className="text-green-400">{line.command}</span>}
            {line.text}
        </div>
    );
};


export const Terminal: React.FC<TerminalProps> = ({ output, onSubmit, isConnected }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const endOfTerminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [output]);
    
    useEffect(() => {
        if(isConnected) {
            inputRef.current?.focus();
        }
    }, [isConnected]);

    const handleExport = () => {
        if (output.length === 0) return;
        const header = `NetIntelli X Terminal Export - ${new Date().toLocaleString()}\n\n`;
        const content = output.map(line => {
            const prefix = line.command ? `${line.command} ` : '';
            return `[${line.timestamp}] ${prefix}${line.text}`;
        }).join('\n');
        
        const blob = new Blob([header, content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().slice(0, 10);
        link.download = `netintelli-x-export-${date}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (input.trim()) {
                onSubmit(input);
                if (history[history.length - 1] !== input) {
                    setHistory(prev => [...prev, input]);
                }
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = Math.min(history.length - 1, historyIndex + 1);
                 if (newIndex < history.length - 1 && historyIndex < history.length -1) {
                    setHistoryIndex(newIndex);
                    setInput(history[newIndex]);
                } else {
                    setHistoryIndex(-1);
                    setInput('');
                }
            }
        }
    };

    return (
        <div className="bg-black/50 rounded-lg p-4 shadow-xl flex flex-col flex-grow border border-gray-700 h-[500px]">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><TerminalIcon/> Terminal</h2>
                <button
                    onClick={handleExport}
                    className="text-gray-400 hover:text-white transition disabled:text-gray-600 disabled:cursor-not-allowed"
                    title="Export to TXT"
                    disabled={output.length === 0}
                >
                    <DownloadIcon />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto font-mono text-sm p-2 bg-black/30 rounded-md" onClick={() => inputRef.current?.focus()}>
                {output.map((line, index) => <TerminalLineDisplay key={index} line={line} />)}
                <div ref={endOfTerminalRef} />
            </div>
            <div className="mt-2 flex">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-800 border-none rounded-md py-2 px-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder={isConnected ? 'Type command and press Enter...' : 'Connect to a device to start'}
                    disabled={!isConnected}
                />
            </div>
        </div>
    );
};
