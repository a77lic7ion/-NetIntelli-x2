
import React from 'react';
import { ConnectionSettings } from '../types';
import { CONNECTION_TYPES, MANUFACTURERS, BAUD_RATES } from '../constants';
import { ConnectIcon, DisconnectIcon, GearIcon, AiIcon } from './icons';

interface ConnectionPanelProps {
    settings: ConnectionSettings;
    setSettings: React.Dispatch<React.SetStateAction<ConnectionSettings>>;
    isConnected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    onFetchInfo: () => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {children}
    </div>
);

const commonInputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";
const commonSelectClasses = `${commonInputClasses} appearance-none`;


export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ settings, setSettings, isConnected, onConnect, onDisconnect, onFetchInfo }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 shadow-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><GearIcon /> Connection</h2>
            <div className="space-y-4">
                <FormField label="Connection Type">
                    <select name="connectionType" value={settings.connectionType} onChange={handleChange} className={commonSelectClasses} disabled={isConnected}>
                        {CONNECTION_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                </FormField>
                <FormField label="Manufacturer">
                    <select name="manufacturer" value={settings.manufacturer} onChange={handleChange} className={commonSelectClasses} disabled={isConnected}>
                        {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
                    </select>
                </FormField>
                
                <div className="flex gap-2">
                    <button
                        onClick={onFetchInfo}
                        disabled={!isConnected}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                    >
                         <AiIcon className="w-4 h-4" /> Fetch Device Info
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Device Model">
                        <input type="text" value={settings.deviceModel || ''} className={`${commonInputClasses} bg-gray-800 cursor-default`} readOnly placeholder="N/A" />
                    </FormField>
                    <FormField label="OS Version">
                        <input type="text" value={settings.osVersion || ''} className={`${commonInputClasses} bg-gray-800 cursor-default`} readOnly placeholder="N/A" />
                    </FormField>
                </div>

                {settings.connectionType === 'Serial' ? (
                     <FormField label="Baud Rate">
                        <select name="baudRate" value={settings.baudRate} onChange={handleChange} className={commonSelectClasses} disabled={isConnected}>
                            {BAUD_RATES.map(rate => <option key={rate} value={rate}>{rate}</option>)}
                        </select>
                    </FormField>
                ) : (
                    <>
                        <FormField label="Host">
                            <input type="text" name="host" value={settings.host} onChange={handleChange} className={commonInputClasses} disabled={isConnected} />
                        </FormField>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Port">
                                <input type="text" name="port" value={settings.port} onChange={handleChange} className={commonInputClasses} disabled={isConnected} />
                            </FormField>
                        </div>
                        <FormField label="Username">
                            <input type="text" name="username" value={settings.username} onChange={handleChange} className={commonInputClasses} disabled={isConnected} />
                        </FormField>
                        <FormField label="Password">
                            <input type="password" name="password" value={settings.password} onChange={handleChange} className={commonInputClasses} placeholder="••••••••" disabled={isConnected} />
                        </FormField>
                    </>
                )}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onConnect}
                        disabled={isConnected}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                    >
                        <ConnectIcon /> Connect
                    </button>
                    <button
                        onClick={onDisconnect}
                        disabled={!isConnected}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                    >
                        <DisconnectIcon /> Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
};
