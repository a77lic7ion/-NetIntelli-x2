
import React, { useState } from 'react';
import { AiIcon, SendIcon } from './icons';

interface AiChatPanelProps {
    onGenerate: (prompt: string) => Promise<string>;
    onPushCommand: (command: string) => void;
    isConnected: boolean;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({ onGenerate, onPushCommand, isConnected }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedCommands, setGeneratedCommands] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt || isLoading) return;
        setIsLoading(true);
        setGeneratedCommands('');
        try {
            const commands = await onGenerate(prompt);
            setGeneratedCommands(commands);
        } catch (error) {
            console.error("AI generation failed", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const handlePush = (command: string) => {
        if(!isConnected) {
            alert("Please connect to a device first.");
            return;
        }
        onPushCommand(command);
    }
    
    const renderGeneratedCommands = () => {
        if(!generatedCommands) return null;

        const commands = generatedCommands.split('\n').filter(cmd => cmd.trim() !== '');
        
        return (
             <div className="space-y-2">
                {commands.map((cmd, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md">
                        <code className="text-cyan-300">{cmd}</code>
                        <button 
                            onClick={() => handlePush(cmd)}
                            className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-2 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                            disabled={!isConnected}
                            title="Push to terminal"
                        >
                            Push
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 shadow-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><AiIcon /> AI Assistance</h2>
            <div className="flex gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="Enter natural language request... e.g., 'show me the routing table'"
                    rows={2}
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <><SendIcon/> Generate</>
                    )}
                </button>
            </div>
            {(isLoading || generatedCommands) && (
                 <div className="mt-4 p-3 bg-black/30 rounded-md">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Generated Commands:</h3>
                    {isLoading && <p className="text-gray-400 text-sm">Generating, please wait...</p>}
                    {renderGeneratedCommands()}
                </div>
            )}
        </div>
    );
};
