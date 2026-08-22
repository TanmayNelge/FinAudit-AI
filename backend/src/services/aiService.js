const { GoogleGenerativeAI } = require('@google/generative-ai');

async function analyzeFinancialText(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in backend/.env file.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash model for document analysis
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert financial compliance auditor. Analyze the following extracted text from a financial document.
      Identify any compliance issues, regulatory risks, or missing mandatory clauses.
      
      You MUST respond with a valid JSON object ONLY.
      
      The JSON structure must match this exactly:
      {
        "complianceScore": 85,
        "flaggedIssues": [
          {
            "clause": "Name of the section or missing clause",
            "reason": "Detailed description of why this is a non-compliance risk",
            "severity": "High"
          }
        ]
      }

      Document Text to Analyze:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

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