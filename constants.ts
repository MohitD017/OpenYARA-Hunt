
import { YaraRule } from './types.ts';

export const SAMPLE_RULES: YaraRule[] = [
  {
    id: 'ransomware_wannacry_indicator_1',
    name: 'Ransomware_WannaCry_Indicator',
    category: 'Ransomware',
    tags: ['ransomware', 'wannacry', 'crypto'],
    cve: ['CVE-2017-0144'],
    content: `rule WannaCry_Indicator
{
    meta:
        description = "Detects WannaCry ransomware indicators"
        author = "Mohit A. Dhabuwala"
        date = "2023-10-27"
    strings:
        $s1 = "WANNACRY" fullword wide
        $s2 = ".wnry" fullword wide
        $s3 = "tasksche.exe" fullword
    condition:
        uint16(0) == 0x5a4d and any of them
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2023-10-27',
    description: 'Detects WannaCry ransomware indicators',
  },
  {
    id: 'advanced_suspicious_pdb_leak',
    name: 'Suspicious_PDB_Leak',
    category: 'Advanced Forensics',
    tags: ['forensics', 'leak', 'pdb', 'devinfo'],
    content: `import "pe"

rule Suspicious_PDB_Leak {
    meta:
        description = "Detects binaries with embedded PDB paths leaking developer info"
        author = "Mohit A. Dhabuwala"
    strings:
        $pdb = /C:\\Users\\(?!Public)[A-Za-z0-9_]+\\source\\repos\\.*\\.pdb/ nocase
    condition:
        pe.has_debug and $pdb
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2024-07-26',
    description: 'Detects binaries with embedded PDB paths leaking developer info',
  },
  {
    id: 'advanced_suspicious_base64_blob',
    name: 'Suspicious_Base64_Blob',
    category: 'Advanced Forensics',
    tags: ['obfuscation', 'payload', 'base64'],
    content: `rule Suspicious_Base64_Blob {
    meta:
        description = "Detects large base64-encoded blobs used for hidden payloads"
        author = "Mohit A. Dhabuwala"
    strings:
        $b64 = /([A-Za-z0-9+\\/]{100,}={0,2})/
    condition:
        filesize < 500KB and $b64
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2024-07-26',
    description: 'Detects large base64-encoded blobs used for hidden payloads',
  },
    {
    id: 'advanced_fake_system_dll',
    name: 'Fake_System_DLL',
    category: 'Advanced Forensics',
    tags: ['masquerading', 'dll', 'system', 'evasion'],
    content: `import "pe"

rule Fake_System_DLL {
    meta:
        description = "Detects DLLs masquerading as Windows system components"
        author = "Mohit A. Dhabuwala"
    condition:
        pe.is_dll and
        for any i in (0..pe.number_of_sections - 1):
            pe.sections[i].name == ".data" and
            pe.number_of_exports < 2 and
            filesize < 100KB and
            (pe.rich_signature.clear_data_size == 0)
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2024-07-26',
    description: 'Detects DLLs masquerading as Windows system components',
  },
  {
    id: 'advanced_embedded_rc4_keyschedule',
    name: 'Embedded_RC4_KeySchedule',
    category: 'Advanced Forensics',
    tags: ['crypto', 'rc4', 'embedded'],
    cve: ['CVE-2020-0601'],
    content: `rule Embedded_RC4_KeySchedule {
    meta:
        description = "Detects embedded RC4 key scheduling algorithms"
        author = "Mohit A. Dhabuwala"
    strings:
        $loop = { 8B 45 ?? 33 C9 8A 14 08 8A 4D ?? 02 CA 88 4C 08 ?? 41 3B 4D ?? 7C EF }
    condition:
        $loop
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2024-07-26',
    description: 'Detects embedded RC4 key scheduling algorithms',
  },
  {
    id: 'advanced_antivm_checks',
    name: 'AntiVM_Checks',
    category: 'Advanced Forensics',
    tags: ['antivm', 'sandbox', 'evasion'],
    content: `rule AntiVM_Checks {
    meta:
        description = "Detects binaries checking for virtualization or sandbox environments"
        author = "Mohit A. Dhabuwala"
    strings:
        $vm1 = "VBoxGuest" ascii
        $vm2 = "vmtoolsd.exe" ascii
        $reg = "HARDWARE\\ACPI\\DSDT\\VBOX__" wide nocase
    condition:
        any of them
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2024-07-26',
    description: 'Detects binaries checking for virtualization or sandbox environments',
  },
  {
    id: 'advanced_timestomp_detection',
    name: 'TimeStomp_Detection',
    category: 'Advanced Forensics',
    tags: ['forensics', 'timestomp', 'antiforensics'],
    content: `import "pe"

rule TimeStomp_Detection {
    meta:
        description = "Detects PE files with suspicious future compile timestamps"
        author = "Mohit A. Dhabuwala"
    condition:
        pe.timestamp > uint32(0x64000000) // beyond 2025-03-01
}`,
    author: 'Mohit A. Dhabuwala',
    lastModified: '2024-07-26',
    description: 'Detects PE files with suspicious future compile timestamps',
  },
];

export const VELOCIRAPTOR_PLAYBOOK = `name: YaraScanOnEndpoints
description: |
  Scans specified paths on endpoints using a collection of YARA rules.
  This playbook is designed for live threat hunting and forensic analysis.

parameters:
- name: TargetPaths
  type: list
  default:
  - "C:/Users/**/Downloads/**"
  - "C:/Windows/Temp/**"
- name: YaraRules
  type: text
  description: "A single string containing all YARA rules to be used."
  default: |
    // Paste YARA rules here for the hunt

sources:
- queries:
  - name: ScanFilesWithYara
    query: |
      LET rules <= YaraRules
      
      SELECT
          Target.Path,
          yara(rules=rules, files=Target.Path) as YaraMatch
      FROM glob(globs=TargetPaths)
      WHERE YaraMatch.matches
`;

export const HUNTBOARD_TEMPLATE = `# Huntboard: Suspicious Process Execution

**Objective:** Identify and analyze potentially malicious process executions related to a suspected ransomware outbreak.

**Hypothesis:** Attackers are using living-off-the-land binaries (LOLBins) like PowerShell or WMI to execute malicious payloads and evade detection.

---

### **Indicators & Search Queries**

| Indicator Type       | Query / Search Logic                                    | Tool           |
|----------------------|---------------------------------------------------------|----------------|
| Process Execution    | - PowerShell with encoded commands                      | EDR / SIEM     |
|                      | - \`wmic.exe process call create\`                       | EDR / SIEM     |
|                      | - Unusual parent-child process relationships            | Velociraptor   |
| File System          | - Files with extensions like \`.wnry\`, \`.locked\`        | YARA Scan      |
|                      | - Creation of suspicious scheduled tasks                | OS Artifacts   |
| Network Traffic      | - C2 communication to known malicious IPs/domains       | Firewall Logs  |

---

### **Triage & Analysis Steps**

1.  **Run Initial YARA Scan:** Deploy YARA rules targeting known ransomware families against volatile memory and key disk locations.
2.  **Analyze Process Trees:** For any hits, examine the full process execution chain. Who spawned the process? What were the command-line arguments?
3.  **Inspect Network Connections:** Correlate process activity with network logs to identify potential C2 channels.
4.  **Contain Host:** If high-confidence indicators are found, isolate the affected host from the network.
5.  **Collect Evidence:** Acquire memory dumps, disk images, and relevant log files for deeper forensic analysis.

---

### **Evidence Sources**

- [ ] EDR Process Logs
- [ ] YARA Scan Results (JSON Report)
- [ ] Memory Dump (\`.vmem\`)
- [ ] Network Packet Capture (\`.pcap\`)
- [ ] Windows Event Logs (Security, System, PowerShell)
`;