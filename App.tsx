
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ConnectionPanel } from './components/ConnectionPanel';
import { Terminal } from './components/Terminal';
import { AiChatPanel } from './components/AiChatPanel';
import { ProfilesPanel } from './components/ProfilesPanel';
import { Header } from './components/Header';
import { generateCommand, getMockDeviceInfo } from './services/geminiService';
import { ConnectionProfile, ConnectionSettings, TerminalLine, TerminalLineType } from './types';
import { MOCK_COMMANDS } from './constants';

// FIX: Add Web Serial API type definitions to resolve TypeScript errors.
// These types are not included in standard TypeScript DOM library definitions,
// which causes errors like "Cannot find name 'SerialPort'" (line 27) and
// "Property 'requestPort' does not exist on type 'unknown'" (line 63).
declare global {
    interface SerialPort extends EventTarget {
        readonly readable: ReadableStream<Uint8Array> | null;
        readonly writable: WritableStream<Uint8Array> | null;
        open(options: SerialOptions): Promise<void>;
        close(): Promise<void>;
    }

    interface SerialOptions {
        baudRate: number;
        dataBits?: 7 | 8;
        stopBits?: 1 | 2;
        parity?: 'none' | 'even' | 'odd';
        bufferSize?: number;
        flowControl?: 'none' | 'hardware';
    }

    interface SerialPortRequestOptions {
        filters?: {
            usbVendorId?: number;
            usbProductId?: number;
        }[];
    }
    
    interface Navigator {
        serial: {
            requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
            getPorts(): Promise<SerialPort[]>;
        };
    }
}

const App: React.FC = () => {
    const [connectionSettings, setConnectionSettings] = useState<ConnectionSettings>({
        connectionType: 'SSH',
        host: '192.168.1.1',
        port: '22',
        username: 'admin',
        password: '',
        manufacturer: 'Cisco',
        baudRate: '9600',
        deviceModel: '',
        osVersion: '',
    });
    const [isConnected, setIsConnected] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([]);
    const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);

    // Refs for Web Serial API
    const portRef = useRef<SerialPort | null>(null);
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
    const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
    const keepReadingRef = useRef(true);


    const addTerminalLine = useCallback((text: string, type: TerminalLineType, command?: string) => {
        setTerminalOutput(prev => [...prev, { text, type, command, timestamp: new Date().toLocaleTimeString() }]);
    }, []);

    useEffect(() => {
        try {
            const savedProfiles = localStorage.getItem('netintelli-profiles');
            if (savedProfiles) {
                setProfiles(JSON.parse(savedProfiles));
            }
        } catch (error) {
            console.error("Failed to load profiles from localStorage", error);
        }
        addTerminalLine("Welcome to NetIntelli X. Please configure your connection and click 'Connect'.", TerminalLineType.SYSTEM);
        if (!('serial' in navigator)) {
            addTerminalLine("Warning: Your browser does not support the Web Serial API. 'Serial' connection type is unavailable.", TerminalLineType.ERROR);
        }
    }, [addTerminalLine]);


    const handleConnect = useCallback(async () => {
        if (isConnected) return;

        if (connectionSettings.connectionType === 'Serial') {
            if (!('serial' in navigator)) {
                addTerminalLine("Error: Web Serial API not supported by your browser. Use Chrome or Edge.", TerminalLineType.ERROR);
                return;
            }
            try {
                addTerminalLine("Requesting serial port access...", TerminalLineType.SYSTEM);
                const port = await navigator.serial.requestPort();
                portRef.current = port;
                
                await port.open({ baudRate: parseInt(connectionSettings.baudRate || '9600', 10) });

                setIsConnected(true);
                addTerminalLine(`Serial port connected. Baud rate: ${connectionSettings.baudRate}`, TerminalLineType.SUCCESS);
                
                writerRef.current = port.writable!.getWriter();

                // Start read loop
                keepReadingRef.current = true;
                readerRef.current = port.readable!.getReader();
                const decoder = new TextDecoder();
                
                while (port.readable && keepReadingRef.current) {
                    try {
                        const { value, done } = await readerRef.current.read();
                        if (done) {
                            break;
                        }
                        if (value) {
                            addTerminalLine(decoder.decode(value), TerminalLineType.OUTPUT);
                        }
                    } catch (error) {
                        if (keepReadingRef.current) {
                           addTerminalLine(`Serial read error: ${(error as Error).message}`, TerminalLineType.ERROR);
                        }
                        break;
                    }
                }

            } catch (error) {
                addTerminalLine(`Failed to connect to serial port: ${(error as Error).message}`, TerminalLineType.ERROR);
            }
        } else {
            // Simulated connection
            setIsConnected(true);
            addTerminalLine(`Simulating connection to ${connectionSettings.host} (${connectionSettings.manufacturer})...`, TerminalLineType.SYSTEM);
            
            if (connectionSettings.username) {
                setTimeout(() => {
                    addTerminalLine(`> login as: ${connectionSettings.username}`, TerminalLineType.OUTPUT);
                }, 500);
                 setTimeout(() => {
                    addTerminalLine(`> password: ****`, TerminalLineType.OUTPUT);
                }, 1000);
                 setTimeout(() => {
                    addTerminalLine(`Connection established.`, TerminalLineType.SUCCESS);
                    addTerminalLine(`${connectionSettings.manufacturer}>`, TerminalLineType.PROMPT);
                }, 1500);
            } else {
                 setTimeout(() => {
                    addTerminalLine(`Connection established.`, TerminalLineType.SUCCESS);
                    addTerminalLine(`${connectionSettings.manufacturer}>`, TerminalLineType.PROMPT);
                }, 1000);
            }
        }
    }, [isConnected, addTerminalLine, connectionSettings]);

    const handleDisconnect = useCallback(async () => {
        if (!isConnected) return;

        if (connectionSettings.connectionType === 'Serial' && portRef.current) {
            addTerminalLine(`Disconnecting from serial port...`, TerminalLineType.SYSTEM);
            keepReadingRef.current = false;
            
            if (writerRef.current) {
                await writerRef.current.close().catch(e => console.error("Failed to close writer", e));
                writerRef.current = null;
            }
            if (readerRef.current) {
                await readerRef.current.cancel().catch(e => console.error("Failed to cancel reader", e));
                readerRef.current.releaseLock();
                readerRef.current = null;
            }
            await portRef.current.close().catch(e => console.error("Failed to close port", e));
            portRef.current = null;

            setIsConnected(false);
            addTerminalLine("Serial connection closed.", TerminalLineType.ERROR);

        } else {
            // Simulated disconnection
            setIsConnected(false);
            addTerminalLine(`Disconnecting from ${connectionSettings.host}...`, TerminalLineType.SYSTEM);
            addTerminalLine("Connection closed.", TerminalLineType.ERROR);
        }
        setConnectionSettings(prev => ({ ...prev, deviceModel: '', osVersion: '' }));
    }, [isConnected, addTerminalLine, connectionSettings]);

    const handleCommandSubmit = useCallback(async (command: string) => {
        if (!isConnected || !command) return;

        if (connectionSettings.connectionType === 'Serial' && writerRef.current) {
             addTerminalLine(command, TerminalLineType.INPUT, `> `);
             const encoder = new TextEncoder();
             await writerRef.current.write(encoder.encode(command + '\r\n'));
        } else {
            const prompt = `${connectionSettings.manufacturer}>`;
            addTerminalLine(command, TerminalLineType.INPUT, prompt);
        
            const mockOutput = MOCK_COMMANDS[command.toLowerCase() as keyof typeof MOCK_COMMANDS];

            setTimeout(() => {
                if (mockOutput) {
                    addTerminalLine(mockOutput, TerminalLineType.OUTPUT);
                } else if (command.toLowerCase() === 'clear') {
                    setTerminalOutput([]);
                } else {
                    addTerminalLine(`% Unrecognized command: "${command}"`, TerminalLineType.ERROR);
                }
                addTerminalLine(prompt, TerminalLineType.PROMPT);
            }, 500 + Math.random() * 500);
        }
    }, [isConnected, addTerminalLine, connectionSettings]);

    const handleAiGenerate = useCallback(async (prompt: string): Promise<string> => {
        const { manufacturer, deviceModel, osVersion } = connectionSettings;
        const context = terminalOutput.slice(-10).map(l => l.text).join('\n');
        
        addTerminalLine(`AI is thinking... Request: "${prompt}"`, TerminalLineType.SYSTEM);

        try {
            const generated = await generateCommand(prompt, manufacturer, context, deviceModel, osVersion);
            addTerminalLine(`AI generated command(s).`, TerminalLineType.SUCCESS);
            return generated;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addTerminalLine(`AI Error: ${errorMessage}`, TerminalLineType.ERROR);
            if (errorMessage.includes("API_KEY")) {
                 addTerminalLine(`Please ensure your Gemini API key is correctly configured as an environment variable.`, TerminalLineType.ERROR);
            }
            return '';
        }
    }, [connectionSettings, terminalOutput, addTerminalLine]);

    const handleFetchDeviceInfo = useCallback(async () => {
        if (!isConnected) {
            addTerminalLine("Error: Must be connected to a device to fetch info.", TerminalLineType.ERROR);
            return;
        }
        addTerminalLine(`Fetching device info for ${connectionSettings.manufacturer} via AI...`, TerminalLineType.SYSTEM);
        try {
            const { model, version } = await getMockDeviceInfo(connectionSettings.manufacturer);
            setConnectionSettings(prev => ({...prev, deviceModel: model, osVersion: version}));
            addTerminalLine(`AI identified device: Model=${model}, Version=${version}`, TerminalLineType.SUCCESS);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addTerminalLine(`AI Error fetching device info: ${errorMessage}`, TerminalLineType.ERROR);
        }
    }, [isConnected, connectionSettings.manufacturer, addTerminalLine]);

    const handleSaveProfile = (name: string) => {
        if (!name) {
            alert("Profile name cannot be empty.");
            return;
        }
        const newProfile: ConnectionProfile = { name, settings: connectionSettings };
        const updatedProfiles = [...profiles.filter(p => p.name !== name), newProfile];
        setProfiles(updatedProfiles);
        localStorage.setItem('netintelli-profiles', JSON.stringify(updatedProfiles));
        addTerminalLine(`Profile "${name}" saved.`, TerminalLineType.SUCCESS);
    };

    const handleLoadProfile = (profile: ConnectionProfile) => {
        if (isConnected) {
            alert("Please disconnect before loading a new profile.");
            return;
        }
        setConnectionSettings(profile.settings);
        addTerminalLine(`Profile "${profile.name}" loaded.`, TerminalLineType.SYSTEM);
    };

    const handleDeleteProfile = (name: string) => {
        const updatedProfiles = profiles.filter(p => p.name !== name);
        setProfiles(updatedProfiles);
        localStorage.setItem('netintelli-profiles', JSON.stringify(updatedProfiles));
        addTerminalLine(`Profile "${name}" deleted.`, TerminalLineType.SUCCESS);
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
                <aside className="w-full md:w-1/4 flex flex-col gap-4">
                    <ConnectionPanel
                        settings={connectionSettings}
                        setSettings={setConnectionSettings}
                        isConnected={isConnected}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        onFetchInfo={handleFetchDeviceInfo}
                    />
                    <ProfilesPanel
                        profiles={profiles}
                        onSave={handleSaveProfile}
                        onLoad={handleLoadProfile}
                        onDelete={handleDeleteProfile}
                    />
                </aside>
                <div className="w-full md:w-3/4 flex flex-col gap-4">
                    <AiChatPanel onGenerate={handleAiGenerate} onPushCommand={handleCommandSubmit} isConnected={isConnected} />
                    <Terminal
                        output={terminalOutput}
                        onSubmit={handleCommandSubmit}
                        isConnected={isConnected}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;
