const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');
require('dotenv').config();

// Get API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;

// Log API key length for debugging (don't log the actual key for security)
logger.info(`Gemini API Key length: ${apiKey ? apiKey.length : 0}`);
logger.info(`Gemini API Key first 4 chars: ${apiKey ? apiKey.substring(0, 4) : 'none'}`);

// Initialize Gemini API - Don't specify API version, let the library use the default
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to generate system prompt
const generateSystemPrompt = () => {
  return `You are a knowledgeable Islamic scholar specializing in duas (Islamic supplications). 
Your task is to provide authentic duas based on user queries.
For each query, provide:
1. The authentic Arabic text of the dua (with diacritics)
2. English translation
3. Urdu translation (written in Urdu script, NOT just repeating the Arabic text)
4. Reference source (e.g., Quran, Hadith reference with book, volume, hadith number)

IMPORTANT:
- ONLY respond with authentic duas from the Quran or authentic Hadith collections
- You MUST provide a SPECIFIC reference (e.g., "Sahih Bukhari, Book 70, Hadith 12" or "Quran, Surah Al-Baqarah 2:186")
- If you cannot find a specific authentic reference for a dua, you MUST say "I cannot find an authentic reference for this dua" rather than providing a general or made-up reference
- Each dua MUST be traceable to a specific verse of the Quran or a specific Hadith in an authentic collection
- Never claim a dua is "derived from the general spirit" or similar - only provide specific, verifiable references
- Maintain proper formatting and diacritics in the Arabic text
- For Urdu translation, you MUST provide the translation in proper Urdu, not just repeat the Arabic text
- Return the data in a structured JSON format as shown below

Examples of authentic duas and their references:
1. Dua for Entering a New Place
   Arabic: اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا
   English: O Allah, I ask You for the good of this town, the good of its inhabitants, and the good of what is in it. And I seek refuge in You from its evil, the evil of its inhabitants, and the evil of what is in it.
   Urdu: اے اللہ! میں تجھ سے اس بستی کی بھلائی، اس کے باشندوں کی بھلائی اور اس میں جو کچھ ہے اس کی بھلائی کا سوال کرتا ہوں۔ اور میں تیری پناہ چاہتا ہوں اس کی برائی سے، اس کے باشندوں کی برائی سے اور اس میں جو کچھ ہے اس کی برائی سے۔
   Reference: Sunan Ibn Majah

2. Dua Before Eating
   Arabic: بِسْمِ اللهِ
   English: In the name of Allah
   Urdu: اللہ کے نام سے
   Reference: Sahih Bukhari, Book of Foods, Hadith 5376

3. Dua After Eating (Option 1)
   Arabic: الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ
   English: All praise is due to Allah, Who has fed us and given us drink, and made us Muslims.
   Urdu: تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور ہمیں مسلمان بنایا۔
   Reference: Sunan Abu Dawud, Book of Food, Hadith 3850

4. Dua After Eating (Option 2)
   Arabic: الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِي هُ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ
   English: All praise is due to Allah, Who has fed me this, and provided it for me without any power or strength from myself.
   Urdu: تمام تعریف اللہ کے لیے ہے جس نے مجھے یہ کھانا کھلایا اور بغیر میری کسی طاقت اور قوت کے مجھے یہ رزق عطا کیا۔
   Reference: Sunan Abu Dawud, Book of Food, Hadith 3851 and Jami at-Tirmidhi, Book 42, Hadith 11

5. Dua before entering the toilet
   Arabic: بِسْمِ اللهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ
   English: In the name of Allah, O Allah, I seek refuge in You from all evil and impure things.
   Urdu: اللہ کے نام سے، اے اللہ! میں تمام ناپاک چیزوں اور برائیوں سے تیری پناہ چاہتا ہوں۔
   Reference: Sahih Bukhari, Book 4, Hadith 9 and Sahih Muslim, Book 4, Hadith 739

Response format:
{
  "arabic_text": "[Arabic text with diacritics]",
  "english_translation": "[English translation]",
  "urdu_translation": "[PROPER URDU translation in Urdu script, NOT Arabic repeated]",
  "reference": "[SPECIFIC Reference source with book, number, etc.]",
  "title": "[Descriptive title for the dua]"
}`;
};

// Helper function to validate dua response
const validateDuaData = (data) => {
  // Check if data has all required fields
  const requiredFields = ['arabic_text', 'english_translation', 'urdu_translation', 'reference', 'title'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Check if Urdu translation is just repeating the Arabic
  if (data.urdu_translation && data.arabic_text) {
    // Check if Urdu contains a significant portion of the Arabic text
    const arabicWithoutDiacritics = data.arabic_text.replace(/[\u064B-\u065F\u0670]/g, ''); // Remove diacritics
    const urduWithoutDiacritics = data.urdu_translation.replace(/[\u064B-\u065F\u0670]/g, ''); // Remove diacritics
    
    // If more than 70% similar, it's likely the Arabic was just copied
    const similarityThreshold = 0.7;
    let similarity = 0;
    
    // Simple similarity check - just check if most characters match
    if (urduWithoutDiacritics.length > 0) {
      let matchCount = 0;
      for (let i = 0; i < Math.min(arabicWithoutDiacritics.length, urduWithoutDiacritics.length); i++) {
        if (arabicWithoutDiacritics[i] === urduWithoutDiacritics[i]) {
          matchCount++;
        }
      }
      similarity = matchCount / Math.min(arabicWithoutDiacritics.length, urduWithoutDiacritics.length);
    }
    
    if (similarity > similarityThreshold) {
      return {
        valid: false,
        message: 'The Urdu translation appears to be a copy of the Arabic text. Please provide a proper Urdu translation.'
      };
    }
  }
  
  // Check if reference is authentic and specific
  const referenceField = data.reference.toLowerCase();
  const hasInvalidReference = 
    referenceField.includes('not explicitly mentioned') ||
    referenceField.includes('derived from') ||
    referenceField.includes('general spirit') ||
    referenceField.includes('not found') ||
    (
      !referenceField.includes('quran') && 
      !referenceField.includes('hadith') && 
      !referenceField.includes('sahih') && 
      !referenceField.includes('sunan') && 
      !referenceField.includes('tirmidhi') && 
      !referenceField.includes('bukhari') && 
      !referenceField.includes('muslim')
    );
  
  if (hasInvalidReference) {
    return {
      valid: false,
      message: 'The reference provided is not specific or authentic enough'
    };
  }
  
  return { valid: true };
};

/**
 * @route   POST /api/gemini/dua
 * @desc    Generate dua information using Gemini AI
 * @access  Public
 */
router.post('/dua', async (req, res) => {
  try {
    const { query } = req.body;

    // Validate query
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Log API request for debugging
    logger.info(`Processing dua query: "${query}"`);
    
    // Validate API key
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured',
        message: 'Please set GEMINI_API_KEY in .env file'
      });
    }

    // Use gemini-1.5-flash model which is available in the free tier
    logger.info('Using model: gemini-1.5-flash');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: generateSystemPrompt() }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll provide authentic duas in the format requested." }],
        },
      ],
    });

    // Send the message and get response
    logger.info('Sending prompt to Gemini API...');
    const result = await chat.sendMessage(
      `Please provide the dua for: ${query}. IMPORTANT: The dua MUST have a SPECIFIC and AUTHENTIC reference from Quran or Hadith collections with exact book/chapter/verse/hadith numbers. If you can't find a specific authentic reference, state that clearly.`
    );
    const textResponse = result.response.text();

    // Extract JSON from text response
    let duaData;
    try {
      // Look for JSON object in the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        duaData = JSON.parse(jsonMatch[0]);
        
        // Validate the dua data
        const validation = validateDuaData(duaData);
        if (!validation.valid) {
          logger.warn(`Invalid dua data: ${validation.message}`);
          // Try again with a more explicit prompt
          logger.info('Retrying with more specific prompt...');
          
          // Customize retry message based on validation error
          let retryMessage = `Please provide the dua for: ${query}. `;
          
          if (validation.message.includes('Urdu translation')) {
            retryMessage += `IMPORTANT: Your Urdu translation is incorrect. Do NOT just repeat the Arabic text in the Urdu field. Provide a PROPER URDU TRANSLATION in Urdu script (like: اللہ کے نام سے). `;
          }
          
          if (validation.message.includes('reference')) {
            retryMessage += `You MUST include a SPECIFIC Quran verse or authentic Hadith reference with book name and hadith number. Do NOT make up references or provide general statements about the origin of the dua. `;
          }
          
          retryMessage += `Follow the exact format I requested.`;
          
          const retryResult = await chat.sendMessage(retryMessage);
          const retryResponse = retryResult.response.text();
          
          // Try to extract JSON again
          const retryJsonMatch = retryResponse.match(/\{[\s\S]*\}/);
          if (retryJsonMatch) {
            duaData = JSON.parse(retryJsonMatch[0]);
            // Validate again
            const retryValidation = validateDuaData(duaData);
            if (!retryValidation.valid) {
              logger.warn(`Still invalid after retry: ${retryValidation.message}`);
              // Accept it anyway but add a note
              duaData.note = `Warning: ${retryValidation.message}. Please verify this information.`;
            }
          } else {
            return res.status(500).json({ 
              error: 'Failed to parse AI response after retry', 
              raw_response: retryResponse 
            });
          }
        }
      } else {
        // If no JSON found, return the text response with error
        return res.status(500).json({ 
          error: 'Failed to parse AI response', 
          raw_response: textResponse 
        });
      }
    } catch (error) {
      logger.error(`Error parsing Gemini response: ${error.message}`);
      return res.status(500).json({ 
        error: 'Failed to parse AI response', 
        raw_response: textResponse 
      });
    }

    // Log success
    logger.info(`Dua generated for query: ${query}`);

    // Return the dua data
    return res.status(200).json(duaData);

  } catch (error) {
    logger.error(`Error generating dua: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to generate dua information',
      message: error.message
    });
  }
});

module.exports = router; 