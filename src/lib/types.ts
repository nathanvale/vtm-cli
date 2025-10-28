// src/lib/types.ts

export type VTM = {
  version: string;
  project: {
    name: string;
    description: string;
  };
  stats: VTMStats;
  tasks: Task[];
}

export type VTMStats = {
  total_tasks: number;
  completed: number;
  in_progress: number;
  pending: number;
  blocked: number;
}

export type Task = {
  id: string;
  adr_source: string;
  spec_source: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  dependencies: string[];
  blocks: string[];
  test_strategy: 'TDD' | 'Unit' | 'Integration' | 'Direct';
  test_strategy_rationale: string;
  estimated_hours: number;
  risk: 'low' | 'medium' | 'high';
  files: {
    create: string[];
    modify: string[];
    delete: string[];
  };
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  started_at: string | null;
  completed_at: string | null;
  commits: string[];
  validation: {
    tests_pass: boolean;
    ac_verified: string[];
  };
}

export type TaskContext = {
  task: Task;
  dependencies: Task[];
  blockedTasks: Task[];
}

export type TaskUpdate = {
  status?: Task['status'];
  started_at?: string;
  completed_at?: string;
  commits?: string[];
  files?: {
    created?: string[];
    modified?: string[];
  };
  validation?: {
    tests_pass?: boolean;
    ac_verified?: string[];
  };
}
