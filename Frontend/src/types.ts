export interface ShieldFeature {
  id: string;
  name: string;
  shortName: string;
  position: 'top' | 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  description: string;
  details: string[];
  metrics: { label: string; value: string }[];
  tag: string;
}

export interface SecurityMetric {
  title: string;
  value: string;
  change: string;
  status: 'safe' | 'warning' | 'alert';
}

export interface AuditDevice {
  hostname: string;
  vendor: string;
  model: string;
  ip: string;
  complianceScore: number;
  criticalGaps: number;
  status: 'Compliant' | 'Remediation Needed' | 'Critical Failure';
  lastScan: string;
}

export interface PipelineStage {
  id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'complete';
  progressPercent: number; // 0 to 100
  details: string;
  itemsFound?: number;
  timeTaken?: string;
}

export interface UploadAuditData {
  audit_id?: string;
  fileName: string;
  fileSize: string;
  vendor: string;
  deviceCount: number;
  uploadedAt: string;
  complianceScore: number;
  compliance_status?: string;
  audit_status?: string;
  vulnerabilitiesFound: number;
  stages: PipelineStage[];
  findings?: any[];
  risk?: any;
  ai_explanation?: any;
}

export interface AISecuritySuggestion {
  id: number;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cveReference: string;
  cvss?: number;
  frameworks?: string[];
  ruleId?: string;
  rationale: string;
  cliCommand: string;
  remediationImpact: string;
}
