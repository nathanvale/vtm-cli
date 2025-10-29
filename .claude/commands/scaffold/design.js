#!/usr/bin/env node

/**
 * /design:domain - Interactive Questionnaire Implementation
 *
 * Guides users through a 5-question design process to create a domain specification.
 * Generated design specs are saved to: .claude/designs/{domain}.json
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper function to prompt user with question
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim())
    })
  })
}

// Helper to validate domain name (alphanumeric + hyphens only)
function validateDomainName(name) {
  if (!/^[a-z0-9-]+$/.test(name)) {
    return false
  }
  if (name.length < 2 || name.length > 50) {
    return false
  }
  return true
}

// Helper to parse comma-separated list
function parseList(input) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

// Generate suggested trigger phrases based on operations
function generateTriggerPhrases(operations) {
  const triggers = new Set()

  operations.forEach((op) => {
    const opName = op.name.replace(/-/g, ' ')
    triggers.add(`${opName}`)
    triggers.add(`what should i ${opName.slice(0, 3)}`)
    triggers.add(`${op.description.split(' ')[0].toLowerCase()} ${opName}`)
  })

  // Add common PM-related triggers if operations suggest it
  const opNames = operations.map((o) => o.name.toLowerCase())

  if (opNames.some((n) => n.includes('next') || n.includes('task'))) {
    triggers.add('what should i work on')
    triggers.add('next task')
    triggers.add('show my tasks')
  }

  if (opNames.some((n) => n.includes('status') || n.includes('review') || n.includes('progress'))) {
    triggers.add('status')
    triggers.add('progress')
    triggers.add('show progress')
  }

  if (opNames.some((n) => n.includes('context'))) {
    triggers.add('context')
    triggers.add('what is the context')
  }

  return Array.from(triggers).slice(0, 8) // Limit to 8 suggestions
}

// Main questionnaire flow
async function runDesignQuestionnaire() {
  console.log('\n' + '='.repeat(60))
  console.log('🎯 Claude Code Domain Designer - Interactive Questionnaire')
  console.log('='.repeat(60))

  // Get domain name and description from command line or prompt
  const args = process.argv.slice(2)
  let domainName = args[0]
  let domainDescription = args.slice(1).join(' ')

  // Validate domain name
  if (!domainName) {
    console.log("\n📋 Let's create a new Claude Code domain.\n")
    domainName = await question('Domain name (alphanumeric + hyphens): ')
  }

  if (!validateDomainName(domainName)) {
    console.error('\n❌ Invalid domain name. Use only lowercase letters, numbers, and hyphens.')
    rl.close()
    process.exit(1)
  }

  // Check if design already exists
  const designsDir = path.join(process.cwd(), '.claude', 'designs')
  const designFile = path.join(designsDir, `${domainName}.json`)

  if (fs.existsSync(designFile)) {
    console.error(`\n❌ Domain "${domainName}" already exists at ${designFile}`)
    rl.close()
    process.exit(1)
  }

  if (!domainDescription) {
    domainDescription = await question('Domain description (optional): ')
  }

  console.log(`\n✅ Designing "${domainName}" domain`)
  console.log("📝 Let's work through what your domain should include.\n")

  // Question 1: Operations
  console.log('─'.repeat(60))
  console.log('Question 1/5: CORE OPERATIONS')
  console.log('─'.repeat(60))
  console.log('What core operations does your domain need?')
  console.log('\nExamples:')
  console.log('  • Getting the next task to work on')
  console.log('  • Reviewing progress/status')
  console.log('  • Getting context for current work')
  console.log('  • Listing all items')
  console.log('  • Creating new items')
  console.log('  • Updating status\n')

  const operationsInput = await question(
    'List operations (comma-separated, e.g., "next, review, context"): ',
  )
  const operationNames = parseList(operationsInput)

  if (operationNames.length === 0) {
    console.error('❌ At least one operation is required.')
    rl.close()
    process.exit(1)
  }

  // Create operation objects
  const operations = operationNames.map((name) => ({
    name: name.toLowerCase().replace(/\s+/g, '-'),
    description: `${name} for ${domainName} domain`,
    triggers_auto_discovery: true,
    manual_invocation: `/${domainName}:${name.toLowerCase().replace(/\s+/g, '-')}`,
  }))

  // Question 2: Auto-Discovery
  console.log('\n' + '─'.repeat(60))
  console.log('Question 2/5: AUTO-DISCOVERY (Skills)')
  console.log('─'.repeat(60))
  console.log('Should Claude auto-suggest these commands?')
  console.log('\nExamples:')
  console.log('  Manual:  User types /pm:next')
  console.log('  Auto:    User says "what should I work on?" → Claude suggests /pm:next\n')

  const autoDiscoveryInput = await question('Enable auto-discovery? (yes/no): ')
  const autoDiscoveryEnabled = /^(yes|y)$/i.test(autoDiscoveryInput)

  let suggestedTriggers = []
  if (autoDiscoveryEnabled) {
    console.log('\nGenerating suggested trigger phrases...')
    suggestedTriggers = generateTriggerPhrases(operations)
    console.log('Suggestions: ' + suggestedTriggers.join(', '))

    const customTriggersInput = await question(
      'Add custom trigger phrases? (comma-separated, optional): ',
    )
    const customTriggers = parseList(customTriggersInput)
    if (customTriggers.length > 0) {
      suggestedTriggers = [...suggestedTriggers, ...customTriggers].slice(0, 10)
    }
  }

  // Question 3: External Systems
  console.log('\n' + '─'.repeat(60))
  console.log('Question 3/5: EXTERNAL SYSTEMS (MCP Integration)')
  console.log('─'.repeat(60))
  console.log('Does your domain need to connect to external systems?')
  console.log('\nExamples:')
  console.log('  • Database (local, Notion, Airtable)')
  console.log('  • API (Jira, GitHub, Slack)')
  console.log('  • Cloud service (AWS, Azure, Google Cloud)\n')

  const externalInput = await question('Need external integration? (yes/no/maybe): ')
  const externalNeeded = /^(yes|y)$/.test(externalInput)
  const externalMaybe = /^(maybe|m)$/.test(externalInput)

  let systems = []
  if (externalNeeded || externalMaybe) {
    const systemsInput = await question('List external systems (comma-separated, optional): ')
    const systemNames = parseList(systemsInput)

    systems = systemNames.map((name) => ({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      type: 'api', // Default type, could ask for specifics
    }))
  }

  // Question 4: Automation
  console.log('\n' + '─'.repeat(60))
  console.log('Question 4/5: AUTOMATION (Hooks & Events)')
  console.log('─'.repeat(60))
  console.log('Should some operations run automatically?')
  console.log('\nExamples:')
  console.log('  • Pre-commit:  Validate task status before committing')
  console.log('  • Scheduled:   Daily standup digest')
  console.log('  • Triggered:   On task completion, update metrics\n')

  const automationInput = await question('Need automation? (yes/no): ')
  const automationEnabled = /^(yes|y)$/i.test(automationInput)

  let hooks = []
  if (automationEnabled) {
    console.log('\nCommon hook events: pre-commit, post-commit, scheduled, on-complete')
    const hooksInput = await question(
      'List hooks (comma-separated, optional, e.g., "pre-commit"): ',
    )
    const hookNames = parseList(hooksInput)

    hooks = hookNames.map((name) => ({
      event: name.toLowerCase().replace(/\s+/g, '-'),
      action: `${domainName}_${name.toLowerCase().replace(/\s+/g, '_')}`,
    }))
  }

  // Question 5: Sharing
  console.log('\n' + '─'.repeat(60))
  console.log('Question 5/5: SHARING SCOPE')
  console.log('─'.repeat(60))
  console.log('Who will use this domain?')
  console.log('\nOptions:')
  console.log('  • personal  - Just me (local only)')
  console.log('  • team      - My team (shared repository)')
  console.log('  • community - Public registry\n')

  let sharingScope = 'personal'
  while (true) {
    const sharingInput = await question('Sharing scope (personal/team/community): ')
    if (/^(personal|team|community)$/i.test(sharingInput)) {
      sharingScope = sharingInput.toLowerCase()
      break
    }
    console.log('Please enter: personal, team, or community')
  }

  let teamMembers = []
  if (sharingScope === 'team') {
    const membersInput = await question('Team member emails (comma-separated, optional): ')
    teamMembers = parseList(membersInput)
  }

  // Build design spec
  const design = {
    name: domainName,
    description: domainDescription || `${domainName} domain`,
    version: '1.0.0',
    created_at: new Date().toISOString(),
    design: {
      operations,
      auto_discovery: {
        enabled: autoDiscoveryEnabled,
        type: autoDiscoveryEnabled ? 'skill' : 'none',
        suggested_triggers: suggestedTriggers,
      },
      external_integration: {
        needed: externalNeeded || externalMaybe,
        type: externalNeeded || externalMaybe ? 'mcp' : 'none',
        systems,
      },
      automation: {
        enabled: automationEnabled,
        hooks,
      },
      sharing: {
        scope: sharingScope,
        ...(teamMembers.length > 0 && { team_members: teamMembers }),
      },
      recommendations: generateRecommendations(domainName, operations, {
        autoDiscovery: autoDiscoveryEnabled,
        external: externalNeeded || externalMaybe,
        automation: automationEnabled,
        sharing: sharingScope,
      }),
    },
  }

  // Create designs directory if needed
  if (!fs.existsSync(designsDir)) {
    fs.mkdirSync(designsDir, { recursive: true })
  }

  // Save design spec
  fs.writeFileSync(designFile, JSON.stringify(design, null, 2), 'utf-8')

  // Display completion summary
  console.log('\n' + '='.repeat(60))
  console.log('✅ Design Complete!')
  console.log('='.repeat(60))
  console.log(`\n📄 Design saved to: .claude/designs/${domainName}.json`)
  console.log('\nYour design includes:')
  console.log(`  • ${operations.length} operation(s): ${operations.map((o) => o.name).join(', ')}`)
  if (autoDiscoveryEnabled) {
    console.log(`  • Auto-discovery skill with ${suggestedTriggers.length} trigger phrases`)
  }
  if (externalNeeded || externalMaybe) {
    console.log(
      `  • ${systems.length} external system(s): ${systems.map((s) => s.name).join(', ')}`,
    )
  }
  if (automationEnabled) {
    console.log(`  • ${hooks.length} automation hook(s): ${hooks.map((h) => h.event).join(', ')}`)
  }
  console.log(`  • ${sharingScope} sharing configuration`)

  console.log('\n📋 Recommended Next Steps:')
  design.design.recommendations.next_steps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`)
  })

  console.log('\n💡 View your design:')
  console.log(`   cat .claude/designs/${domainName}.json`)

  rl.close()
}

// Generate recommendations based on design choices
function generateRecommendations(domainName, operations, flags) {
  const operationNames = operations.map((o) => o.name)
  const recommendedOps = operationNames.slice(0, 3).join(', ')

  const startWith = [`Create commands for: ${recommendedOps}`]

  if (flags.autoDiscovery) {
    startWith.push('Add skill with trigger phrases for auto-discovery')
  }

  if (flags.external) {
    startWith.push('Create MCP stub(s) for external system connection')
  }

  if (flags.automation) {
    startWith.push('Add hook script(s) for automated tasks')
  }

  startWith.push('Create README.md for team documentation')

  const nextSteps = [
    `Run: /scaffold:domain ${domainName}`,
    'Customize generated command files',
    'Test commands locally: /' + domainName + ':' + operationNames[0],
    'Add quality gates and tests when ready',
    `Review with team if ${flags.sharing !== 'personal'}`,
  ]

  return {
    start_with: startWith.slice(0, 5),
    next_steps: nextSteps,
  }
}

// Run the questionnaire
runDesignQuestionnaire().catch((error) => {
  console.error('Error:', error.message)
  rl.close()
  process.exit(1)
})
