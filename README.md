# 🎭 AI Story Weaver (2 Players)

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-green.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Latest-38B2AC.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%20API-Latest-orange.svg)](https://ai.google.dev/)

A fun, interactive story-weaving game where two players take turns providing prompts to create an AI-powered narrative adventure! 📚✨

## ✨ Features

- 🎮 Turn-based storytelling with two players
- 🤖 AI-powered narrative generation using Google's Gemini
- 🖼️ Optional AI image generation (with supported API key)
- 🎨 Beautiful modern UI with TailwindCSS
- ⚡ Fast development with Vite
- 📱 Responsive design for various screen sizes

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- Google Gemini API Key ([Get it here](https://aistudio.google.com/apikey))
- A spirit of adventure! 🌟

### 🛠️ Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-story-weaver-2p
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment:

   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```
     ⚠️ **Important**: This app ONLY supports Google Gemini API. Other AI providers are not supported.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Play

1. Player A starts by entering a prompt about a character, setting, or situation.
2. The AI weaves the prompt into a narrative segment.
3. Player B continues the story with their own prompt.
4. Repeat until you reach the conclusion (50 total turns)!
5. If image generation is enabled (requires Imagen support in your API key), the AI will occasionally generate images for particularly vivid scenes!

## 💡 Tips for Great Storytelling

- 🎭 Create interesting characters with unique personalities
- 🌍 Establish vivid settings and environments
- 🎪 Introduce plot twists and conflicts
- 🤝 Build on each other's ideas
- 🎯 Keep your prompts focused but creative

## ⚙️ API Key Notes

- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) will enable text story generation
- Image generation requires a Gemini API key with Imagen access
- Keep your API key secure and never commit it to version control

## 🔒 Security Note

The `.env.local` file containing your API key is automatically excluded from git tracking for security. Never share your API key publicly!

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Happy Storytelling! 📚✨ May your tales be epic and your imagination limitless!
