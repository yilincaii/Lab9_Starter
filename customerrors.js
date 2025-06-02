// Step 4 - Custom error classes for calculator

// Main calculator error class
class CalculatorError extends Error {
  constructor(message, op = null, nums = null) {
    super(message);
    this.name = 'CalculatorError';
    this.operation = op;
    this.operands = nums;
    this.timestamp = new Date().toISOString();
  }
  toString() {
    return `${this.name}: ${this.message} [Operation: ${this.operation}, Operands: ${this.operands}]`;
  }
}

// Different types of calculator errors
class DivisionByZeroError extends CalculatorError {
  constructor(num, op = 'division') {
    super(`Cannot divide ${num} by zero`, op, [num, 0]);
    this.name = 'DivisionByZeroError';
    this.dividend = num;
  }
}

class InvalidInputError extends CalculatorError {
  constructor(input, expected = 'number') {
    super(`Invalid input: "${input}" is not a valid ${expected}`, null, [input]);
    this.name = 'InvalidInputError';
    this.input = input;
    this.expectedType = expected;
  }
}



class MathematicalError extends CalculatorError {
  constructor(message, op, nums) {
    super(message, op, nums);
    this.name = 'MathematicalError';
  }
}

class OverflowError extends MathematicalError {
  constructor(result, op, nums) {
    super(`Result overflow: ${result}`, op, nums);
    this.name = 'OverflowError';
    this.result = result;
  }
}

class UnsupportedOperationError extends CalculatorError {
  constructor(op) {
    super(`Unsupported operation: "${op}"`, op, []);
    this.name = 'UnsupportedOperationError';
    this.operator = op;
  }
}

// Wrap low-level errors into calculator errors
function wrapCalculatorError(err, op, nums) {
  if (err instanceof CalculatorError) {
    return err;
  }
  
  const wrapped = new CalculatorError(
    `Calculator operation failed: ${err.message}`,
    op,
    nums
   );
  wrapped.cause = err;
  wrapped.name = 'WrappedCalculatorError';
  return wrapped;
}



// Replace the original calculator with better error handling
function enhanceCalculatorWithCustomErrors(){
  let form = document.querySelector('form');
  
  // Need to clone to remove old listeners
  let newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  newForm.addEventListener('submit', e => {
    e.preventDefault();
    let display = document.querySelector('output');
    
    try {
      let input1 = document.querySelector('#first-num').value;
      let input2 = document.querySelector('#second-num').value;
      let op = document.querySelector('#operator').value;
      
      // Check for empty inputs
      if (input1 === '') {
        throw new InvalidInputError('(empty)', 'first number');}
      
      if (input2 === '') {
        throw new InvalidInputError('(empty)', 'second number');
      }
      
      // Parse numbers
      let a, b;
      try {
        a = parseFloat(input1);
        if (isNaN(a)) {
          throw new InvalidInputError(input1, 'number');
        }
      } catch (parseErr) {
        throw wrapCalculatorError(parseErr, 'parsing', [input1]);
      }
      
      try 
      {
        b = parseFloat(input2);
        if (isNaN(b)) {
          throw new InvalidInputError(input2, 'number');
        }
      } 
      catch (parseErr) {
        throw wrapCalculatorError(parseErr, 'parsing', [input2]);
      }
      
      // Division by zero check
      if (op === '/' && b === 0) {
        throw new DivisionByZeroError(a);
      }
      
      // Do the math
      let ans;
      try {
        switch(op) {
          case '+':
            ans = a + b;
            break;
          case '-':
            ans = a - b;
            break;
          case '*':
            ans = a * b;
            break;
          case '/':
            ans = a / b;
            break;
          default:
            throw new UnsupportedOperationError(op);
        }
      } 
      catch (mathErr){
        throw wrapCalculatorError(mathErr, op, [a, b]);
      }
      
      // Check if result makes sense
      if (!isFinite(ans)) {
        if (ans === Infinity || ans === -Infinity) {
          throw new OverflowError(ans, op, [a, b]);
        } else {
          throw new MathematicalError('Result is not a valid number', op, [a, b]);
        }
      }
      
      // Check for really big numbers
      if (Math.abs(ans) > Number.MAX_SAFE_INTEGER) {
        throw new OverflowError(ans, op, [a, b]);
      }
      
      display.innerHTML = `Result: ${ans}`;
      display.style.color = 'black';
      console.log(`✅ Calculation successful: ${a} ${op} ${b} = ${ans}`);
      
    } catch (err) {
      // Handle different error types
      if (err instanceof DivisionByZeroError){
        display.innerHTML = `!! Division Error: ${err.message}`;
        display.style.color = 'red';
        console.error(' Division by zero detected:', err.toString());
        
      } else if (err instanceof InvalidInputError){
        display.innerHTML = `❌ Input Error: ${err.message}`;
        display.style.color = 'orange';
        console.error(' Invalid input detected:', err.toString());
        
      } else if (err instanceof OverflowError) {
        display.innerHTML = `⚠️ Overflow Error: ${err.message}`;
        display.style.color = 'purple';
        console.error(' Overflow detected:', err.toString());
        
      } else if (err instanceof UnsupportedOperationError){
        display.innerHTML = ` Operation Error: ${err.message}`;
        display.style.color = 'blue';
        console.error(' Unsupported operation:', err.toString());
        
      } else if (err instanceof CalculatorError) {
        display.innerHTML = `Calculator Error: ${err.message}`;
        display.style.color = 'red';
        console.error(' Calculator error:', err.toString());
        
        if (err.cause) {
          console.error(' Original cause:', err.cause);
        }
        
      } else {
        // Unexpected stuff
        const wrapped = wrapCalculatorError(err, 'unknown', []);
        display.innerHTML = ` Unexpected Error: ${wrapped.message}`;
        display.style.color = 'darkred';
        console.error(' Unexpected error wrapped:', wrapped.toString());
        console.error(' Original error:', err);
      }
      
      // Test instanceof checks
      console.group(' Error Type Analysis:');
      console.log('instanceof DivisionByZeroError:', err instanceof DivisionByZeroError);
      console.log('instanceof InvalidInputError:', err instanceof InvalidInputError);
      console.log('instanceof MathematicalError:', err instanceof MathematicalError);
      console.log('instanceof CalculatorError:', err instanceof CalculatorError);
      console.log('instanceof Error:', err instanceof Error);
      console.log('error.name:', err.name);
      console.groupEnd();
      
    } finally {
      console.log(' Calculation attempt completed with custom error handling');
    }
  });
}

// Test each error type
function testCustomErrors() {
  console.group(' Custom Error Demonstrations');
  
  try {
    throw new CalculatorError('Base calculator error test', 'test', [1, 2]);
  } catch (err){
    console.log('✅ CalculatorError test:', err.toString());
  }
  
  try {
    throw new DivisionByZeroError(10);
  } catch (err) {
    console.log('✅ DivisionByZeroError test:', err.toString());
  }
  
  try {
    throw new InvalidInputError('abc');
  } catch (err) {
    console.log('✅ InvalidInputError test:', err.toString());
  }
  
  try {
    throw new OverflowError(Infinity, '*', [1e308, 1e308]);
  } catch (err) {
    console.log('✅ OverflowError test:', err.toString());
  }
  
  try {
    throw new UnsupportedOperationError('%');
  } catch (err) {
    console.log('✅ UnsupportedOperationError test:', err.toString());
  }
  
  // Test error wrapping
  try {
    let lowLevelErr = new TypeError('Cannot read property of undefined');
    throw wrapCalculatorError(lowLevelErr, '+', [1, 2]);
  } catch (err) {
    console.log('✅ Error wrapping test:', err.toString());
    console.log('   Original cause:', err.cause?.message);
  }
  
  console.groupEnd();
}

// Update the global error button
function enhanceGlobalErrorButton() {
  let btns = Array.from(document.querySelectorAll('#error-btns > button'));
  
  btns.forEach(btn => {
    if (btn.textContent.trim() === 'Trigger a Global Error') {
      let newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', () => {
        console.log(' Triggering custom calculator errors...');
        
        try {
          testCustomErrors();
          
          // Test inheritance
          console.group('🏗️ Error Hierarchy Tests:');
          
          let divErr = new DivisionByZeroError(5);
          console.log('DivisionByZeroError instanceof CalculatorError:', divErr instanceof CalculatorError);
          console.log('DivisionByZeroError instanceof Error:', divErr instanceof Error);
          
          let mathErr = new MathematicalError('Test math error', '+', [1, 2]);
          let overflowErr = new OverflowError(Infinity, '*', [1e308, 1e308]);
          console.log('OverflowError instanceof MathematicalError:', overflowErr instanceof MathematicalError);
          console.log('OverflowError instanceof CalculatorError:', overflowErr instanceof CalculatorError);
          
          // Test name checking
          console.group(' Error Name Checks:');
          console.log('divErr.name:', divErr.name);
          console.log('overflowErr.name:', overflowErr.name);
          console.log('Check by name (divErr.name === "DivisionByZeroError"):', divErr.name === "DivisionByZeroError");
          console.groupEnd();
          console.groupEnd();
          
        } 
        catch (err) {
          console.error('Error in custom error demonstration:', err);
        } 
        finally {
          console.log('Custom error demonstration completed');
        }
      });
    }
  });
}

// Initialize everything
window.addEventListener('load', () => {
  console.log('🚀 Initializing Step 4: Custom Calculator Errors');
  
  setTimeout(() => {
    enhanceCalculatorWithCustomErrors();
    enhanceGlobalErrorButton();
    console.log('✅ Custom error system initialized');
    
    // Auto demo
    setTimeout(() =>{
      console.log(' Running automatic custom error demonstration...');
      testCustomErrors();
    }, 2000);
    
  }, 1000);
});