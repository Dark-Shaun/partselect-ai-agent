# PartSelect AI Agent

An AI-powered customer service chatbot for PartSelect, specializing in refrigerator and dishwasher parts. Built as a case study for Instalily AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google)

## The Problem

PartSelect serves millions of customers searching for appliance replacement parts. Traditional e-commerce search has limitations:

- Users don't know part numbers → Need natural language: *"My ice maker isn't working"*
- Compatibility confusion → Need instant verification: *"Does this fit my model?"*
- Complex troubleshooting → Need step-by-step guidance before buying parts
- After-hours support → Need 24/7 intelligent assistance

## The Solution

An AI agent that transforms the experience from **"search and hope"** to **"describe and solve"** — letting customers explain their problem in plain English and receive accurate, helpful guidance.

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

## Documentation

For detailed testing information and production considerations, please refer to:

### 📖 [DEMO_GUIDE.md](./DEMO_GUIDE.md)

Complete reference for testing the demo:
- **Why this solution** - Problem statement and vision
- **All demo parts** - 10 parts with prices, symptoms, and compatible models
- **Test queries** - Sample queries for each feature (including the 3 required case study queries)
- **Model & order numbers** - Data needed for compatibility and order tracking tests
- **Production scaling** - Architecture diagrams, performance targets, and scaling strategy

### 📖 [PRODUCTION_PATH.md](./PRODUCTION_PATH.md)

Detailed production roadmap:
- Infrastructure requirements
- Security considerations
- Implementation phases

## Author

Built by **Shaunak Milind Alshi** for the Instalily AI case study.

## License

This project is for demonstration purposes only.
