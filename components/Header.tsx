
import React from 'react';
import { NetworkIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
                <NetworkIcon className="w-8 h-8 text-cyan-400" />
                <div>
                    <h1 className="text-xl font-bold text-white tracking-wider">NetIntelli X</h1>
                    <p className="text-xs text-gray-400">AI-Powered Network Automation</p>
                </div>
            </div>
        </header>
    );
};
