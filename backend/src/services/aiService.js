const { GoogleGenAI } = require('@google/generative-ai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeFinancialText(text) {
  try {
    // Using the flash model for blazing-fast document analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert financial compliance auditor. Analyze the following extracted text from a financial document.
      Identify any compliance issues, regulatory risks, or missing mandatory clauses.
      
      You MUST respond with a valid JSON object ONLY. Do not include markdown code blocks (like \`\`\`json) or conversational text.
      
      The JSON structure must match this exactly:
      {
        "complianceScore": 85, // An integer score from 0 to 100
        "flaggedIssues": [
          {
            "clause": "Name of the section or missing clause",
            "reason": "Detailed description of why this is a non-compliance risk",
            "severity": "High" // Must be exactly 'High', 'Medium', or 'Low'
          }
        ]
      }

      Document Text to Analyze:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    return {
      complianceScore: 50,
      flaggedIssues: [{ clause: "AI Parser", reason: "Failed to parse AI response safely.", severity: "Medium" }]
    };
  }
}

module.exports = { analyzeFinancialText };