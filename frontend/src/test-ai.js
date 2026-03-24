// Test file to verify AI functionality
import { classifyIssue } from './services/api';

// Test AI classification
console.log('Testing AI classification...');
classifyIssue('WiFi is not working in the library')
  .then(response => {
    console.log('AI Response:', response.data);
  })
  .catch(error => {
    console.error('AI Error:', error);
  });
