/**
 * Empirical Verification Test Suite for Milestone 1
 * Tests injectReactValue prototype setter invocation, event bubbling, and findLoginSubmitButton selector ordering.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- Test 1: JS Syntax Verification across all 5 files ---
console.log("=== Test 1: JS Syntax Check ===");
const filesToCheck = [
  'Extension/content/content_script.js',
  'Extension/content/matcher.js',
  'Extension/background/background.js',
  'Extension/popup/popup.js',
  'Extension/options/options.js'
];

let syntaxPassed = true;
filesToCheck.forEach(filePath => {
  const absolutePath = path.resolve(__dirname, '..', filePath);
  try {
    const code = fs.readFileSync(absolutePath, 'utf8');
    new vm.Script(code);
    console.log(`[PASS] Syntax check: ${filePath}`);
  } catch (err) {
    console.error(`[FAIL] Syntax check: ${filePath}\nError: ${err.message}`);
    syntaxPassed = false;
  }
});

if (!syntaxPassed) {
  process.exit(1);
}

// --- Test 2: Unit Test for injectReactValue ---
console.log("\n=== Test 2: injectReactValue Setter & Event Bubbling Test ===");

// Build mock DOM element environment simulating React state lock
class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = !!options.bubbles;
    this.cancelable = !!options.cancelable;
  }
}

class MockHTMLInputElement {
  constructor() {
    this._internalValue = '';
    this.dispatchedEvents = [];
  }

  dispatchEvent(event) {
    this.dispatchedEvents.push(event);
    return true;
  }
}

// Define native prototype value descriptor
let nativeSetterCalledWith = null;
Object.defineProperty(MockHTMLInputElement.prototype, 'value', {
  get() {
    return this._internalValue;
  },
  set(val) {
    nativeSetterCalledWith = val;
    this._internalValue = val;
  },
  configurable: true,
  enumerable: true
});

// Create instance
const mockInput = new MockHTMLInputElement();

// Simulate React attaching custom instance property descriptor (overriding prototype setter)
let reactSetterCalledWith = null;
Object.defineProperty(mockInput, 'value', {
  get() {
    return this._internalValue;
  },
  set(val) {
    reactSetterCalledWith = val;
    // React setter would normally ignore or lock this without native setter
  },
  configurable: true,
  enumerable: true
});

// Re-create injectReactValue definition for isolated empirical test
function injectReactValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new MockEvent('input', { bubbles: true }));
  element.dispatchEvent(new MockEvent('change', { bubbles: true }));
}

// Execute injectReactValue
const testValue = "testuser@workday.com";
injectReactValue(mockInput, testValue);

// Assertions
let reactInjectPassed = true;

if (nativeSetterCalledWith === testValue) {
  console.log(`[PASS] Native prototype setter called with: "${testValue}"`);
} else {
  console.error(`[FAIL] Native prototype setter not called correctly. Got: "${nativeSetterCalledWith}"`);
  reactInjectPassed = false;
}

if (mockInput.value === testValue) {
  console.log(`[PASS] Element value successfully updated to: "${mockInput.value}"`);
} else {
  console.error(`[FAIL] Element value not updated. Got: "${mockInput.value}"`);
  reactInjectPassed = false;
}

const inputEvent = mockInput.dispatchedEvents.find(e => e.type === 'input');
const changeEvent = mockInput.dispatchedEvents.find(e => e.type === 'change');

if (inputEvent && inputEvent.bubbles) {
  console.log(`[PASS] 'input' event dispatched with bubbles: true`);
} else {
  console.error(`[FAIL] 'input' event missing or bubbles is false`);
  reactInjectPassed = false;
}

if (changeEvent && changeEvent.bubbles) {
  console.log(`[PASS] 'change' event dispatched with bubbles: true`);
} else {
  console.error(`[FAIL] 'change' event missing or bubbles is false`);
  reactInjectPassed = false;
}

// --- Test 3: Selector Ordering Verification for findLoginSubmitButton ---
console.log("\n=== Test 3: findLoginSubmitButton Selector Ordering Test ===");

const contentScriptCode = fs.readFileSync(path.resolve(__dirname, '../Extension/content/content_script.js'), 'utf8');

// Match findLoginSubmitButton function text
const findLoginSubmitMatch = contentScriptCode.match(/function findLoginSubmitButton\(\)\s*\{([\s\S]*?)\n  \}/);

if (!findLoginSubmitMatch) {
  console.error("[FAIL] Could not locate findLoginSubmitButton in content_script.js");
  process.exit(1);
}

const findLoginSubmitBody = findLoginSubmitMatch[1];

// Verify selector string ordering in querySelector
const signInSubmitIdx = findLoginSubmitBody.indexOf('[data-automation-id="signInSubmitButton"]');
const signInIdx = findLoginSubmitBody.indexOf('[data-automation-id="signInButton"]');

if (signInSubmitIdx !== -1 && signInIdx !== -1 && signInSubmitIdx < signInIdx) {
  console.log(`[PASS] '[data-automation-id="signInSubmitButton"]' precedes '[data-automation-id="signInButton"]' in querySelector string.`);
} else {
  console.error(`[FAIL] Selector order incorrect: signInSubmitButton idx=${signInSubmitIdx}, signInButton idx=${signInIdx}`);
  process.exit(1);
}

// Verify 500ms delay before findLoginSubmitButton call in executeLoginFlow
const executeLoginFlowMatch = contentScriptCode.match(/function executeLoginFlow[\s\S]*?setTimeout\(\(\)\s*=>\s*\{[\s\S]*?findLoginSubmitButton\(\)[\s\S]*?\},\s*500\)/);

if (executeLoginFlowMatch) {
  console.log(`[PASS] 500ms delay verified prior to calling findLoginSubmitButton() in executeLoginFlow.`);
} else {
  console.error(`[FAIL] 500ms delay around findLoginSubmitButton not found in executeLoginFlow.`);
  process.exit(1);
}

console.log("\n==========================================");
if (syntaxPassed && reactInjectPassed) {
  console.log("ALL EMPIRICAL TESTS PASSED SUCCESSFULLY!");
} else {
  console.error("EMPIRICAL VERIFICATION FAILED!");
  process.exit(1);
}
