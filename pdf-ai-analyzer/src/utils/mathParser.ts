// Math formula detection and conversion utilities

export interface ParsedFormula {
  id: string;
  original: string;
  latex: string;
  type: 'inline' | 'block' | 'equation';
  variables: string[];
  context?: string;
}

export function detectAndParseMathFormulas(text: string): {
  processedText: string;
  formulas: ParsedFormula[];
} {
  const formulas: ParsedFormula[] = [];
  let processedText = text;
  let formulaIndex = 0;

  // Common math patterns to detect
  const mathPatterns = [
    // Fractions: 1/2, a/b, etc.
    /(\b\w+)\s*\/\s*(\w+\b)/g,
    
    // Exponents: x^2, a^n, etc.
    /(\w+)\s*\^\s*([0-9]+|\w+)/g,
    
    // Square roots: √x, sqrt(x)
    /√([0-9]+|\w+)|sqrt\s*\(([^)]+)\)/gi,
    
    // Logarithms: log_a(x), ln(x), log(x)
    /log_?(\w+)?\s*\(([^)]+)\)|ln\s*\(([^)]+)\)/gi,
    
    // Integrals: ∫...dx, integral of
    /∫([^d]+)d(\w+)/g,
    
    // Summations: Σ, sum from
    /Σ|∑|sum\s+from/gi,
    
    // Limits: lim x→a
    /lim\s*(\w+)\s*→\s*(\w+)/gi,
    
    // Greek letters
    /[αβγδεζηθικλμνξοπρστυφχψω]/gi,
    
    // Mathematical operators
    /[±∓×÷≠≈≡≤≥⊂⊃⊆⊇∈∉∪∩]/g,
    
    // Matrix/vector notation
    /\[\s*[0-9\s,]+\s*\]/g,
    
    // Derivatives: d/dx, ∂/∂x
    /(d|∂)\s*\/\s*(d|∂)(\w+)/g,
  ];

  // Process each pattern
  mathPatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match, ...args) => {
      const formulaId = `formula_${formulaIndex++}`;
      const latex = convertToLatex(match);
      
      formulas.push({
        id: formulaId,
        original: match,
        latex: latex,
        type: determineFormulaType(match),
        variables: extractVariables(match),
      });
      
      // Replace with placeholder that preserves the formula
      return `[MATH:${formulaId}:${latex}]`;
    });
  });

  // Also detect common corrupted patterns from PDF extraction
  const corruptedPatterns = [
    // Corrupted exponents: x2 instead of x²
    /(\w+)([0-9]+)(?=\s|$|[+\-*/])/g,
    
    // Corrupted fractions with special chars
    /([0-9]+)\s*[#$%&]\s*([0-9]+)/g,
    
    // Corrupted integrals
    /([A-Za-z]+)dx\s*\S+\s*K/g,
  ];

  corruptedPatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match, ...args) => {
      const formulaId = `formula_${formulaIndex++}`;
      const latex = fixCorruptedMath(match);
      
      formulas.push({
        id: formulaId,
        original: match,
        latex: latex,
        type: 'inline',
        variables: extractVariables(latex),
        context: 'corrupted_extraction'
      });
      
      return `[MATH:${formulaId}:${latex}]`;
    });
  });

  return { processedText, formulas };
}

function convertToLatex(mathExpression: string): string {
  let latex = mathExpression;
  
  // Basic conversions
  const conversions: [RegExp, string][] = [
    // Fractions
    [/(\w+)\s*\/\s*(\w+)/g, '\\frac{$1}{$2}'],
    
    // Exponents
    [/(\w+)\s*\^\s*([0-9]+|\w+)/g, '$1^{$2}'],
    
    // Square roots
    [/√(\w+)/g, '\\sqrt{$1}'],
    [/sqrt\s*\(([^)]+)\)/gi, '\\sqrt{$1}'],
    
    // Logarithms
    [/log_(\w+)\s*\(([^)]+)\)/g, '\\log_{$1}($2)'],
    [/log\s*\(([^)]+)\)/gi, '\\log($1)'],
    [/ln\s*\(([^)]+)\)/gi, '\\ln($1)'],
    
    // Integrals
    [/∫([^d]+)d(\w+)/g, '\\int $1 \\, d$2'],
    
    // Limits
    [/lim\s*(\w+)\s*→\s*(\w+)/gi, '\\lim_{$1 \\to $2}'],
    
    // Greek letters
    [/α/gi, '\\alpha'],
    [/β/gi, '\\beta'],
    [/γ/gi, '\\gamma'],
    [/δ/gi, '\\delta'],
    [/π/gi, '\\pi'],
    [/θ/gi, '\\theta'],
    [/λ/gi, '\\lambda'],
    [/μ/gi, '\\mu'],
    [/σ/gi, '\\sigma'],
    [/Σ/g, '\\sum'],
    
    // Operators
    [/≤/g, '\\leq'],
    [/≥/g, '\\geq'],
    [/≠/g, '\\neq'],
    [/≈/g, '\\approx'],
    [/∈/g, '\\in'],
    [/∉/g, '\\notin'],
    [/∪/g, '\\cup'],
    [/∩/g, '\\cap'],
    [/⊂/g, '\\subset'],
    [/⊃/g, '\\supset'],
    
    // Derivatives
    [/(d|∂)\s*\/\s*(d|∂)(\w+)/g, '\\frac{$1}{$2$3}'],
  ];
  
  conversions.forEach(([pattern, replacement]) => {
    latex = latex.replace(pattern, replacement);
  });
  
  return latex;
}

function fixCorruptedMath(corrupted: string): string {
  // Fix common PDF extraction errors
  let fixed = corrupted;
  
  // Fix exponents: x2 → x²
  fixed = fixed.replace(/(\w+)([0-9]+)(?=\s|$|[+\-*/])/g, '$1^{$2}');
  
  // Fix corrupted fractions with special characters
  fixed = fixed.replace(/([0-9]+)\s*[#$%&']\s*([0-9]+)/g, '\\frac{$1}{$2}');
  
  // Fix corrupted integrals
  fixed = fixed.replace(/([A-Za-z]+)dx\s*\S+\s*K/g, '\\int $1 \\, dx');
  
  // Fix corrupted subscripts: log#x → log_2(x)
  fixed = fixed.replace(/log#(\w+)/g, '\\log_2($1)');
  
  // Fix corrupted symbols
  fixed = fixed.replace(/\s*[#$%&']\s*/g, (match) => {
    // Try to infer the intended symbol based on context
    if (match.includes('#')) return '_2'; // Common for log base 2
    if (match.includes('$')) return '^2'; // Common for squared
    return match;
  });
  
  return fixed;
}

function determineFormulaType(formula: string): 'inline' | 'block' | 'equation' {
  // Simple heuristic for formula type
  if (formula.includes('=')) return 'equation';
  if (formula.includes('∫') || formula.includes('Σ') || formula.includes('lim')) return 'block';
  return 'inline';
}

function extractVariables(formula: string): string[] {
  // Extract single-letter variables
  const variables = new Set<string>();
  const variablePattern = /\b[a-zA-Z]\b/g;
  const matches = formula.match(variablePattern);
  
  if (matches) {
    matches.forEach(v => {
      // Exclude common function names
      if (!['d', 'e', 'i', 'j'].includes(v.toLowerCase())) {
        variables.add(v);
      }
    });
  }
  
  return Array.from(variables);
}

export function reconstructTextWithFormulas(
  processedText: string, 
  formulas: ParsedFormula[]
): string {
  let reconstructed = processedText;
  
  formulas.forEach(formula => {
    const placeholder = `[MATH:${formula.id}:${formula.latex}]`;
    // For display, use LaTeX notation
    reconstructed = reconstructed.replace(placeholder, `$${formula.latex}$`);
  });
  
  return reconstructed;
}

export function formatForMarkdown(
  text: string,
  formulas: ParsedFormula[]
): string {
  let markdown = text;
  
  // Replace formula placeholders with proper markdown math
  formulas.forEach(formula => {
    const placeholder = `[MATH:${formula.id}:${formula.latex}]`;
    if (formula.type === 'block' || formula.type === 'equation') {
      markdown = markdown.replace(placeholder, `$$${formula.latex}$$`);
    } else {
      markdown = markdown.replace(placeholder, `$${formula.latex}$`);
    }
  });
  
  return markdown;
}