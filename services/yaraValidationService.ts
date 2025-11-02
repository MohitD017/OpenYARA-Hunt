interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Performs basic syntax validation on a YARA rule.
 * This is not a full parser but checks for common structural issues.
 * @param content The string content of the YARA rule.
 * @returns A ValidationResult object.
 */
export const validateYaraRule = (content: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    errors.push("Rule content cannot be empty.");
    return { isValid: false, errors };
  }

  // 1. Rule declaration check: starts with 'rule <name> {'
  if (!/^\s*(?:private\s+)?rule\s+([a-zA-Z_]\w*)\s*\{/s.test(trimmedContent)) {
    errors.push("Rule must start with 'rule <RuleName> {'.");
  }

  // 2. Rule block closing check: ends with '}'
  if (!/\}\s*$/.test(trimmedContent)) {
      errors.push("Rule block is not properly closed with '}'.");
  }

  // 3. Balanced braces check
  const openBraces = (trimmedContent.match(/{/g) || []).length;
  const closeBraces = (trimmedContent.match(/}/g) || []).length;
  if (openBraces < 1) {
    errors.push("Missing opening '{' for rule block.");
  }
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched curly braces. Found ${openBraces} opening and ${closeBraces} closing braces.`);
  }

  // 4. Mandatory condition section check
  if (!/condition\s*:/s.test(trimmedContent)) {
    errors.push("A 'condition' section is mandatory.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
