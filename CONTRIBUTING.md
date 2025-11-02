# Contributing to OpenYARA-Hunt

We welcome contributions from the community! Your help is essential for keeping this project great.

## How to Contribute

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix (e.g., `git checkout -b feature/add-new-rule` or `fix/update-playbook`).
3.  **Add your changes.** This could be a new YARA rule, an improved playbook, or a code enhancement.
4.  **Test your changes.** Ensure your new rules are syntactically correct and, if possible, test them against a corpus of benign samples to minimize false positives.
5.  **Submit a pull request.** Provide a clear description of your changes and why you think they should be included.

## Rule Submission Guidelines

-   Rules should be well-commented, including `meta` sections with an author, date, and a clear description of the rule's purpose.
-   Use descriptive names for rules and strings (e.g., `Suspicious_PowerShell_EncodedCommand` instead of `rule1`).
-   Please add relevant tags and CVEs if applicable when editing the rule in the library.
-   Ensure your rule is tested against benign samples to minimize the risk of false positives.

Thank you for contributing to the security community!