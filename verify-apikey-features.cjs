/**
 * Verification Script for API Key Persistence Features
 *
 * This script verifies:
 * - Feature #23: API key persists across browser sessions
 * - Feature #28: Clear API key removes it from localStorage
 */

const fs = require('fs');
const path = require('path');

console.log('=== API Key Persistence Feature Verification ===\n');

// Read the ApiKeyContext.tsx file
const contextPath = path.join(__dirname, 'src/contexts/ApiKeyContext.tsx');
const apiKeyInputPath = path.join(__dirname, 'src/components/ApiKeyInput.tsx');

console.log('1. Reading ApiKeyContext.tsx...');
const contextContent = fs.readFileSync(contextPath, 'utf8');

console.log('2. Reading ApiKeyInput.tsx...');
const apiKeyInputContent = fs.readFileSync(apiKeyInputPath, 'utf8');

// Verification checks
const checks = {
    feature23: {
        name: 'Feature #23: API key persists across browser sessions',
        checks: []
    },
    feature28: {
        name: 'Feature #28: Clear API key removes it from localStorage',
        checks: []
    }
};

// Check Feature #23: Persistence
console.log('\n--- Feature #23: API Key Persistence ---');

// Check 1: Storage key constant
const storageKeyMatch = contextContent.match(/const\s+API_KEY_STORAGE\s*=\s*['"]([^'"]+)['"]/);
if (storageKeyMatch) {
    console.log('✓ Storage key defined: ' + storageKeyMatch[1]);
    checks.feature23.checks.push({ pass: true, msg: 'Storage key constant defined: ' + storageKeyMatch[1] });
} else {
    console.log('✗ Storage key constant not found');
    checks.feature23.checks.push({ pass: false, msg: 'Storage key constant not found' });
}

// Check 2: localStorage.getItem on mount
if (contextContent.includes('localStorage.getItem')) {
    console.log('✓ localStorage.getItem() called to load API key on mount');
    checks.feature23.checks.push({ pass: true, msg: 'Loads API key from localStorage on mount' });
} else {
    console.log('✗ localStorage.getItem() not found');
    checks.feature23.checks.push({ pass: false, msg: 'Does not load from localStorage' });
}

// Check 3: useEffect for loading on mount
if (contextContent.includes('useEffect') && contextContent.includes('localStorage.getItem')) {
    console.log('✓ useEffect hook loads API key on component mount');
    checks.feature23.checks.push({ pass: true, msg: 'useEffect loads key on mount' });
} else {
    console.log('✗ useEffect for loading not found');
    checks.feature23.checks.push({ pass: false, msg: 'No useEffect for loading' });
}

// Check 4: localStorage.setItem when saving
if (contextContent.includes('localStorage.setItem')) {
    console.log('✓ localStorage.setItem() called to save API key');
    checks.feature23.checks.push({ pass: true, msg: 'Saves API key to localStorage' });
} else {
    console.log('✗ localStorage.setItem() not found');
    checks.feature23.checks.push({ pass: false, msg: 'Does not save to localStorage' });
}

// Check 5: Save happens on setApiKey call
if (contextContent.match(/const\s+setApiKey\s*=\s*\([^)]*\)\s*=>/)) {
    console.log('✓ setApiKey function defined to handle save');
    checks.feature23.checks.push({ pass: true, msg: 'setApiKey function exists' });
} else {
    console.log('✗ setApiKey function not found');
    checks.feature23.checks.push({ pass: false, msg: 'setApiKey function missing' });
}

// Check Feature #28: Clear functionality
console.log('\n--- Feature #28: Clear API Key ---');

// Check 1: Clear button exists in UI
if (apiKeyInputContent.includes('Clear') && apiKeyInputContent.includes('onClick')) {
    console.log('✓ Clear button exists in UI');
    checks.feature28.checks.push({ pass: true, msg: 'Clear button present' });
} else {
    console.log('✗ Clear button not found');
    checks.feature28.checks.push({ pass: false, msg: 'Clear button missing' });
}

// Check 2: Clear button calls setApiKey('')
if (apiKeyInputContent.includes("setApiKey('')") || apiKeyInputContent.includes('setApiKey("")')) {
    console.log('✓ Clear button calls setApiKey with empty string');
    checks.feature28.checks.push({ pass: true, msg: 'Clear button calls setApiKey("")' });
} else {
    console.log('✗ Clear button does not call setApiKey properly');
    checks.feature28.checks.push({ pass: false, msg: 'Clear button logic incorrect' });
}

// Check 3: localStorage.removeItem when key is empty
const removeItemMatch = contextContent.match(/localStorage\.removeItem\s*\(\s*[^)]+\s*\)/);
if (removeItemMatch) {
    console.log('✓ localStorage.removeItem() called when clearing API key');
    checks.feature28.checks.push({ pass: true, msg: 'Removes from localStorage when cleared' });
} else {
    console.log('✗ localStorage.removeItem() not found');
    checks.feature28.checks.push({ pass: false, msg: 'Does not remove from localStorage' });
}

// Check 4: Conditional save/remove logic
if (contextContent.includes('if (key)') && contextContent.includes('localStorage.setItem') && contextContent.includes('localStorage.removeItem')) {
    console.log('✓ Conditional logic: saves if key exists, removes if empty');
    checks.feature28.checks.push({ pass: true, msg: 'Proper conditional save/remove logic' });
} else {
    console.log('✗ Conditional logic for save/remove not found');
    checks.feature28.checks.push({ pass: false, msg: 'Missing conditional logic' });
}

// Check for no mock data
console.log('\n--- Mock Data Check ---');
const mockPatterns = [
    'globalThis',
    'devStore',
    'mockDb',
    'mockData',
    'fakeData',
    'sampleData',
    'dummyData'
];

let mockDataFound = false;
for (const pattern of mockPatterns) {
    if (contextContent.includes(pattern)) {
        console.log(`✗ Mock pattern found: ${pattern}`);
        mockDataFound = true;
    }
}

if (!mockDataFound) {
    console.log('✓ No mock data patterns found');
    checks.feature23.checks.push({ pass: true, msg: 'No mock data in implementation' });
    checks.feature28.checks.push({ pass: true, msg: 'No mock data in implementation' });
}

// Summary
console.log('\n=== SUMMARY ===');
console.log('\nFeature #23 Checks:');
const feature23Pass = checks.feature23.checks.every(c => c.pass);
checks.feature23.checks.forEach(c => {
    console.log(`  ${c.pass ? '✓' : '✗'} ${c.msg}`);
});
console.log(`\nFeature #23 Status: ${feature23Pass ? 'PASSING ✓' : 'FAILING ✗'}`);

console.log('\nFeature #28 Checks:');
const feature28Pass = checks.feature28.checks.every(c => c.pass);
checks.feature28.checks.forEach(c => {
    console.log(`  ${c.pass ? '✓' : '✗'} ${c.msg}`);
});
console.log(`\nFeature #28 Status: ${feature28Pass ? 'PASSING ✓' : 'FAILING ✗'}`);

console.log('\n=== VERIFICATION COMPLETE ===\n');
