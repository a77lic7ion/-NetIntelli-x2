
import React, { useState } from 'react';
import { ConnectionProfile } from '../types';
import { SaveIcon, ProfileIcon, TrashIcon } from './icons';

interface ProfilesPanelProps {
    profiles: ConnectionProfile[];
    onSave: (name: string) => void;
    onLoad: (profile: ConnectionProfile) => void;
    onDelete: (name: string) => void;
}

export const ProfilesPanel: React.FC<ProfilesPanelProps> = ({ profiles, onSave, onLoad, onDelete }) => {
    const [profileName, setProfileName] = useState('');

    const handleSaveClick = () => {
        onSave(profileName);
        setProfileName('');
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 shadow-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ProfileIcon /> Profiles</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    placeholder="New profile name"
                />
                <button
                    onClick={handleSaveClick}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition"
                >
                    <SaveIcon /> Save
                </button>
            </div>
            <div className="space-y-2">
                {profiles.length > 0 ? (
                    profiles.map(profile => (
                        <div key={profile.name} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md text-sm">
                            <span className="font-medium">{profile.name}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onLoad(profile)}
                                    className="text-cyan-400 hover:text-cyan-300"
                                    title="Load Profile"
                                >
                                   Load
                                </button>
                                <button
                                    onClick={() => onDelete(profile.name)}
                                    className="text-red-400 hover:text-red-300"
                                    title="Delete Profile"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center text-sm py-2">No saved profiles.</p>
                )}
            </div>
        </div>
    );
};
