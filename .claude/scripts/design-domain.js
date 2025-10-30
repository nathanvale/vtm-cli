#!/usr/bin/env node

/**
 * Design Domain - Interactive Design Wizard
 *
 * Guides users through a 5-question design process to create a complete
 * domain specification that `/scaffold:domain` can use.
 *
 * Usage: node design-domain.js <domain-name> [optional-description]
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ============================================================================
// CONFIGURATION
// ============================================================================

const DESIGN_DIR = '.claude/designs'
const VALID_DOMAIN_PATTERN = /^[a-z][a-z0-9-]{1,19}$/
const VALID_HOOK_EVENTS = ['pre-commit', 'post-checkout', 'pre-push', 'pre-to-vtm']
const VALID_SHARING_SCOPES = ['personal', 'team', 'community']

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate domain name format
 */
function validateDomainName(name) {
  if (!name) return { valid: false, error: 'Domain name is required' }
  if (!VALID_DOMAIN_PATTERN.test(name)) {
    return {
      valid: false,
      error: `Invalid domain name: "${name}"\n\nDomain names must:\n  • Be lowercase\n  • Use letters, numbers, hyphens only\n  • Start with a letter\n  • Be 2-20 characters\n\nExamples: pm, devops, test-automation, deploy`,
    }
  }
  return { valid: true }
}

/**
 * Check if design file already exists
 */
function designExists(domainName) {
  const filePath = path.join(DESIGN_DIR, `${domainName}.json`)
  return fs.existsSync(filePath)
}

/**
 * Parse operation input (comma-separated) into operation objects
 */
function parseOperations(input, domainName) {
  const operations = input
    .split(',')
    .map((op) => op.trim())
    .filter((op) => op.length > 0)
    .map((opName) => {
      // Convert to lowercase slug
      const name = opName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      // Generate description
      const description = `${opName.trim()} operation for ${domainName}`

      return {
        name,
        description,
        manual_invocation: `/${domainName}:${name}`,
        triggers_auto_discovery: true,
      }
    })

  return operations
}

/**
 * Generate trigger phrases based on operation names
 */
function generateTriggerPhrases(operations) {
  const phrases = new Set()

  operations.forEach((op) => {
    const name = op.name

    // Add operation-specific phrases
    if (name === 'next' || name.includes('next')) {
      phrases.add('what should I work on')
      phrases.add('next task')
      phrases.add('show next')
      phrases.add("what's next")
    }
    if (name === 'list' || name.includes('list')) {
      phrases.add('show all')
      phrases.add('list items')
      phrases.add('what do we have')
    }
    if (name === 'review' || name.includes('review')) {
      phrases.add('show status')
      phrases.add('review progress')
      phrases.add('how are we doing')
      phrases.add("what's our status")
    }
    if (name === 'create' || name.includes('create')) {
      phrases.add('create new')
      phrases.add('start new')
      phrases.add('make a new')
    }
    if (name === 'update' || name.includes('update')) {
      phrases.add('update')
      phrases.add('modify')
      phrases.add('change')
    }
    if (name === 'delete' || name.includes('delete')) {
      phrases.add('delete')
      phrases.add('remove')
      phrases.add('archive')
    }

    // Add generic phrases
    phrases.add(`${name} operations`)
    phrases.add(`help with ${name}`)
  })

  return Array.from(phrases).sort()
}

/**
 * Parse yes/no response
 */
function parseYesNo(input) {
  const normalized = input.toLowerCase().trim()
  if (['yes', 'y', 'true', '1'].includes(normalized)) return true
  if (['no', 'n', 'false', '0'].includes(normalized)) return false
  return null
}

/**
 * Parse sharing scope response
 */
function parseSharingScope(input) {
  const normalized = input.toLowerCase().trim()
  if (VALID_SHARING_SCOPES.includes(normalized)) return normalized
  return null
}

/**
 * Create .claude/designs directory if it doesn't exist
 */
function ensureDesignDir() {
  if (!fs.existsSync(DESIGN_DIR)) {
    fs.mkdirSync(DESIGN_DIR, { recursive: true })
  }
}

/**
 * Format domain name for display (capitalize words)
 */
function formatDisplayName(name) {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================================================
// INTERACTIVE QUESTIONS
// ============================================================================

/**
 * Ask question and get response
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

/**
 * Q1: Core Operations
 */
async function askOperations(rl, domainName) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 QUESTION 1 of 5: Core Operations')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log(`What operations should your ${domainName} domain provide?\n`)
  console.log('Think about the key actions users will perform. For example:')
  console.log('  • Getting information (next task, current status)')
  console.log('  • Taking action (create, update, delete)')
  console.log('  • Reviewing state (list, stats, history)\n')

  let operations = []
  let valid = false

  while (!valid) {
    const input = await askQuestion(rl, 'Your operations (comma-separated): ')

    if (!input.trim()) {
      console.log('❌ Please provide at least one operation\n')
      continue
    }

    operations = parseOperations(input, domainName)

    if (operations.length === 0) {
      console.log('❌ Could not parse operations. Try: next, list, create\n')
      continue
    }

    console.log(`\n✅ Got ${operations.length} operations:\n`)
    operations.forEach((op) => {
      console.log(`  • /${domainName}:${op.name} - ${op.description}`)
    })

    const confirm = await askQuestion(rl, '\nLooks good? (yes/no): ')
    if (parseYesNo(confirm)) {
      valid = true
    } else {
      console.log("\nLet's try again.\n")
      operations = []
    }
  }

  return operations
}

/**
 * Q2: Auto-Discovery
 */
async function askAutoDiscovery(rl, operations) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 QUESTION 2 of 5: Auto-Discovery')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Should Claude automatically suggest these commands?\n')
  console.log('With auto-discovery (Skills):')
  console.log('  • User says: "what should I work on?"')
  console.log('  • Claude suggests: "Let me run the commands"\n')
  console.log('Without auto-discovery (Commands only):')
  console.log('  • User must explicitly say the command\n')

  let enabled = null

  while (enabled === null) {
    const input = await askQuestion(rl, 'Enable auto-discovery? (yes/no) [recommended: yes]: ')

    if (!input.trim()) {
      enabled = true // Default to yes
      console.log('✅ Auto-discovery enabled (default)\n')
      break
    }

    enabled = parseYesNo(input)
    if (enabled === null) {
      console.log('❌ Please answer yes or no\n')
    }
  }

  const triggers = enabled ? generateTriggerPhrases(operations) : []

  return {
    enabled,
    type: 'skill',
    suggested_triggers: triggers,
  }
}

/**
 * Q3: External Systems
 */
async function askExternalIntegration(rl) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 QUESTION 3 of 5: External Integrations')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Does this domain need to connect to external systems?\n')
  console.log('Examples:')
  console.log('  • Databases (store task data)')
  console.log('  • APIs (Notion, Jira, GitHub)')
  console.log('  • Cloud services (Firebase, Supabase)')
  console.log('  • File systems (read/write project files)\n')

  let needed = null

  while (needed === null) {
    const input = await askQuestion(rl, 'External integration needed? (yes/no/maybe): ')

    const normalized = input.toLowerCase().trim()
    if (['yes', 'y'].includes(normalized)) {
      needed = true
    } else if (['no', 'n'].includes(normalized)) {
      needed = false
    } else if (['maybe'].includes(normalized)) {
      needed = false // Treat "maybe" as no for now
    } else if (!input.trim()) {
      needed = false // Default to no
      console.log('✅ No external integration (default)\n')
      break
    } else {
      console.log('❌ Please answer yes, no, or maybe\n')
      continue
    }
  }

  let systems = []

  if (needed) {
    let valid = false
    while (!valid) {
      const input = await askQuestion(
        rl,
        'Which systems? (comma-separated, e.g., notion, firebase): ',
      )

      if (!input.trim()) {
        console.log('❌ Please specify at least one system\n')
        continue
      }

      systems = input
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name) => ({
          name: name.toLowerCase().replace(/\s+/g, '-'),
          type: 'api',
        }))

      console.log(`\n✅ Got ${systems.length} system(s):\n`)
      systems.forEach((sys) => {
        console.log(`  • ${sys.name}`)
      })

      const confirm = await askQuestion(rl, '\nLooks good? (yes/no): ')
      if (parseYesNo(confirm)) {
        valid = true
      } else {
        console.log("\nLet's try again.\n")
        systems = []
      }
    }
  }

  return {
    needed,
    type: 'mcp',
    systems,
  }
}

/**
 * Q4: Automation
 */
async function askAutomation(rl) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 QUESTION 4 of 5: Automation')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Should any operations run automatically?\n')
  console.log('Examples:')
  console.log('  • Pre-commit: Validate task is linked before commit')
  console.log('  • Post-checkout: Update local task cache')
  console.log('  • Pre-push: Check all tasks are complete\n')

  let enabled = null

  while (enabled === null) {
    const input = await askQuestion(rl, 'Need automation hooks? (yes/no): ')
    enabled = parseYesNo(input)
    if (enabled === null) {
      console.log('❌ Please answer yes or no\n')
    }
  }

  let hooks = []

  if (enabled) {
    console.log(`\nAvailable hook events: ${VALID_HOOK_EVENTS.join(', ')}\n`)

    let valid = false
    while (!valid) {
      const input = await askQuestion(rl, 'Which events? (comma-separated): ')

      if (!input.trim()) {
        console.log('❌ Please specify at least one event\n')
        continue
      }

      hooks = input
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0)
        .map((event) => ({
          event,
          action: `hook_${event.replace('-', '_')}`,
        }))

      console.log(`\n✅ Got ${hooks.length} hook(s):\n`)
      hooks.forEach((h) => {
        console.log(`  • ${h.event}`)
      })

      const confirm = await askQuestion(rl, '\nLooks good? (yes/no): ')
      if (parseYesNo(confirm)) {
        valid = true
      } else {
        console.log("\nLet's try again.\n")
        hooks = []
      }
    }
  }

  return {
    enabled,
    hooks,
  }
}

/**
 * Q5: Sharing Scope
 */
async function askSharingScope(rl) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 QUESTION 5 of 5: Sharing Scope')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Who will use this domain?\n')
  console.log('Options:')
  console.log('  • personal - Just you (local development)')
  console.log('  • team - Your team (shared repository)')
  console.log('  • community - Public (published to registry)\n')

  let scope = null

  while (scope === null) {
    const input = await askQuestion(
      rl,
      'Sharing scope? (personal/team/community) [default: personal]: ',
    )

    if (!input.trim()) {
      scope = 'personal'
      console.log('✅ Personal scope (default)\n')
      break
    }

    scope = parseSharingScope(input)
    if (scope === null) {
      console.log('❌ Please choose: personal, team, or community\n')
    }
  }

  let teamMembers = []

  if (scope === 'team') {
    let valid = false
    while (!valid) {
      const input = await askQuestion(rl, 'Team member emails? (comma-separated): ')

      if (!input.trim()) {
        console.log('⚠️  No team members specified. You can add them later.\n')
        valid = true
        break
      }

      teamMembers = input
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0)

      if (teamMembers.length > 0) {
        console.log(`\n✅ Got ${teamMembers.length} team member(s):\n`)
        teamMembers.forEach((email) => {
          console.log(`  • ${email}`)
        })

        const confirm = await askQuestion(rl, '\nLooks good? (yes/no): ')
        if (parseYesNo(confirm)) {
          valid = true
        } else {
          console.log("\nLet's try again.\n")
          teamMembers = []
        }
      } else {
        console.log('❌ Please provide at least one email\n')
      }
    }
  }

  return {
    scope,
    team_members: teamMembers,
    published: false,
  }
}

// ============================================================================
// DESIGN GENERATION
// ============================================================================

/**
 * Generate complete design specification
 */
function generateDesignSpec(domainName, description, answers) {
  const [operations, autoDiscovery, externalIntegration, automation, sharing] = answers

  const operationNames = operations.map((op) => op.name).join(', ')
  const displayName = formatDisplayName(domainName)

  const nextSteps = [
    `Run: /scaffold:domain ${domainName}`,
    'Customize generated command files',
    `Test commands locally: /${domainName}:{operation}`,
    'Add quality gates and tests when ready',
  ]

  if (sharing.scope === 'team') {
    nextSteps.push('Review with team if team scope')
  }

  const startWith = [`Create commands for: ${operationNames}`]

  if (autoDiscovery.enabled) {
    startWith.push('Add skill with trigger phrases for auto-discovery')
  }

  if (externalIntegration.needed && externalIntegration.systems.length > 0) {
    startWith.push('Create MCP stub(s) for external system connection')
  }

  if (automation.enabled && automation.hooks.length > 0) {
    startWith.push('Add hook script(s) for automated tasks')
  }

  startWith.push('Create README.md for documentation')

  return {
    created_at: new Date().toISOString(),
    description,
    design: {
      auto_discovery: autoDiscovery,
      automation,
      external_integration: externalIntegration,
      operations,
      recommendations: {
        next_steps: nextSteps,
        start_with: startWith,
      },
      sharing,
    },
    name: domainName,
    version: '1.0.0',
  }
}

/**
 * Save design to file
 */
function saveDesign(domainName, designSpec) {
  ensureDesignDir()

  const filePath = path.join(DESIGN_DIR, `${domainName}.json`)
  fs.writeFileSync(filePath, JSON.stringify(designSpec, null, 2) + '\n')

  return filePath
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

/**
 * Display completion summary
 */
function showCompletionSummary(domainName, designSpec, filePath) {
  const displayName = formatDisplayName(domainName)
  const { operations, auto_discovery, external_integration, automation, sharing } =
    designSpec.design

  console.log('\n✅ Design complete!\n')
  console.log('📄 Design specification saved to:')
  console.log(`   ${filePath}\n`)

  console.log(`📦 Your ${displayName} domain includes:`)
  console.log(`   • ${operations.length} operations: ${operations.map((op) => op.name).join(', ')}`)

  if (auto_discovery.enabled) {
    console.log('   • Auto-discovery skill with trigger phrases')
  }

  if (external_integration.needed && external_integration.systems.length > 0) {
    console.log(`   • MCP integration stub(s)`)
  }

  if (automation.enabled && automation.hooks.length > 0) {
    console.log('   • Automation hooks')
  }

  console.log(`   • ${sharing.scope} sharing scope`)

  console.log('\n🎯 Next steps:\n')
  console.log('   1. Review the design:')
  console.log(`      cat ${filePath}\n`)

  console.log('   2. Generate files:')
  console.log(`      /scaffold:domain ${domainName}\n`)

  console.log('   3. Customize and test\n')

  console.log('Need to make changes? Run this command again to redesign.\n')
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  // Parse arguments
  const args = process.argv.slice(2)
  const domainName = args[0]
  const description = args.slice(1).join(' ') || `${domainName} domain`

  // Validate domain name
  const validation = validateDomainName(domainName)
  if (!validation.valid) {
    console.error(`\n❌ ${validation.error}\n`)
    process.exit(1)
  }

  // Check for existing design
  if (designExists(domainName)) {
    console.error(`\n⚠️  Design for "${domainName}" already exists at:`)
    console.error(`   ${DESIGN_DIR}/${domainName}.json\n`)
    console.error('Options:')
    console.error(`  • View existing: cat ${DESIGN_DIR}/${domainName}.json`)
    console.error(`  • Delete and redesign: rm ${DESIGN_DIR}/${domainName}.json`)
    console.error(`  • Choose different name: /design:domain ${domainName}-v2\n`)
    process.exit(1)
  }

  // Show introduction
  const displayName = formatDisplayName(domainName)
  console.log('\n✨ Let\'s design the "' + displayName + '" domain together!\n')
  console.log('📝 ' + description + '\n')
  console.log("I'll ask you 5 questions to create a complete design specification.")
  console.log("You can be detailed or brief - I'll help refine your ideas.\n")
  console.log("Let's begin!")

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false, // Important for piped input
  })

  try {
    // Ask all questions
    const operations = await askOperations(rl, domainName)
    const autoDiscovery = await askAutoDiscovery(rl, operations)
    const externalIntegration = await askExternalIntegration(rl)
    const automation = await askAutomation(rl)
    const sharing = await askSharingScope(rl)

    // Generate design spec
    const designSpec = generateDesignSpec(domainName, description, [
      operations,
      autoDiscovery,
      externalIntegration,
      automation,
      sharing,
    ])

    // Save to file
    const filePath = saveDesign(domainName, designSpec)

    // Show completion summary
    showCompletionSummary(domainName, designSpec, filePath)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n')
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run main
main()
