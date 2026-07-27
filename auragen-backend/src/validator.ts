import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedCode?: string;
}

export function validateGeneratedUI(rawCode: string): ValidationResult {
  try {
    // 1. Clean out markdown wrap blocks if the LLM includes them
    let cleanedCode = rawCode.replace(/```jsx|```tsx|```javascript|```typescript|```/gi, '').trim();

    // 2. Parse into Abstract Syntax Tree (AST) to verify layout syntax
    const ast = parse(cleanedCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    let containsMaliciousCode = false;
    let securityViolationMessage = '';

    // 3. Safety Check: Intercept unauthorized execution attempts
    traverse(ast, {
      Identifier(path) {
        const forbiddenTokens = ['eval', 'window', 'document', 'localStorage', 'cookie', 'fetch', 'XMLHttpRequest'];
        if (forbiddenTokens.includes(path.node.name)) {
          containsMaliciousCode = true;
          securityViolationMessage = `Security Exception: Unauthorized runtime access token found [${path.node.name}]`;
        }
      }
    });

    if (containsMaliciousCode) {
      return { isValid: false, error: securityViolationMessage };
    }

    return { isValid: true, sanitizedCode: cleanedCode };

  } catch (syntaxError: any) {
    return {
      isValid: false,
      error: `Compilation Syntax Error: ${syntaxError.message}`
    };
  }
}