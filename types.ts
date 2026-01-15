
export enum Severity {
  CRITICAL = 'Critical',
  WARNING = 'Warning',
  INFO = 'Info',
}

export interface Issue {
  severity: Severity;
  message: string;
  recommendation: string;
}

export interface Metric {
  name: string;
  value: string;
  status: 'Good' | 'Needs Improvement' | 'Poor';
}

export interface CategoryResult {
  name: string;
  score: number;
  description: string;
  metrics?: Metric[];
  issues: Issue[];
}

export interface Competitor {
  name: string;
  strength: string;
  estimatedScore: number;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  volume: string;
  intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
}

export interface CampaignStrategy {
  name: string;
  description: string;
  platforms: string[];
  targetAudience: string;
  adHook: string;
  adType: string;
  reasoning: string;
}

export interface AdIntelligence {
  status: 'High Ad Potential' | 'Organic Focus' | 'Missed Opportunity';
  analysis: string;
}

export interface PageDetails {
  title: string;
  description: string;
  previewText: string;
}

export interface ResearchBrief {
  title: string;
  bullets: string[];
}

export interface AuditData {
  urlOrTitle: string;
  region?: string;
  overallScore: number;
  summary: string;
  timestamp: string;
  pageDetails?: PageDetails;
  researchBrief?: ResearchBrief;
  categories: CategoryResult[];
  competitors?: Competitor[];
  seoRankings?: KeywordRanking[];
  conversionAdvice?: string[];
  campaigns?: CampaignStrategy[];
  adIntelligence?: AdIntelligence;
}

export enum AnalysisType {
  URL = 'URL',
  CODE = 'CODE',
}
