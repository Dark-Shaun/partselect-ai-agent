# PartSelect AI Assistant

An intelligent **agentic chat assistant** for PartSelect e-commerce, specialized in helping customers find refrigerator and dishwasher parts.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google)

## Features

### Agentic Capabilities

The AI agent intelligently selects the right tool based on user intent:

| Tool | Function | Example Query |
|------|----------|---------------|
| **search_products** | Find parts by keyword | "Show me ice makers" |
| **check_compatibility** | Verify part fits model | "Is PS11752778 compatible with WDT780SAEM1?" |
| **get_compatible_parts** | List parts for a model | "What parts fit my WRS325SDHZ?" |
| **troubleshoot_issue** | Diagnose problems | "My ice maker isn't working" |
| **get_installation_help** | Installation guidance | "How do I install PS11752778?" |
| **check_order_status** | Track orders | "Check order PS-2024-78542" |

### Technical Highlights

- **Agentic Architecture**: AI-driven tool selection based on intent classification
- **60 Real Parts**: Curated database of refrigerator and dishwasher parts
- **Semantic Search**: Text similarity matching for relevant results
- **Multi-LLM Ready**: Supports Gemini (free), OpenAI, and Anthropic
- **Scope Guardrails**: Politely declines off-topic questions
- **Rich Product Cards**: Visual part display with ratings, prices, compatibility

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Message                            │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Intent Detection                           │
│  (search | compatibility | troubleshoot | install | order)   │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Tool Selection                             │
│              AI selects appropriate tool                     │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Tool Execution                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │   Search   │ │   Compat   │ │Troubleshoot│ ...          │
│  └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Gemini Response Generation                      │
│         (contextual, conversational response)                │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone and install:
```bash
cd partselect-agent
npm install
```

2. Generate product data:
```bash
npm run generate-data
```

3. Set up environment (optional for AI responses):
```bash
cp .env.example .env.local
# Add your Gemini API key (free at https://makersuite.google.com/app/apikey)
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Test Queries

Try these queries that match the case study requirements:

1. **Installation Help**
   > "How can I install part number PS11752778?"

2. **Compatibility Check**
   > "Is this part compatible with my WDT780SAEM1 model?"

3. **Troubleshooting**
   > "The ice maker on my Whirlpool fridge is not working. How can I fix it?"

Additional test queries:
- "Show me dishwasher drain pumps"
- "What parts are compatible with model WRS325SDHZ?"
- "My dishwasher won't drain"
- "Check order PS-2024-78542"
- "What's the weather?" (tests scope guardrails)

## Project Structure

```
partselect-agent/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Chat API endpoint
│   │   ├── page.tsx             # Main chat page
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── chat/                # Chat UI components
│   │   ├── products/            # Product card components
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── agent.ts         # Agentic controller
│   │   │   ├── tools.ts         # Tool definitions
│   │   │   └── gemini.ts        # Gemini client
│   │   ├── db/
│   │   │   └── simple-vector-store.ts  # Vector search
│   │   └── scraper/             # Data scraper
│   ├── data/
│   │   └── parts.ts             # Original parts data
│   └── types/
│       └── index.ts             # TypeScript types
├── data/
│   └── scraped-parts.json       # Generated parts database
├── scripts/
│   └── generate-data.ts         # Data generation script
└── .env.local                   # Environment variables
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| LLM | Google Gemini 1.5 Flash (free) |
| Search | Text similarity matching |
| Icons | Lucide React |

## Environment Variables

```bash
# Google Gemini (FREE - Recommended)
GOOGLE_API_KEY=your_gemini_api_key

# Alternative LLMs (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

Get a free Gemini API key: https://makersuite.google.com/app/apikey

## Extending the Agent

### Adding New Tools

Edit `src/lib/ai/tools.ts`:

```typescript
export const myNewTool: Tool = {
  name: "my_tool",
  description: "What this tool does",
  parameters: {
    type: "object",
    properties: {
      param1: { type: "string", description: "..." }
    },
    required: ["param1"]
  },
  execute: async (params) => {
    // Tool logic here
    return { success: true, data: result, message: "..." };
  }
};
```

### Adding More Products

Run the data generator or edit `scripts/generate-data.ts` to add more parts.

## Demo Mode

Works without API keys using intelligent keyword matching for tool selection and pre-built responses. Add a Gemini API key for natural, conversational responses.

## Security & Limitations

- Message rendering avoids raw HTML injection
- API routes validate input shape and basic constraints
- Demo data is static and intended for case study scope
- For production-grade scalability and reliability, see `PRODUCTION_PATH.md`

## License

Created as a case study for Instalily AI.
