import OpenAI from "openai";

/**
 * OpenAI Client Singleton
 *
 * Creates and exports a single, shared OpenAI client instance for use
 * throughout the application. This avoids instantiating multiple clients
 * and ensures consistent configuration.
 *
 * The client is configured using the OPENAI_API_KEY environment variable,
 * which must be set in the server environment (e.g., via .env.local).
 *
 * Usage:
 *   import openai from "./openai";
 *   const response = await openai.chat.completions.create({ ... });
 *
 * This module is an internal implementation detail of the lib folder and
 * should NOT be imported directly from outside src/lib/. Use the barrel
 * export at "@/lib" instead.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
