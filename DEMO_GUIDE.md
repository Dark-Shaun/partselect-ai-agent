# Demo Quick Reference Guide

## Purpose & Vision

### Why an AI Agent for PartSelect?

PartSelect serves millions of customers searching for appliance replacement parts. The traditional e-commerce search experience has limitations:

| Challenge | AI Agent Solution |
|-----------|-------------------|
| Users don't know part numbers | Natural language: "My ice maker isn't working" |
| Compatibility confusion | Instant verification: "Is this part compatible with my model?" |
| Complex troubleshooting | Step-by-step guidance before recommending parts |
| Decision paralysis | Curated recommendations based on symptoms |
| After-hours support | 24/7 intelligent assistance |

### The Goal

Transform the customer experience from **"search and hope"** to **"describe and solve"** — letting customers explain their problem in plain English and receive accurate, helpful guidance.

---

## Demo Data Reference

### Refrigerator Parts (5)

| Part # | Name | Price | Difficulty | Key Symptoms |
|--------|------|-------|------------|--------------|
| PS12364147 | Ice Maker Assembly | $189.95 | Moderate | Ice maker not working, clicking sounds |
| PS473177 | Evaporator Fan Blade | $12.95 | Easy | Fridge too warm, noisy |
| PS2350702 | Defrost Thermostat | $32.75 | Moderate | Frost buildup, runs too long |
| PS11701542 | Water Filter | $83.89 | Easy | Bad taste, slow dispenser |
| PS7784009 | Door Gasket | $89.50 | Easy | Door not sealing, sweating |

### Dishwasher Parts (5)

| Part # | Name | Price | Difficulty | Key Symptoms |
|--------|------|-------|------------|--------------|
| PS12712308 | Motor & Pump Assembly | $219.99 | Difficult | Not cleaning, not draining |
| PS16218716 | Door Latch Assembly | $52.50 | Moderate | Won't start, door issues |
| PS12585623 | Lower Spray Arm | $38.95 | Easy | Not cleaning properly |
| PS1990907 | Water Inlet Valve | $62.99 | Moderate | Won't fill, leaking |
| PS11750092 | Dishrack Adjuster | $28.99 | Easy | Rack won't stay up |

### Model Numbers for Testing

**Refrigerator Models:**
- `WRS325SDHZ` (Whirlpool)
- `FFSS2615TS0` (Frigidaire)
- `LFSS2612TF0` (Frigidaire)

**Dishwasher Models:**
- `WDT780SAEM1` (Whirlpool)
- `FFCD2418US` (Frigidaire)
- `KDTM354ESS` (KitchenAid)

### Order Numbers for Tracking

| Order # | Status |
|---------|--------|
| PS-2024-78542 | Shipped |
| PS-2024-78123 | Delivered |
| PS-2024-79001 | Processing |

---

## Why Supervisor Agent Architecture?

### What It Is
A **Supervisor Agent** is an AI orchestrator that:
1. **Analyzes** user intent from natural language
2. **Decides** which specialized tool to use
3. **Executes** the tool with extracted parameters
4. **Synthesizes** a helpful response

### Why This Architecture for the Demo

| Benefit | How It Helps |
|---------|--------------|
| **Intent-First Design** | Understands "my ice maker broke" vs "show me ice makers" as different needs |
| **Tool Specialization** | Each tool does one thing well (search, troubleshoot, compatibility check) |
| **Clean Separation** | AI handles language, tools handle logic — easy to debug |
| **Deterministic Fallbacks** | Keyword matching works even if AI fails |

### How It Helps PartSelect

1. **Reduces Support Tickets** → AI handles common questions 24/7
2. **Improves Conversion** → Users find the right part faster with symptom-based search
3. **Increases Trust** → Compatibility verification prevents wrong purchases
4. **Scales Support** → One agent handles unlimited concurrent conversations

### How It Scales for Production

| Demo State | Production Enhancement |
|------------|----------------------|
| 7 tools | Add 50+ tools (warranty, returns, scheduling, live agent handoff) |
| Single AI call | Parallel tool execution, multi-agent collaboration |
| In-memory state | Persistent conversations with user profiles |
| One model | Route simple queries to fast models, complex to powerful ones |
| 10 parts | Same architecture works with 5M+ parts |

### The Key Insight

> The Supervisor pattern decouples **what the user wants** from **how to fulfill it**.

This means:
- Adding new capabilities = adding new tools (no AI retraining)
- Changing AI providers = swap one function (tools unchanged)
- Scaling = horizontal scaling of stateless services

---

## Test Queries

### Required Case Study Queries

```
1. "How can I install part number PS11752778?"
2. "Is this part compatible with my WDT780SAEM1 model?"
3. "The ice maker on my Whirlpool fridge is not working. How can I fix it?"
```

### Additional Demo Queries

**Product Search:**
- "Show me refrigerator water filters"
- "I need a dishwasher spray arm"
- "What parts do you have for refrigerators?"

**Compatibility:**
- "Is PS12364147 compatible with FFSS2615TS0?"
- "What parts fit model WRS325SDHZ?"

**Troubleshooting:**
- "My ice maker isn't working"
- "Dishwasher not draining"
- "Fridge is too warm"

**Installation:**
- "How do I install part PS12364147?"
- "Installation guide for PS12585623"

**Order Tracking:**
- "Track order PS-2024-78542"
- "What's the status of my order PS-2024-78123?"

**Edge Cases (Scope Guardrails):**
- "Can you help with my washing machine?" → Politely declines
- "What's the weather?" → Stays focused
- "Hello" → Friendly greeting with options

---

## Production Scaling Strategy

### Current Demo Architecture

```
User → Supervisor Agent → Tools → Mock Database
                          ↓
                    Gemini AI (intent + response)
```

### Production Architecture

```
                         ┌─────────────────┐
                         │   Load Balancer │
                         └────────┬────────┘
                                  ↓
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
        ┌──────────┐        ┌──────────┐        ┌──────────┐
        │ Next.js  │        │ Next.js  │        │ Next.js  │
        │ Instance │        │ Instance │        │ Instance │
        └────┬─────┘        └────┬─────┘        └────┬─────┘
             └───────────────────┼───────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │    API Gateway         │
                    │  (Rate Limiting, Auth) │
                    └───────────┬────────────┘
                                ↓
        ┌───────────────────────┼───────────────────────┐
        ↓                       ↓                       ↓
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│ Supervisor    │     │ Vector Database │     │ Redis Cache   │
│ Agent Service │     │ (Pinecone)      │     │               │
└───────┬───────┘     └─────────────────┘     └───────────────┘
        ↓
┌───────────────────────────────────────────────────────────────┐
│                     Tool Execution Layer                       │
├───────────────┬───────────────┬───────────────┬───────────────┤
│ Product Search│ Inventory API │ Order Service │ Support CRM   │
│ (Elasticsearch)│ (Real-time)  │ (Internal)    │ (Zendesk)     │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

### Scaling Considerations

| Component | Demo | Production |
|-----------|------|------------|
| **Database** | JSON file (10 parts) | PostgreSQL + Elasticsearch (millions of parts) |
| **Search** | Text similarity | Vector embeddings + semantic search |
| **Caching** | In-memory (5 min TTL) | Redis cluster with smart invalidation |
| **AI Provider** | Single Gemini key | Load-balanced across multiple providers |
| **Authentication** | None | OAuth 2.0 + session management |
| **Rate Limiting** | None | Per-user, per-IP limits |
| **Monitoring** | Console logs | DataDog/NewRelic + custom dashboards |

### Performance Targets

| Metric | Demo | Production Target |
|--------|------|-------------------|
| Response Time | 2-5s | < 1s (p95) |
| Concurrent Users | 1 | 10,000+ |
| Parts Searchable | 10 | 5,000,000+ |
| Availability | Dev only | 99.9% SLA |
| AI Fallback | Basic | Multi-provider with failover |

### Cost Optimization

| Strategy | Implementation |
|----------|----------------|
| Response Caching | Cache identical queries for 5 minutes |
| Tiered AI | Use fast/cheap model for simple intents, powerful model for complex |
| Edge Caching | Cache product data at CDN level |
| Batch Processing | Queue non-urgent operations |

---

## Summary

This demo showcases an AI-powered customer service agent using the **Supervisor Agent pattern**. While built with 10 demo parts, the architecture scales to millions of products. The key advantage: **adding new capabilities means adding new tools — no AI retraining required**.

Built by **Shaunak Milind** for the Instalily AI case study.
