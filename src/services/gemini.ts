const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Fallback prompts when Gemini is not available
const fallbackPrompts = [
  "What's one thing that happened today that you'd like to explore more deeply?",
  "How did you take care of yourself today, and what made you feel good?",
  "What emotions came up for you today, and what might have triggered them?",
  "If you could tell your past self from this morning one thing, what would it be?",
  "What's something you're grateful for today, even if it was a small moment?",
  "What challenged you today, and how did you handle it?",
  "What would you like to let go of from today before tomorrow begins?",
  "How did you connect with others today, or how would you like to connect tomorrow?",
  "What did you learn about yourself today?",
  "What's one thing you're looking forward to, no matter how small?"
];

export async function generateJournalPrompt(mood: number, previousEntries?: string[]): Promise<string> {
  // If no API key, return a fallback prompt immediately
  if (!GEMINI_API_KEY) {
    console.log('Gemini API key not found. Using fallback prompt.');
    return getRandomFallbackPrompt();
  }

  const moodDescriptions = {
    1: 'very low/difficult',
    2: 'low/challenging',
    3: 'neutral/okay',
    4: 'good/positive',
    5: 'excellent/amazing'
  };

  const moodLevel = moodDescriptions[mood as keyof typeof moodDescriptions];
  
  const prompt = `As a supportive mental health assistant for teenagers, generate a thoughtful, gentle journal prompt for someone feeling ${moodLevel} today. 

Guidelines:
- Keep it warm, understanding, and non-judgmental
- Make it specific enough to inspire reflection but open enough for personal interpretation
- Use language that feels natural for teenagers
- Focus on growth, self-compassion, and emotional awareness
- Avoid clinical language or overly formal tone
- Keep it to 1-2 sentences maximum

Previous context: ${previousEntries?.slice(-2).join('. ') || 'This is their first entry.'}

Generate only the journal prompt, nothing else.`;

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const generatedPrompt = data.candidates[0]?.content?.parts[0]?.text;
    
    if (generatedPrompt && generatedPrompt.trim()) {
      return generatedPrompt.trim();
    } else {
      throw new Error('Empty response from Gemini');
    }
  } catch (error) {
    console.log('Error generating journal prompt, using fallback:', error);
    return getRandomFallbackPrompt();
  }
}

export async function analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
  // If no API key, return neutral sentiment
  if (!GEMINI_API_KEY) {
    console.log('Gemini API key not found. Using neutral sentiment.');
    return 'neutral';
  }

  const prompt = `Analyze the emotional sentiment of this journal entry from a teenager. Respond with only one word: "positive", "neutral", or "negative".

Text: "${text}"`;

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const result = data.candidates[0]?.content?.parts[0]?.text?.toLowerCase().trim();
    
    if (result === 'positive' || result === 'negative' || result === 'neutral') {
      return result;
    }
    return 'neutral';
  } catch (error) {
    console.log('Error analyzing sentiment, using neutral:', error);
    return 'neutral';
  }
}

function getRandomFallbackPrompt(): string {
  const randomIndex = Math.floor(Math.random() * fallbackPrompts.length);
  return fallbackPrompts[randomIndex];
}