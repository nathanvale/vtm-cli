/**
 * Library exports test
 * Verifies that all library exports are correctly exposed
 */

import { describe, it, expect } from 'vitest'
import { DecisionEngine, VTMHistory } from '../index'

describe('Library Exports', () => {
  describe('DecisionEngine', () => {
    it('should export DecisionEngine class', () => {
      expect(DecisionEngine).toBeDefined()
      expect(typeof DecisionEngine).toBe('function')
    })

    it('should be instantiable', () => {
      const engine = new DecisionEngine()
      expect(engine).toBeInstanceOf(DecisionEngine)
    })

    it('should have expected public methods', () => {
      const engine = new DecisionEngine()
      expect(typeof engine.recommendArchitecture).toBe('function')
      expect(typeof engine.analyzeDomain).toBe('function')
      expect(typeof engine.suggestRefactoring).toBe('function')
      expect(typeof engine.getPatterns).toBe('function')
    })

    it('should work with TypeScript types', () => {
      const engine = new DecisionEngine({
        basePath: '/test/path',
        verbose: false,
      })
      expect(engine).toBeInstanceOf(DecisionEngine)
    })
  })

  describe('VTMHistory', () => {
    it('should export VTMHistory class', () => {
      expect(VTMHistory).toBeDefined()
      expect(typeof VTMHistory).toBe('function')
    })

    it('should be instantiable with path', () => {
      const history = new VTMHistory('test-vtm.json')
      expect(history).toBeInstanceOf(VTMHistory)
    })
  })
})
