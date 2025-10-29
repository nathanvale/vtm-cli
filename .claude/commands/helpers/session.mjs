#!/usr/bin/env node
/**
 * Helper script for VTMSession operations from bash commands
 * Usage:
 *   node session.mjs get          # Get current task ID
 *   node session.mjs set TASK-XXX # Set current task
 *   node session.mjs clear        # Clear current task
 */

import { VTMSession } from '../../../dist/lib/vtm-session.js'

const [, , command, ...args] = process.argv

const session = new VTMSession()

switch (command) {
  case 'get': {
    const currentTask = session.getCurrentTask()
    if (currentTask) {
      console.log(currentTask)
      process.exit(0)
    } else {
      process.exit(1)
    }
    break
  }

  case 'set': {
    const taskId = args[0]
    if (!taskId) {
      console.error('Error: Task ID required')
      process.exit(1)
    }
    session.setCurrentTask(taskId)
    process.exit(0)
    break
  }

  case 'clear': {
    session.clearCurrentTask()
    process.exit(0)
    break
  }

  default:
    console.error('Usage: node session.mjs {get|set|clear} [task-id]')
    process.exit(1)
}
