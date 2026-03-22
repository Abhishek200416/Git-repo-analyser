import { Network, ShieldAlert, Zap, Code2 } from 'lucide-react';

export const FEATURES = [
  { id: 'arch', icon: Network, title: 'Architecture Mapping', description: 'Visualizes component relationships and data flow.', badge: 'Core' },
  { id: 'sec', icon: ShieldAlert, title: 'Security Audit', description: 'Identifies vulnerabilities and hardcoded secrets.', badge: 'Critical' },
  { id: 'perf', icon: Zap, title: 'Performance Profiling', description: 'Highlights bottlenecks and optimization opportunities.', badge: 'Pro' },
  { id: 'dx', icon: Code2, title: 'DX Evaluation', description: 'Assesses code readability and maintainability.', badge: 'Standard' },
];

export const DOC_PHASE_INDICES = [0, 1, 10, 11, 12, 13, 14, 15];
