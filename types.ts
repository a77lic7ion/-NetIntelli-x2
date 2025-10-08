
export type ConnectionType = 'SSH' | 'Telnet' | 'Serial';

export type DeviceManufacturer = 'Cisco' | 'Juniper' | 'Arista' | 'Huawei' | 'H3C';

export interface ConnectionSettings {
    connectionType: ConnectionType;
    host: string;
    port: string;
    username: string;
    password?: string;
    manufacturer: DeviceManufacturer;
    baudRate?: string;
    deviceModel?: string;
    osVersion?: string;
}

export interface ConnectionProfile {
    name: string;
    settings: ConnectionSettings;
}

export enum TerminalLineType {
    INPUT = 'input',
    OUTPUT = 'output',
    ERROR = 'error',
    SYSTEM = 'system',
    PROMPT = 'prompt',
    SUCCESS = 'success',
}

export interface TerminalLine {
    text: string;
    type: TerminalLineType;
    timestamp: string;
    command?: string;
}
