import * as fs from 'fs'
import * as path from 'path'

type SessionData = {
  currentTask: string | null
}

/**
 * VTMSession manages session state for the VTM CLI.
 * Tracks the current task a user is working on and persists state to disk.
 * Session state is project-specific based on the working directory.
 */
export class VTMSession {
  private sessionFilePath: string
  private currentTask: string | null = null

  /**
   * Creates a new VTMSession instance.
   * @param basePath - The directory path where .vtm-session file will be stored.
   *                   Defaults to current working directory.
   */
  constructor(basePath: string = process.cwd()) {
    this.sessionFilePath = path.join(basePath, '.vtm-session')
    this.loadSession()
  }

  /**
   * Sets the current task ID and persists to disk.
   * @param taskId - The task ID to set as current (e.g., "TASK-020")
   */
  setCurrentTask(taskId: string): void {
    this.currentTask = taskId
    this.saveSession()
  }

  /**
   * Gets the current task ID.
   * @returns The current task ID or null if no task is set
   */
  getCurrentTask(): string | null {
    return this.currentTask
  }

  /**
   * Clears the current task and removes the session file.
   */
  clearCurrentTask(): void {
    this.currentTask = null
    this.removeSessionFile()
  }

  /**
   * Loads session state from disk if the session file exists.
   */
  private loadSession(): void {
    try {
      if (fs.existsSync(this.sessionFilePath)) {
        const fileContent = fs.readFileSync(this.sessionFilePath, 'utf-8')
        const sessionData: SessionData = JSON.parse(fileContent)
        this.currentTask = sessionData.currentTask
      }
    } catch {
      // If file is corrupted or can't be read, start with clean state
      this.currentTask = null
    }
  }

  /**
   * Saves session state to disk.
   */
  private saveSession(): void {
    const sessionData: SessionData = {
      currentTask: this.currentTask,
    }
    fs.writeFileSync(this.sessionFilePath, JSON.stringify(sessionData, null, 2), 'utf-8')
  }

  /**
   * Removes the session file from disk.
   */
  private removeSessionFile(): void {
    try {
      if (fs.existsSync(this.sessionFilePath)) {
        fs.unlinkSync(this.sessionFilePath)
      }
    } catch {
      // Silently handle error if file doesn't exist or can't be removed
    }
  }
}
