import * as fs from 'fs'
import * as path from 'path'
import { VTMSession } from '../vtm-session'

describe('VTMSession', () => {
  let testDir: string
  let sessionFilePath: string

  beforeEach(() => {
    // Create a temporary test directory
    testDir = path.join(__dirname, '.test-session')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
    sessionFilePath = path.join(testDir, '.vtm-session')
  })

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(sessionFilePath)) {
      fs.unlinkSync(sessionFilePath)
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir)
    }
  })

  describe('AC1: VTMSession class created', () => {
    it('should create a VTMSession instance', () => {
      const session = new VTMSession(testDir)
      expect(session).toBeInstanceOf(VTMSession)
    })
  })

  describe('AC2: Can set and get current task ID', () => {
    it('should set and get current task ID', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-020')
      const currentTask = session.getCurrentTask()
      expect(currentTask).toBe('TASK-020')
    })

    it('should return null when no task is set', () => {
      const session = new VTMSession(testDir)
      const currentTask = session.getCurrentTask()
      expect(currentTask).toBeNull()
    })

    it('should update current task when set multiple times', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-001')
      session.setCurrentTask('TASK-002')
      const currentTask = session.getCurrentTask()
      expect(currentTask).toBe('TASK-002')
    })
  })

  describe('AC3: State persists to .vtm-session file', () => {
    it('should create .vtm-session file when setting task', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-020')
      expect(fs.existsSync(sessionFilePath)).toBe(true)
    })

    it('should persist task ID to file', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-020')

      const fileContent = fs.readFileSync(sessionFilePath, 'utf-8')
      const sessionData = JSON.parse(fileContent)
      expect(sessionData.currentTask).toBe('TASK-020')
    })

    it('should load persisted state on new instance', () => {
      const session1 = new VTMSession(testDir)
      session1.setCurrentTask('TASK-020')

      const session2 = new VTMSession(testDir)
      const currentTask = session2.getCurrentTask()
      expect(currentTask).toBe('TASK-020')
    })

    it('should update file when task changes', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-001')
      session.setCurrentTask('TASK-002')

      const fileContent = fs.readFileSync(sessionFilePath, 'utf-8')
      const sessionData = JSON.parse(fileContent)
      expect(sessionData.currentTask).toBe('TASK-002')
    })
  })

  describe('AC4: Can clear current task when completed', () => {
    it('should clear current task', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-020')
      session.clearCurrentTask()
      const currentTask = session.getCurrentTask()
      expect(currentTask).toBeNull()
    })

    it('should remove .vtm-session file when cleared', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-020')
      expect(fs.existsSync(sessionFilePath)).toBe(true)

      session.clearCurrentTask()
      expect(fs.existsSync(sessionFilePath)).toBe(false)
    })

    it('should handle clearing when no task is set', () => {
      const session = new VTMSession(testDir)
      expect(() => session.clearCurrentTask()).not.toThrow()
      expect(session.getCurrentTask()).toBeNull()
    })
  })

  describe('AC5: Session state is project-specific', () => {
    it('should use provided directory path', () => {
      const session = new VTMSession(testDir)
      session.setCurrentTask('TASK-020')

      const expectedPath = path.join(testDir, '.vtm-session')
      expect(fs.existsSync(expectedPath)).toBe(true)
    })

    it('should default to current working directory when no path provided', () => {
      const session = new VTMSession()
      const expectedPath = path.join(process.cwd(), '.vtm-session')

      session.setCurrentTask('TASK-020')
      expect(fs.existsSync(expectedPath)).toBe(true)

      // Cleanup
      session.clearCurrentTask()
    })

    it('should isolate sessions in different directories', () => {
      const testDir2 = path.join(__dirname, '.test-session-2')
      if (!fs.existsSync(testDir2)) {
        fs.mkdirSync(testDir2, { recursive: true })
      }

      const session1 = new VTMSession(testDir)
      const session2 = new VTMSession(testDir2)

      session1.setCurrentTask('TASK-001')
      session2.setCurrentTask('TASK-002')

      expect(session1.getCurrentTask()).toBe('TASK-001')
      expect(session2.getCurrentTask()).toBe('TASK-002')

      // Cleanup
      session2.clearCurrentTask()
      fs.rmdirSync(testDir2)
    })
  })
})
