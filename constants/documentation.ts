export const ETHICAL_USE_GUIDE = `
# 🛡️ Ethical Use & Community Guidelines

**OpenYARA-Hunt** is a powerful tool designed for defensive cybersecurity purposes. Its effectiveness relies on the responsible and ethical conduct of its users. Adherence to these principles ensures that the tool is used to strengthen security, not undermine it, and fosters a collaborative and trustworthy community.

---

# **Core Principles of Ethical Use**

1.  **Purpose-Bound Operation:**
    -   This tool is intended exclusively for lawful, defensive activities such as threat hunting, digital forensics, incident response, and security research.
    -   **Prohibited Use:** Any activity that is illegal, malicious, or violates privacy or authorization is strictly forbidden. This includes, but is not limited to, unauthorized scanning, offensive operations, or creating rules to target individuals or organizations without consent.

2.  **Respect for Privacy and Data:**
    -   When using the Hunt Simulator, ensure you have the legal right and proper authorization to scan the files in your test corpus.
    -   Avoid using personally identifiable information (PII) or sensitive corporate data in public forums, rule descriptions, or when sharing results, unless it has been properly anonymized.

3.  **Integrity in Rule Creation:**
    -   **Minimize False Positives:** Strive to create YARA rules that are precise and targeted. A high false-positive rate can disrupt operations and lead to alert fatigue. Test your rules against a diverse corpus of benign files.
    -   **Clarity and Transparency:** Write clear, descriptive metadata for your rules. A good rule explains what it detects, why it's suspicious, and provides context (like associated malware families or CVEs). This helps others understand and trust your work.

4.  **Responsible Disclosure:**
    -   If your threat hunting activities uncover a potential vulnerability or an active compromise in a system you are authorized to test, follow responsible disclosure protocols.
    -   Report your findings to the appropriate entity (e.g., the system owner, IT security team) privately and allow them a reasonable amount of time to remediate before any public disclosure.

---

# **Community Contribution & Collaboration**

-   **Share Knowledge, Not Exploits:** When contributing rules or playbooks, focus on detection and mitigation logic. Do not share active exploit code or instructions on how to cause harm.
-   **Constructive Feedback:** Provide helpful, respectful feedback on contributions from others. The goal is collective improvement.
-   **Attribute Diligently:** When adapting or using a rule from another author, give proper credit in the \`meta\` section. Upholding the spirit of open source is crucial.

By using OpenYARA-Hunt, you agree to uphold these ethical standards. Your commitment helps ensure that our collective efforts are channeled towards building a more secure digital world for everyone.
`;

export const CONTRIBUTING_GUIDE = `
# Contributing to OpenYARA-Hunt

We welcome contributions from the community! Your help is essential for keeping this project great.

# How to Contribute

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix (e.g., \`git checkout -b feature/add-new-rule\` or \`fix/update-playbook\`).
3.  **Add your changes.** This could be a new YARA rule, an improved playbook, or a code enhancement.
4.  **Test your changes.** Ensure your new rules are syntactically correct and, if possible, test them against a corpus of benign samples to minimize false positives.
5.  **Submit a pull request.** Provide a clear description of your changes and why you think they should be included.

# Rule Submission Guidelines

-   Rules should be well-commented, including \`meta\` sections with an author, date, and a clear description of the rule's purpose.
-   Use descriptive names for rules and strings (e.g., \`Suspicious_PowerShell_EncodedCommand\` instead of \`rule1\`).
-   Please add relevant tags and CVEs if applicable when editing the rule in the library.
-   Ensure your rule is tested against benign samples to minimize the risk of false positives.

Thank you for contributing to the security community!
`;
