## Production Path (Scalable, Reliable, Robust)

This project is intentionally lightweight for a case study. Below is the production-ready path that keeps the same product experience while scaling data, search, and operations.

### Goals
- Reliable real-time product and order data
- Scalable search with relevance + filters
- Secure and auditable customer interactions
- Clear separation of concerns for future growth

### Data Layer
- Use Postgres as the source of truth for products, orders, and tickets
- Normalize catalog data and keep immutable history for price and stock changes
- Add background jobs for sync and reindexing

### Search Layer
- Store embeddings in a vector index (pgvector or Pinecone)
- Hybrid search:
  - Keyword filtering for category, brand, price, stock
  - Vector similarity for semantic relevance
  - Rerank or merge results for final ordering
- Cache popular queries and product cards

### Order Tracking
- Integrate with commerce system or ERP
- Store orders in Postgres with status, shipment, and tracking events
- Use webhooks for order updates and shipment status
- Require email + order number for verification

### API Layer
- Internal APIs for catalog, orders, tickets, and search
- Validate inputs, rate limit, and log requests
- Use structured error responses for clean UI handling

### Observability
- Structured logs with correlation IDs
- Metrics for search latency, tool usage, and conversion
- Alerts for failures and data sync issues

### Security and Compliance
- Input validation and output sanitization
- PII redaction in logs
- Access control for internal tools and admin dashboards

### Deployment
- Use Docker for local parity
- Migrations for schema changes
- Separate staging and production environments

### Step-by-Step Upgrade Path
1. Add Postgres and move product data out of JSON
2. Add pgvector and embed `name + description + brand + category + symptoms`
3. Replace `searchParts()` with SQL similarity queries + filters
4. Add orders table and replace mock order lookups
5. Add webhooks for order status updates
6. Add observability and caching

### Outcome
This path keeps the current UX intact while making the system production-grade for scale, reliability, and long-term extensibility.
