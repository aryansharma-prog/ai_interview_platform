const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');

let Groq = null;
try {
  Groq = require('groq-sdk');
} catch (e) {
  logger.warn('groq-sdk package not yet available, will fallback to Gemini or mock');
}

// Initialize Clients
const genAI = env.gemini.apiKey ? new GoogleGenerativeAI(env.gemini.apiKey) : null;
const groqClient = (Groq && env.groq.apiKey) ? new Groq({ apiKey: env.groq.apiKey }) : null;

/**
 * Universal AI Completion function with multi-provider routing (Groq + Gemini).
 * Prioritizes specified provider or auto-selects available live key,
 * with seamless fallback chain and deterministic offline mocks.
 */
async function generateJSON(prompt, mockFallback, options = {}) {
  const providerPref = options.provider || env.aiProvider || 'auto';
  const systemPrompt = options.systemPrompt || 'You are an expert AI technical interviewer, resume evaluator, and career coach. Always return response in strict, valid JSON format without markdown code fences or backticks.';

  // Determine provider order
  const providersToTry = [];
  if (providerPref === 'groq' && groqClient) {
    providersToTry.push('groq', 'gemini');
  } else if (providerPref === 'gemini' && genAI) {
    providersToTry.push('gemini', 'groq');
  } else {
    // Auto: try Groq first (fastest inference for live interview), then Gemini
    if (groqClient) providersToTry.push('groq');
    if (genAI) providersToTry.push('gemini');
  }

  for (const provider of providersToTry) {
    try {
      if (provider === 'groq' && groqClient) {
        logger.info(`Generating JSON via Groq (${env.groq.model})...`);
        const chatCompletion = await groqClient.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${prompt}\n\nIMPORTANT: Return ONLY valid, parseable JSON.` },
          ],
          model: env.groq.model || 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          temperature: options.temperature ?? 0.4,
        });

        const content = chatCompletion.choices[0]?.message?.content?.trim();
        if (content) {
          return JSON.parse(content);
        }
      }

      if (provider === 'gemini' && genAI) {
        logger.info(`Generating JSON via Gemini (${env.gemini.model})...`);
        const model = genAI.getGenerativeModel({
          model: env.gemini.model || 'gemini-1.5-pro',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: options.temperature ?? 0.4,
          },
        });
        const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
        const text = result.response.text();
        return JSON.parse(text);
      }
    } catch (err) {
      logger.warn(`AI Generation failed with ${provider}: ${err.message}. Trying next provider...`);
    }
  }

  if (!groqClient && !genAI) {
    logger.warn('No active AI key (GROQ_API_KEY or GEMINI_API_KEY) found. Using deterministic intelligent fallback.');
  }

  return typeof mockFallback === 'function' ? mockFallback() : mockFallback;
}

module.exports = {
  generateJSON,
  hasActiveProvider: Boolean(groqClient || genAI),
  activeProviders: [groqClient && 'groq', genAI && 'gemini'].filter(Boolean),
};
