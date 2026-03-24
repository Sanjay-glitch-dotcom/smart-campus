// Debug script to check if AI button is in the DOM
console.log('🔍 Debug: Checking for AI button...');

// Wait for page to load
setTimeout(() => {
  const descriptionField = document.querySelector('textarea[name="description"]');
  const aiButton = document.querySelector('button');
  
  console.log('📝 Description field found:', !!descriptionField);
  console.log('🤖 AI buttons found:', document.querySelectorAll('button').length);
  console.log('🔍 AI button text:', Array.from(document.querySelectorAll('button')).map(btn => btn.textContent));
  
  // Look for AI Classify button specifically
  const aiClassifyButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('AI Classify') || btn.textContent.includes('🤖')
  );
  
  console.log('✅ AI Classify button found:', !!aiClassifyButton);
  
  if (aiClassifyButton) {
    console.log('🎯 AI Button details:', {
      text: aiClassifyButton.textContent,
      disabled: aiClassifyButton.disabled,
      style: aiClassifyButton.style.cssText
    });
  }
}, 2000);
