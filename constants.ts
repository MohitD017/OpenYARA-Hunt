import { YaraRule } from './types';

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

// Fix: Corrected a syntax error where the closing backtick of the template literal was escaped.
export const README_CONTENT = `
# OpenYARA-Hunt

An Open YARA Rule Library and CI-driven Threat-Hunting Framework. This project provides a modular, tested, and continuously validated YARA rule repository, complete with playbooks and metrics for digital forensics and threat hunting.

## ✨ Features

- **Interactive Rule Editor:** View and manage your library of YARA rules.
- **AI-Powered Rule Generation:** Create new YARA rules from natural language threat descriptions using the Gemini API.
- **Threat Hunt Simulator:** Test your rules against a corpus of files and get instant feedback.
- **Metrics Dashboard:** Automatically calculate and visualize rule performance (Precision, Recall, F1-Score).
- **Integrated Playbooks:** View Velociraptor playbooks and huntboard templates directly in the app.
- **Comprehensive Documentation:** Easy access to project documentation and contribution guidelines.

## 🚀 Quickstart

1.  **Navigate to the Hunt Simulator:** The default view.
2.  **Select Rules:** Check the boxes next to the YARA rules you want to use.
3.  **Upload Files:** Drag and drop or select benign files to act as your test corpus.
4.  **Run Hunt:** Click the "Run Hunt" button.
5.  **Analyze Results:** View the structured JSON report and performance metrics in the dashboard below.

## 🤖 AI Rule Generation

1.  Navigate to the "AI Rule Generator" via the sidebar.
2.  Describe a threat (e.g., "A file that creates a scheduled task called 'Updater' and contains the string 'evil.exe'").
3.  Click "Generate Rule".
4.  The AI will generate a YARA rule, which is automatically added to your library.
`;

// Fix: Corrected a syntax error where the closing backtick of the template literal was escaped.
export const CONTRIBUTING_GUIDE = `
# Contributing to OpenYARA-Hunt

We welcome contributions from the community!

## How to Contribute

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix.
3.  **Add your changes.** This could be a new YARA rule, an improved playbook, or a code enhancement.
4.  **Test your changes.** Ensure your new rules are syntactically correct and do not generate false positives against the test corpus.
5.  **Submit a pull request.** Provide a clear description of your changes.

## Rule Submission Guidelines

- Rules should be well-commented, including meta sections with author, date, and description.
- Use descriptive names for rules and strings.
- Ensure your rule is tested against benign samples to minimize false positives.
`;