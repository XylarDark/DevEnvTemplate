/**
 * Type definitions for project manifest
 */

export interface Requirements {
  productType: string;
  coreFeatures: string[];
  preferredStack: string;
  deploymentTarget: string;
  testingLevel: string;
  governanceSensitivity: string;
  needsCI: boolean;
  needsDocker: boolean;
  needsMonitoring: boolean;
  teamSize: string;
}

export interface Rationale {
  features: string;
  stack: string;
  infrastructure: string;
  governance: string;
  testing: string;
}

export interface DerivedInfo {
  features: string[];
  rationale: Rationale;
}

export interface ProjectManifest {
  version: string;
  generatedAt: string;
  requirements: Requirements;
  derived: DerivedInfo;
}

