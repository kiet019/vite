// Maximum number of previous messages to include in the conversation history
const MAX_HISTORY_MESSAGES = 5;

// Function to detect language (English or Vietnamese)
export const detectLanguage = (text) => {
  // Simple detection based on character set
  // Vietnamese has specific characters that English doesn't
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  return vietnamesePattern.test(text) ? 'vi' : 'en';
};

// Function to call Gemini API for text translation
export const callGeminiForTranslation = async (text, apiKey, model, conversationHistory = []) => {
  // Detect language
  const sourceLanguage = detectLanguage(text);
  const targetLanguage = sourceLanguage === 'en' ? 'vi' : 'en'; // Used in prompt creation

  // Create prompt based on detected language
  let userPrompt = '';
  if (sourceLanguage === 'en') {
    userPrompt = `Translate this English text to Vietnamese. Return ONLY the translation, no other text: "${text}"`;
  } else {
    userPrompt = `Translate this Vietnamese text to English. Return ONLY the translation, no other text: "${text}"`;
  }

  // Prepare contents array with instruction (as user role since system role is not supported)
  const contents = [
    {
      role: "user",
      parts: [{
        text: "INSTRUCTION: You are a translation assistant that translates between English and Vietnamese. " +
              "When given text in English, translate it to Vietnamese. " +
              "When given text in Vietnamese, translate it to English. " +
              "Return ONLY the translation without any additional text or explanations."
      }]
    },
    {
      role: "model",
      parts: [{
        text: "I understand. I will translate between English and Vietnamese, returning only the translation without additional text."
      }]
    }
  ];

  // Add conversation history if available (limited to MAX_HISTORY_MESSAGES)
  if (conversationHistory && conversationHistory.length > 0) {
    // Get the last few messages (up to MAX_HISTORY_MESSAGES)
    const recentHistory = conversationHistory.slice(-MAX_HISTORY_MESSAGES);

    // Add each message to the contents array
    recentHistory.forEach(msg => {
      // Skip very short messages that might be just acknowledgments
      if (msg.text.length > 5) {
        contents.push({
          role: msg.isUser ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    });
  }

  // Add the current user message
  contents.push({
    role: "user",
    parts: [{ text: userPrompt }]
  });

  // Prepare request data
  const requestData = {
    model: model,
    contents: contents
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${requestData.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract just the translation text from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// Function to call Gemini API for speech translation
export const callGeminiForSpeechTranslation = async (base64Audio, apiKey, model, conversationHistory = []) => {
  try {
    // First, transcribe the audio using Gemini
    const transcriptionResult = await transcribeAudio(base64Audio, apiKey, model);

    // Detect language of the transcription
    const sourceLanguage = detectLanguage(transcriptionResult);

    // Translate the transcription
    const translatedText = await callGeminiForTranslation(transcriptionResult, apiKey, model, conversationHistory);

    return {
      transcription: transcriptionResult,
      translation: translatedText,
      sourceLanguage: sourceLanguage,
      targetLanguage: sourceLanguage === 'en' ? 'vi' : 'en'
    };
  } catch (error) {
    console.error('Error in speech translation:', error);
    throw error;
  }
};

// Function to transcribe audio using Gemini
async function transcribeAudio(base64Audio, apiKey, model) {
  // Prepare request data for transcription
  const requestData = {
    model: model,
    contents: [
      {
        role: "user",
        parts: [
          { text: "Transcribe this audio. Return ONLY the transcription, no other text." },
          {
            inlineData: {
              mimeType: "audio/wav",
              data: base64Audio
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${requestData.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error during transcription: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract just the transcription text from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API during transcription');
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
