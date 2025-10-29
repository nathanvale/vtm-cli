# Helpers: Thinking Partner

**Command:** `/helpers:thinking-partner {topic} [--deep] [--sources=web|docs|code]`
**Purpose:** AI-powered research and ideation partner for exploring options, gathering context, and making informed decisions before committing to implementation.

---

## What This Command Does

Acts as an intelligent research assistant that helps you:

- **Explore alternatives** before making architectural decisions
- **Research best practices** from documentation, forums, and code examples
- **Gather context** from multiple sources (web, library docs, existing code)
- **Synthesize information** into actionable insights
- **Generate decision criteria** for evaluating options

This command is composable and can be called from any domain (plan, vtm, etc.) when deep research is needed.

---

## Usage

```bash
# Basic research on a topic
/helpers:thinking-partner "authentication strategies for Node.js APIs"

# Deep dive with multiple sources
/helpers:thinking-partner "database migration patterns" --deep --sources=web,docs,code

# Quick web search only
/helpers:thinking-partner "React state management 2025" --sources=web

# Library documentation focus
/helpers:thinking-partner "Next.js app router vs pages" --sources=docs
```

---

## Parameters

- `{topic}`: Research topic or question (required)
- `--deep`: Enable comprehensive multi-source research (optional)
- `--sources`: Comma-separated list of sources to use (optional)
  - `web`: General web search via Tavily
  - `docs`: Library documentation via Context7
  - `code`: GitHub code examples via Firecrawl
  - `all`: Use all sources (default with --deep)

---

## Implementation Instructions

You are a research and ideation agent helping the user explore a topic before making decisions.

### Step 1: Parse Arguments

```javascript
const topic = ARGUMENTS[0]
const isDeep = ARGUMENTS.includes("--deep")
const sourcesArg = ARGUMENTS.find((arg) => arg.startsWith("--sources="))
const sources = sourcesArg
  ? sourcesArg.split("=")[1].split(",")
  : isDeep
    ? ["web", "docs", "code"]
    : ["web"]
```

### Step 2: Validate MCP Availability

Check which MCP servers are available:

```javascript
// Check if MCP servers are configured
const availableMCP = {
  web: true, // Tavily (always available)
  docs: false, // Context7 (check if configured)
  code: false, // Firecrawl (check if configured)
}

// Filter requested sources to available ones
const activeSources = sources.filter((s) => availableMCP[s])

if (activeSources.length === 0) {
  console.log("❌ No MCP servers available for requested sources")
  console.log("Falling back to basic research mode")
  activeSources = ["web"] // Always have Tavily
}
```

### Step 3: Research Phase

For each active source, gather information:

#### Source: Web (Tavily MCP)

```javascript
if (activeSources.includes("web")) {
  console.log("🔍 Searching web for: " + topic)

  const webResults = await tavilySearch({
    query: topic,
    search_depth: isDeep ? "advanced" : "basic",
    max_results: isDeep ? 10 : 5,
    include_raw_content: true,
  })

  // Extract key insights
  const webInsights = webResults.results.map((r) => ({
    title: r.title,
    url: r.url,
    summary: r.content.substring(0, 300),
    relevance: r.score,
  }))
}
```

#### Source: Docs (Context7 MCP)

```javascript
if (activeSources.includes("docs")) {
  console.log("📚 Searching library documentation for: " + topic)

  // Extract library name from topic if present
  const libraryMatch = topic.match(
    /\b(react|next\.js|typescript|node\.js|express)\b/i,
  )

  if (libraryMatch) {
    const library = libraryMatch[0]
    const libraryId = await resolveLibraryId(library)

    const docs = await getLibraryDocs({
      context7CompatibleLibraryID: libraryId,
      topic: topic,
      tokens: isDeep ? 8000 : 3000,
    })

    // Extract relevant sections
    const docInsights = extractRelevantSections(docs, topic)
  }
}
```

#### Source: Code (Firecrawl MCP)

```javascript
if (activeSources.includes("code")) {
  console.log("💻 Searching code examples for: " + topic)

  // Search GitHub via Firecrawl
  const githubQuery = `${topic} language:typescript OR language:javascript`
  const githubUrl = `https://github.com/search?q=${encodeURIComponent(githubQuery)}&type=code`

  const codeResults = await firecrawlScrape({
    url: githubUrl,
    formats: ["markdown"],
    maxAge: 86400000, // 24 hour cache
  })

  // Extract code patterns
  const codeInsights = extractCodePatterns(codeResults.markdown)
}
```

### Step 4: Synthesis Phase

Combine insights from all sources:

```javascript
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
console.log("🧠 THINKING PARTNER: " + topic)
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

// Present findings by category
if (webInsights) {
  console.log("## Web Research Findings\n")
  webInsights.forEach((insight, i) => {
    console.log(`### ${i + 1}. ${insight.title}`)
    console.log(`   Source: ${insight.url}`)
    console.log(`   ${insight.summary}`)
    console.log(`   Relevance: ${Math.round(insight.relevance * 100)}%\n`)
  })
}

if (docInsights) {
  console.log("## Library Documentation Insights\n")
  docInsights.forEach((insight) => {
    console.log(`### ${insight.library} - ${insight.section}`)
    console.log(`   ${insight.summary}\n`)
  })
}

if (codeInsights) {
  console.log("## Code Pattern Analysis\n")
  codeInsights.forEach((pattern) => {
    console.log(`### Pattern: ${pattern.name}`)
    console.log(`   Usage: ${pattern.frequency} examples`)
    console.log(`   \`\`\`typescript`)
    console.log(`   ${pattern.example}`)
    console.log(`   \`\`\`\n`)
  })
}
```

### Step 5: Decision Support

Generate actionable recommendations:

```javascript
console.log("## Recommended Approach\n")

// Synthesize insights into options
const options = synthesizeOptions(webInsights, docInsights, codeInsights)

options.forEach((option, i) => {
  console.log(`### Option ${i + 1}: ${option.name}`)
  console.log(`   **Pros:**`)
  option.pros.forEach((pro) => console.log(`   - ${pro}`))
  console.log(`   **Cons:**`)
  option.cons.forEach((con) => console.log(`   - ${con}`))
  console.log(`   **Best for:** ${option.bestFor}`)
  console.log(`   **Sources:** ${option.sources.join(", ")}\n`)
})

console.log("## Next Steps\n")
console.log("1. Review options above")
console.log("2. Create ADR documenting your decision: `/plan:create-adr`")
console.log("3. Create technical spec: `/plan:create-spec`")
console.log("4. Transform to VTM tasks: `/plan:to-vtm`\n")

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
```

### Step 6: Save Research

Optionally save research to file for reference:

```javascript
const timestamp = new Date().toISOString().split("T")[0]
const filename = `research-${topic.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.md`
const researchPath = `docs/research/${filename}`

const researchMarkdown = generateResearchMarkdown({
  topic,
  webInsights,
  docInsights,
  codeInsights,
  options,
})

await writeFile(researchPath, researchMarkdown)
console.log(`💾 Research saved to: ${researchPath}`)
```

---

## Output Format

The command provides structured output:

````
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 THINKING PARTNER: {topic}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Web Research Findings
### 1. Best Practices for {topic}
   Source: https://example.com/article
   Summary of key points...
   Relevance: 95%

## Library Documentation Insights
### Next.js - Authentication
   Official Next.js docs recommend...

## Code Pattern Analysis
### Pattern: JWT with Refresh Tokens
   Usage: 247 examples
   ```typescript
   // Common implementation pattern
````

## Recommended Approach

### Option 1: OAuth2 with Passport.js

**Pros:**

- Well-established pattern
- Large community support
  **Cons:**
- Steeper learning curve
  **Best for:** Enterprise applications with SSO requirements
  **Sources:** Web, Docs, Code

### Option 2: JWT with Custom Implementation

**Pros:**

- Full control over implementation
- Lightweight
  **Cons:**
- More security considerations
  **Best for:** Simple APIs with basic auth needs
  **Sources:** Web, Code

## Next Steps

1. Review options above
2. Create ADR: /plan:create-adr
3. Create spec: /plan:create-spec
4. Transform to tasks: /plan:to-vtm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```

---

## Integration with Plan Domain

The thinking-partner is typically called at the start of the planning workflow:

```

User has a feature idea
↓
/helpers:thinking-partner "feature requirements"
↓
Review research findings and options
↓
/plan:create-adr (document chosen approach)
↓
/plan:create-spec (detail implementation)
↓
/plan:to-vtm (convert to tasks)
↓
/vtm:next (start implementation)

````

---

## MCP Server Requirements

This command uses these MCP servers:

1. **Tavily MCP** (Required) - Web search
   - Always available
   - Provides general web research

2. **Context7 MCP** (Optional) - Library documentation
   - Enhances research with official docs
   - Provides code examples from library docs

3. **Firecrawl MCP** (Optional) - Code scraping
   - Searches GitHub for real implementations
   - Extracts patterns from production code

If optional MCPs are not configured, the command falls back to web-only research.

---

## Error Handling

```javascript
// Handle missing MCP servers gracefully
if (!tavilyAvailable) {
  console.error('❌ Tavily MCP not configured')
  console.error('Install: https://github.com/modelcontextprotocol/servers/tree/main/src/tavily')
  process.exit(1)
}

// Handle search errors
try {
  const results = await tavilySearch(query)
} catch (error) {
  console.error('⚠️  Search failed:', error.message)
  console.log('Continuing with available results...')
}

// Handle rate limits
if (error.status === 429) {
  console.error('⚠️  Rate limit exceeded. Try again in 1 minute.')
  process.exit(1)
}
````

---

## Examples

### Example 1: Authentication Research

```bash
/helpers:thinking-partner "Node.js API authentication strategies" --deep
```

Output would cover:

- OAuth2 vs JWT vs Session-based
- Library comparisons (Passport.js, Auth0, etc.)
- Security best practices
- Code examples from GitHub
- Recommended approach based on common patterns

### Example 2: Quick Web Search

```bash
/helpers:thinking-partner "React 19 new features" --sources=web
```

Output would provide:

- Latest articles on React 19
- Release notes summaries
- Community feedback
- Quick comparison to React 18

### Example 3: Library Documentation Focus

```bash
/helpers:thinking-partner "Next.js server actions vs API routes" --sources=docs
```

Output would show:

- Official Next.js documentation
- Use case comparisons
- Performance considerations
- Migration guides

---

## Notes

- **Token Efficiency**: Uses caching (maxAge) to reduce repeated API calls
- **Composable**: Can be called from any workflow needing research
- **Graceful Degradation**: Falls back to web-only if optional MCPs unavailable
- **Save for Later**: Research can be saved to docs/research/ for reference
- **Decision Support**: Synthesizes findings into actionable options

---

## See Also

- `/plan:create-adr` - Document architectural decisions
- `/plan:create-spec` - Create technical specifications
- `/plan:to-vtm` - Transform plans into VTM tasks
- MCP Servers: Tavily, Context7, Firecrawl

---

**Status:** Core helper command for research-driven development
**Dependencies:** Tavily MCP (required), Context7 MCP (optional), Firecrawl MCP (optional)
**Used by:** plan domain, any domain needing research capabilities
