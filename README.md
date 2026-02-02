# PartSelect AI Agent

An AI-powered customer service chatbot for PartSelect, specializing in refrigerator and dishwasher parts. Built as a case study for Instalily AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google)

## Features

- **Product Search** - Find parts by name, description, or symptoms
- **Compatibility Check** - Verify if a part fits your appliance model
- **Troubleshooting** - Get step-by-step diagnostic guidance with common causes
- **Installation Help** - Detailed installation instructions with difficulty ratings
- **Order Tracking** - Check order status with tracking information
- **Support Tickets** - Create support tickets when human help is needed
- **Scope Guardrails** - Politely declines off-topic questions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Google Gemini 1.5 Flash |
| Architecture | Supervisor Agent Pattern |

## Architecture

The chatbot uses a **Supervisor Agent** pattern that separates decision-making from execution:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Message                           │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 Supervisor Analysis                         │
│     (Intent Detection + Tool Selection + Parameters)        │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Tool Execution                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Search  │ │  Compat  │ │Troubleshoot│ │ Install │ ...  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Response Synthesis                             │
│         (AI generates contextual response)                  │
└─────────────────────────────────────────────────────────────┘
```

### Available Tools

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `search_products` | Search parts catalog | "Show me water filters" |
| `check_compatibility` | Verify part fits model | "Is PS12364147 compatible with WRS325SDHZ?" |
| `get_compatible_parts` | List parts for a model | "What parts fit my WRS325SDHZ?" |
| `troubleshoot_issue` | Diagnostic steps | "My ice maker isn't working" |
| `get_installation_help` | Installation guides | "How do I install PS12364147?" |
| `check_order_status` | Track orders | "Track order PS-2024-78542" |
| `create_support_ticket` | Human escalation | "I need to talk to someone" |

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dark-Shaun/partselect-ai-agent.git
cd partselect-ai-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GOOGLE_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the chatbot.

### Get a Free Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## Demo Queries

These queries match the case study requirements:

**1. Installation Help**
> "How can I install part number PS11752778?"

**2. Compatibility Check**  
> "Is this part compatible with my WDT780SAEM1 model?"

**3. Troubleshooting**
> "The ice maker on my Whirlpool fridge is not working. How can I fix it?"

### Additional Test Queries

- "Show me refrigerator water filters"
- "What parts are compatible with model WRS325SDHZ?"
- "My dishwasher won't drain"
- "Track order PS-2024-78542"
- "Can you dance with me?" (tests scope guardrails)
- "Hello" (tests greeting handling)

## Project Structure

```
partselect-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Chat API endpoint
│   │   │   └── tickets/route.ts   # Support ticket API
│   │   ├── page.tsx               # Main chat page
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── chat/                  # Chat UI components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── SupportTicketForm.tsx
│   │   ├── products/              # Product card components
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       ├── ai/
│       │   ├── supervisor.ts      # Main agent logic
│       │   ├── tools.ts           # Tool definitions
│       │   └── providers.ts       # AI provider config
│       └── db/
│           └── simple-vector-store.ts  # Parts database
├── data/
│   └── scraped-parts.json         # Product database (10 demo parts)
└── .env.local                     # Environment variables
```

## Key Design Decisions

### Why Supervisor Agent Pattern?
- **Single decision point** - All intent classification happens in one place
- **Extensible** - Add new tools without modifying core logic
- **Testable** - Each tool can be tested independently
- **Maintainable** - Clear separation of concerns

### Why 10 Demo Parts?
- Focused demo with real data from PartSelect
- 5 refrigerator parts + 5 dishwasher parts
- Enables meaningful compatibility and troubleshooting demos
- Real prices, ratings, and compatible models

### Why Gemini?
- Free tier available for development
- Good instruction following
- Fast response times
- Easy to swap for other providers

## Production Considerations

For a production deployment, I would add:

- **Real-time inventory** - Integration via PartSelect API
- **Vector database** - Pinecone/Weaviate for semantic search across thousands of parts
- **User authentication** - Personalized order tracking and history
- **Analytics** - Conversation logging and intent analysis
- **Caching** - Redis for frequently accessed data
- **Rate limiting** - Protection against abuse
- **Monitoring** - Error tracking and performance metrics

See `PRODUCTION_PATH.md` for detailed production roadmap.

## Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_gemini_api_key

# Optional (alternative LLMs)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Author

Built by **Shaunak Milind** for the Instalily AI case study.

## License

This project is for demonstration purposes only.
