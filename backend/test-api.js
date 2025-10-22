import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testAPI() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', process.env.GOOGLE_API_KEY?.substring(0, 20) + '...');
    console.log('Model:', process.env.GEMINI_MODEL);
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Test với model 2.0
    console.log('\n--- Testing gemini-2.0-flash-exp ---');
    try {
      const model1 = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result1 = await model1.generateContent('Xin chào');
      console.log('✅ Model 2.0 works!');
      console.log('Response:', result1.response.text());
    } catch (e) {
      console.log('❌ Model 2.0 failed:', e.message);
    }
    
    // Test với model 1.5
    console.log('\n--- Testing gemini-1.5-flash ---');
    try {
      const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result2 = await model2.generateContent('Xin chào');
      console.log('✅ Model 1.5 works!');
      console.log('Response:', result2.response.text());
    } catch (e) {
      console.log('❌ Model 1.5 failed:', e.message);
    }
    
    // Test với system prompt
    console.log('\n--- Testing with system prompt ---');
    try {
      const model3 = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL,
        systemInstruction: 'Bạn là AI tư vấn PC. Trả lời ngắn gọn.'
      });
      const result3 = await model3.generateContent('Tư vấn build PC 20tr');
      console.log('✅ System prompt works!');
      console.log('Response:', result3.response.text());
    } catch (e) {
      console.log('❌ System prompt failed:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

testAPI();
