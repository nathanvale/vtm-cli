// src/commands/plan-validate.ts
/* eslint-disable no-console */

import { validateAdrSpecPair, type ValidationReport } from '../lib/adr-spec-validator'
import * as fs from 'fs'
import * as path from 'path'

export async function validateCommand(args: string[]): Promise<void> {
  // Parse arguments
  const adrPath = args[0]
  const specPath = args[1]
  const strict = args.includes('--strict')

  // Validate arguments
  if (!adrPath || !specPath) {
    console.error('❌ Error: Both ADR file and Spec file required')
    console.error('Usage: /plan:validate <adr-file> <spec-file> [--strict]')
    console.error('Example: /plan:validate adr/ADR-001-auth.md specs/spec-auth.md')
    process.exit(1)
  }

  // Check files exist
  if (!fs.existsSync(adrPath)) {
    console.error(`❌ Error: ADR file not found: ${adrPath}`)
    process.exit(1)
  }

  if (!fs.existsSync(specPath)) {
    console.error(`❌ Error: Spec file not found: ${specPath}`)
    process.exit(1)
  }

  // Display validation start
  const adrBasename = path.basename(adrPath)
  const specBasename = path.basename(specPath)
  console.info(`🔍 Validating: ${adrBasename} + ${specBasename}\n`)

  // Show progress
  console.info('📋 Checking ADR structure...')
  console.info('📋 Checking Spec structure...')
  console.info('🔍 Checking for common issues...\n')

  // Run validation
  const report = await validateAdrSpecPair(adrPath, specPath, { strict })

  // Get file stats
  const adrContent = fs.readFileSync(adrPath, 'utf-8')
  const specContent = fs.readFileSync(specPath, 'utf-8')
  const adrLines = adrContent.split('\n').length
  const specLines = specContent.split('\n').length

  // Display results
  displayReport(report, adrPath, specPath, adrBasename, specBasename, adrLines, specLines)

  // Exit with appropriate code
  if (report.valid) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

function displayReport(
  report: ValidationReport,
  adrPath: string,
  specPath: string,
  adrBasename: string,
  specBasename: string,
  adrLines: number,
  specLines: number,
): void {
  console.log('════════════════════════════════════════════════════════════════')

  if (report.valid && report.warnings.length === 0) {
    // Success case: no errors, no warnings
    console.log('✅ VALIDATION PASSED\n')
    console.log(`ADR:  ${adrBasename} (${adrLines} lines)`)
    console.log(`Spec: ${specBasename} (${specLines} lines)\n`)
    console.log('✅ Structure is valid')
    console.log('✅ Pairing is correct')
    console.log('✅ Content quality is good\n')
    console.log('📋 Summary:')
    console.log(`  • ADR has ${report.qualityValidation.alternativeCount} alternatives`)
    console.log(`  • Spec includes ${report.qualityValidation.codeExampleCount} code examples\n`)
    console.log('🚀 Ready to convert to VTM tasks:')
    console.log(`   /plan:to-vtm "${adrPath}" "${specPath}" --commit`)
  } else if (report.valid && report.warnings.length > 0) {
    // Warning case: no errors, but has warnings
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS\n')
    console.log('Warnings:')
    report.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`)
    })
    console.log('\n════════════════════════════════════════════════════════════════\n')
    console.log('⚠️  Warnings above should be addressed before production use.')
    console.log('Run with --strict flag to enforce all requirements:')
    console.log(`   /plan:validate "${adrPath}" "${specPath}" --strict\n`)
    console.log('You can still proceed to VTM, but review warnings first.')
  } else {
    // Error case: has errors
    console.log('❌ VALIDATION FAILED\n')
    console.log('Errors found:')
    report.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`)
    })

    if (report.warnings.length > 0) {
      console.log('\nWarnings:')
      report.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`)
      })
    }

    console.log('\n════════════════════════════════════════════════════════════════\n')
    console.log('💡 How to fix:')
    console.log(`1. Open: ${adrPath}`)
    console.log('2. Check for missing sections or incomplete content')
    console.log('3. Add clear decision statement and alternatives')
    console.log(`4. Then validate again: /plan:validate "${adrPath}" "${specPath}"`)
  }

  console.log('')
}
