//Step 5 - Global error handling and TrackJS
let stats = {
  total: 0,
  types: {},
  recent: []
};

// Catch global errors with window.onerror
window.onerror = function(msg, src, line, col, err) {
  console.group(' Global Error Caught (window.onerror):');
  console.error('Message:', msg);
  console.error('Source:', src);
  console.error('Line:', line, 'Column:', col);
  console.error('Error Object:', err);
  console.groupEnd();
  
  // Update
  stats.total++;
  let errType = err ? err.constructor.name : 'Unknown';
  stats.types[errType] = (stats.types[errType] || 0) + 1;
  
  // Store recent error
  stats.recent.push({
    message: msg,
    source: src,
    line: line,
    column: col,
    timestamp: new Date().toISOString(),
    type: errType
  });


  
  // Keep only last 10
  if (stats.recent.length > 10) {
    stats.recent.shift();
  }
  // Send to server (fake)
  sendToServer({
    message: msg,
    source: src,
    line: line,
    column: col,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
  
  return true;
};


// Also catch with addEventListener
window.addEventListener('error', function(evt) {
  console.group('!! Global Error Caught (addEventListener):');
  console.error('Event:', evt);
  console.error('Message:', evt.message);
  console.error('Filename:', evt.filename);
  console.error('Line:', evt.lineno, 'Column:', evt.colno);
  console.error('Error:', evt.error);
  console.groupEnd();
  
  if (evt.error && evt.error.stack){
    console.error('Stack trace:', evt.error.stack);
  }
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', function(evt) {
  console.group('⚡ Unhandled Promise Rejection:');
  console.error('Reason:', evt.reason);
  console.error('Promise:', evt.promise);
  console.groupEnd();
  
  stats.total++;
  stats.types['UnhandledPromiseRejection'] = (stats.types['UnhandledPromiseRejection'] || 0) + 1;
  
  evt.preventDefault();
});

// Simulate sending errors to server
function sendToServer(data){
  console.group(' Sending Error to Server:');
  console.log('Error data:', data);
  
  try {
    // Would normally use fetch here
    console.log('✅ Error sent to server successfully (simulated)');
  } catch (sendErr) {
    console.error('❌ Failed to send error to server:', sendErr);
  }
  
  console.groupEnd();
}

// Trigger different types of errors for testing
function triggerErrors() {
  console.log(' Triggering global errors for demonstration...');
  
  // Reference error
  setTimeout(() => {
    try {
      nonExistentFunction();
    } catch (e) {
      // Won't reach here because setTimeout makes it global
    }
  }, 1000);
  
  // Type error
  setTimeout(() => {
    let x = null;
    x.someMethod();
  }, 2000);
  
  // Syntax error
  setTimeout(() => {
    eval('invalid syntax here @#$%');
  }, 3000);
  
  // Promise rejection
  setTimeout(() => {
    new Promise((resolve, reject) => {
      reject(new Error('Unhandled promise rejection test'));
    });
  }, 4000);
  
  // Network error
  setTimeout(() => {
    fetch('https://nonexistent-domain-for-error-test.com/api')
      .then(response => response.json())
      .catch(err => {
        console.error('Network error caught:', err);
      });
  }, 5000);
}

// Show error stats
function showStats(){
  console.group(' Error Statistics:');
  console.log('Total Errors:', stats.total);
  console.log('Error Types:', stats.types);
  console.log('Recent Errors:', stats.recent);
  console.groupEnd();
}

// Check if TrackJS loaded
function checkTrackJS() {
  if (window.TrackJS){
    console.log('✅ TrackJS is loaded and ready!');
    console.log(' TrackJS will now capture all errors automatically');
    
    // Test message
    setTimeout(() => {
      window.TrackJS.track('Test message from Lab 9 - TrackJS is working!');
      console.log(' Test message sent to TrackJS');
    }, 2000);
    
  } 
  else {
    console.warn('⚠️ TrackJS not detected. Make sure you:');
    console.log('1. Added the TrackJS script to <head> in index.html');
    console.log('2. Replaced YOUR_ACTUAL_TOKEN_HERE with your real token');
    console.log('3. The TrackJS script loads before this file');
  }
}

// Update the global error button
function updateGlobalErrorButton() {
  let btns = Array.from(document.querySelectorAll('#error-btns > button'));
  
  btns.forEach(btn => {
    if (btn.textContent.trim() === 'Trigger a Global Error') {
      let newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', () => {
        console.log(' Global Error Button Clicked - Starting Error Sequence...');
        showStats();
        triggerErrors();
        
        setTimeout(() => {
          console.log(' Updated statistics after triggering errors:');
          showStats();
        }, 6000);
        
        console.log('⏱ Global errors will be triggered over the next 6 seconds...');
      });
    }
  });
}

//Add button for error stats
function addStatsButton() {
  let container = document.querySelector('#error-btns');
  
  let btn = document.createElement('button');
  btn.textContent = 'Show Error Stats';
  btn.style.padding = '8px 2px';
  btn.style.width = '122px';
  
  btn.addEventListener('click', () => {
    showStats();
    // Also show in output
    let output = document.querySelector('output');
    output.innerHTML = `Errors: ${stats.total} | Types: ${Object.keys(stats.types).length}`;
    output.style.color = 'blue';
  });
  
  container.appendChild(btn);
}

// Setup everything
window.addEventListener('load', () => {
  console.log('🚀 Initializing Step 5: Global Error Tracking');
  
  setTimeout(() => {
    updateGlobalErrorButton();
    addStatsButton();
    checkTrackJS();
    
    console.log('✅ Global error tracking system initialized');
    console.log(' Click "Trigger a Global Error" to see global error handling in action');
    console.log(' Click "Show Error Stats" to view error statistics');
    
    setTimeout(() => {
      console.log('🧪 Testing global error handler...');
      
      setTimeout(() => {
        undefinedVariableTest; // This will trigger global error
      }, 1000);
      
    }, 2000);
    
  }, 1000);
});