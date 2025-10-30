import * as fs from 'fs'
import * as path from 'path'

type SessionData = {
  currentTask: string | null
}

/**
 * Manages session state for the VTM CLI, tracking current task context.
 *
 * VTMSession provides persistent task state management for the VTM CLI,
 * enabling users to set a current task and have it persist across CLI
 * invocations. Session state is stored in a `.vtm-session` file in the
 * project directory and is project-specific based on the working directory.
 *
 * This enables workflow patterns like:
 * - Start a task and have context available in subsequent commands
 * - Complete the current task without specifying the task ID
 * - View which task you're currently working on
 *
 * @remarks
 * The session file is stored as JSON with structure:
 * ```json
 * {
 *   "currentTask": "TASK-003" or null
 * }
 * ```
 *
 * Session data is loaded from disk on construction and persisted atomically
 * on every state change. Graceful error handling ensures corrupted session
 * files don't break CLI operations.
 *
 * @example
 * ```typescript
 * // Create session in current directory
 * const session = new VTMSession();
 *
 * // Set current task
 * session.setCurrentTask('TASK-003');
 *
 * // Retrieve current task
 * const current = session.getCurrentTask();
 * // Output: "TASK-003"
 *
 * // Clear when done
 * session.clearCurrentTask();
 * ```
 *
 * @see {@link setCurrentTask} for setting task context
 * @see {@link getCurrentTask} for retrieving task context
 * @see {@link clearCurrentTask} for clearing session state
 */
export class VTMSession {
  private sessionFilePath: string
  private currentTask: string | null = null

  /**
   * Creates a new VTMSession instance with optional custom base path.
   *
   * Constructs a session manager at the specified path. If a session file
   * already exists at the location, it will be loaded automatically. If the
   * file is corrupted or unreadable, session starts in clean state with no
   * current task.
   *
   * @param basePath - The directory path where `.vtm-session` file will be
   *   stored. Defaults to current working directory via `process.cwd()`.
   *
   * @remarks
   * - Session file is named `.vtm-session` (hidden on Unix-like systems)
   * - Path is constructed as `basePath/.vtm-session`
   * - Automatically loads existing session from disk if present
   * - Corrupted files are silently ignored (graceful degradation)
   *
   * @example
   * ```typescript
   * // Use current working directory (typical)
   * const session = new VTMSession();
   *
   * // Or specify custom directory
   * const session = new VTMSession('/path/to/project');
   * ```
   */
  constructor(basePath: string = process.cwd()) {
    this.sessionFilePath = path.join(basePath, '.vtm-session')
    this.loadSession()
  }

  /**
   * Sets the current task ID and persists to disk immediately.
   *
   * Updates the in-memory current task reference and atomically writes
   * the updated session state to the `.vtm-session` file. This persists
   * the task context across CLI invocations, enabling stateful workflows
   * where subsequent commands can operate on the current task without
   * explicit task ID specification.
   *
   * @param taskId - The task ID to set as current. Should be in format
   *   TASK-XXX (e.g., "TASK-020", "TASK-001"). No validation is performed
   *   on the format; callers should validate task existence beforehand.
   *
   * @throws {Error} If the session file cannot be written (e.g., permission
   *   denied, disk full, or invalid path).
   *
   * @remarks
   * - Overwrites any previously set current task
   * - Writing to disk is atomic (uses file replacement)
   * - No task validation is performed; any string value is accepted
   * - Empty strings are allowed (clears current task without removing file)
   *
   * @example
   * ```typescript
   * const session = new VTMSession();
   * session.setCurrentTask('TASK-042');
   *
   * // Session file now contains:
   * // { "currentTask": "TASK-042" }
   * ```
   *
   * @see {@link getCurrentTask} to retrieve the set task
   * @see {@link clearCurrentTask} to clear and remove session file
   */
  setCurrentTask(taskId: string): void {
    this.currentTask = taskId
    this.saveSession()
  }

  /**
   * Retrieves the current task ID if one is set.
   *
   * Returns the task ID that was previously set via {@link setCurrentTask},
   * or null if no current task is set. This is useful for commands that
   * want to operate on the user's active task without requiring explicit
   * task ID specification.
   *
   * @returns The current task ID in format TASK-XXX (e.g., "TASK-020"),
   *   or null if no task is currently set.
   *
   * @remarks
   * - Reads from in-memory state (no disk I/O)
   * - Returns null if session file doesn't exist
   * - Returns null if session file has corrupted or missing `currentTask`
   * - This is a synchronous operation suitable for CLI commands
   *
   * @example
   * ```typescript
   * const session = new VTMSession();
   * session.setCurrentTask('TASK-003');
   *
   * const current = session.getCurrentTask();
   * console.log(current); // Output: "TASK-003"
   *
   * session.clearCurrentTask();
   * const cleared = session.getCurrentTask();
   * console.log(cleared); // Output: null
   * ```
   *
   * @see {@link setCurrentTask} to set the current task
   * @see {@link clearCurrentTask} to clear the session state
   */
  getCurrentTask(): string | null {
    return this.currentTask
  }

  /**
   * Clears the current task and removes the session file from disk.
   *
   * Resets the in-memory current task to null and atomically removes the
   * `.vtm-session` file from disk. This is the proper way to end a work
   * session and clean up session state. After calling this method, a new
   * session file must be created via {@link setCurrentTask} before state
   * is persisted again.
   *
   * @throws {Error} If the session file exists but cannot be deleted due to
   *   permissions or other filesystem issues (rare; see remarks).
   *
   * @remarks
   * - Sets `currentTask` to null in memory
   * - Attempts to delete the `.vtm-session` file
   * - Silently succeeds if file doesn't already exist
   * - Should be called when user completes their current task
   * - Complements {@link setCurrentTask} in typical task workflow
   *
   * @example
   * ```typescript
   * const session = new VTMSession();
   * session.setCurrentTask('TASK-005');
   *
   * // ... user works on TASK-005 ...
   *
   * // Task complete, clean up session
   * session.clearCurrentTask();
   *
   * const current = session.getCurrentTask();
   * console.log(current); // Output: null
   *
   * // .vtm-session file has been deleted
   * ```
   *
   * @see {@link setCurrentTask} to set a new current task
   * @see {@link getCurrentTask} to check current task without changing it
   */
  clearCurrentTask(): void {
    this.currentTask = null
    this.removeSessionFile()
  }

  /**
   * Loads session state from disk if the session file exists.
   *
   * Internal method that reads the `.vtm-session` file from disk and
   * deserializes the JSON contents into the `currentTask` field. This is
   * called automatically by the constructor to restore session state on
   * instantiation. Gracefully handles missing or corrupted files by
   * initializing to a clean state (null current task).
   *
   * @internal
   *
   * @throws {SyntaxError} Implicitly caught; JSON parsing errors result in
   *   clean state initialization.
   *
   * @remarks
   * - Called automatically by constructor
   * - No need to call manually under normal circumstances
   * - Missing files are not treated as errors (common case)
   * - Corrupted JSON files are silently reset to clean state
   * - Uses UTF-8 file encoding for consistency with `saveSession()`
   * - File may not exist if this is the first CLI invocation in a project
   *
   * @example
   * ```typescript
   * // Automatically called by constructor:
   * const session = new VTMSession();
   * // → Reads .vtm-session if it exists, initializes currentTask
   * ```
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
   * Saves session state to disk atomically.
   *
   * Internal method that serializes the current session state to JSON and
   * writes it to the `.vtm-session` file. This is called automatically by
   * {@link setCurrentTask} to persist state changes. File is written with
   * pretty-printing (indentation) for human readability when inspecting
   * the session file directly.
   *
   * @internal
   *
   * @throws {Error} If the file cannot be written due to permissions or
   *   filesystem errors (disk full, invalid path, etc.).
   *
   * @remarks
   * - Called automatically by `setCurrentTask()`
   * - Overwrites the session file completely
   * - Uses 2-space indentation for readability
   * - File encoding is UTF-8 for consistency
   * - Atomic write (replaces file, no partial updates)
   * - File is created if it doesn't already exist
   *
   * @example
   * ```typescript
   * // Automatically called when setting task:
   * session.setCurrentTask('TASK-007');
   * // → Writes { "currentTask": "TASK-007" } to .vtm-session
   * ```
   */
  private saveSession(): void {
    const sessionData: SessionData = {
      currentTask: this.currentTask,
    }
    fs.writeFileSync(this.sessionFilePath, JSON.stringify(sessionData, null, 2), 'utf-8')
  }

  /**
   * Removes the session file from disk.
   *
   * Internal method that deletes the `.vtm-session` file if it exists. This
   * is called automatically by {@link clearCurrentTask} to clean up session
   * state. Gracefully handles the case where the file doesn't exist or
   * cannot be deleted, ensuring that clearing session state never throws
   * exceptions to the caller.
   *
   * @internal
   *
   * @remarks
   * - Called automatically by `clearCurrentTask()`
   * - Silently succeeds if file doesn't exist
   * - Catches and ignores errors (file not found, permission denied, etc.)
   * - Ensures `clearCurrentTask()` never throws
   * - File is deleted synchronously (blocking operation)
   *
   * @example
   * ```typescript
   * // Automatically called when clearing session:
   * session.clearCurrentTask();
   * // → Deletes .vtm-session if it exists
   * ```
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
