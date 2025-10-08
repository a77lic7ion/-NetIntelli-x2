
import { ConnectionType, DeviceManufacturer } from './types';

export const CONNECTION_TYPES: ConnectionType[] = ['SSH', 'Telnet', 'Serial'];
export const MANUFACTURERS: DeviceManufacturer[] = ['Cisco', 'Juniper', 'Arista', 'Huawei', 'H3C'];
export const BAUD_RATES: string[] = ['9600', '19200', '38400', '57600', '115200'];

export const MOCK_COMMANDS = {
    'show version': `Cisco IOS Software, C880 Software (C880DATA-UNIVERSALK9-M), Version 15.0(1)M, RELEASE SOFTWARE (fc2)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2010 by Cisco Systems, Inc.
Compiled Wed 23-Jun-10 14:19 by prod_rel_team

ROM: System Bootstrap, Version 12.4(22r)T, RELEASE SOFTWARE (fc1)

Router uptime is 1 week, 2 days, 3 hours, 4 minutes
System returned to ROM by power-on
System image file is "flash:c880data-universalk9-mz.150-1.M.bin"`,
    'show running-config': `Building configuration...

Current configuration : 1337 bytes
!
version 15.0
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname Router
!
boot-start-marker
boot-end-marker
!
!
!
no ip domain lookup
!
interface FastEthernet0
 ip address 192.168.1.1 255.255.255.0
 duplex auto
 speed auto
!
... (output truncated) ...`,
    'show ip interface brief': `Interface                  IP-Address      OK? Method Status                Protocol
FastEthernet0              192.168.1.1     YES manual up                    up      
FastEthernet1              unassigned      YES unset  administratively down down    
Vlan1                      unassigned      YES unset  administratively down down`,
    '?': `Exec commands:
  access-enable    Create a temporary Access-List entry
  access-profile   Apply user-profile to interface
  access-template  Create a temporary Access-List entry
  clear            Reset functions
  configure        Enter configuration mode
  connect          Open a terminal connection
  ... (more commands) ...`
};
