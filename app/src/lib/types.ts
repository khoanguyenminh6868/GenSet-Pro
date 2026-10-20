// Mirrors the response shapes of the GenBid Pro server (server/src).

export interface Tender {
  id: string;
  notifyNo: string;
  notifyVersion?: string;
  planNo?: string;
  bidName: string;
  investorName?: string;
  procuringEntityName?: string;
  location?: string;
  field?: string;
  bidForm?: string;
  bidMode?: string;
  processApply?: string;
  isInternet?: boolean;
  publicDate?: string;
  bidCloseDate?: string;
  bidOpenDate?: string;
  estimatedPrice?: number;
  bidSecurity?: number;
  status: 'open' | 'closed';
  sourceUrl: string;
  isSample?: boolean;
}

export interface TenderSearchResult {
  tenders: Tender[];
  fetchedAt: string;
  source: 'muasamcong' | 'sample';
}

export type Severity = 'critical' | 'warning' | 'info';

export interface Analysis {
  summary: string;
  keyInfo: Record<
    | 'bidName'
    | 'notifyNo'
    | 'investor'
    | 'procuringEntity'
    | 'bidForm'
    | 'bidMethod'
    | 'closingTime'
    | 'bidValidity'
    | 'bidSecurity'
    | 'budget'
    | 'contractType'
    | 'deliveryTime'
    | 'deliveryLocation'
    | 'warranty'
    | 'evaluationMethod',
    string | null
  >;
  technicalSpecs: { item: string; requirement: string; reference: string | null }[];
  qualificationRequirements: { requirement: string; reference: string | null }[];
  highlights: {
    severity: Severity;
    category: 'deadline' | 'eligibility' | 'technical' | 'financial' | 'documents' | 'contract' | 'risk' | 'other';
    title: string;
    detail: string;
    quote: string | null;
    reference: string | null;
    recommendation: string;
  }[];
  requiredDocuments: string[];
  restrictiveClauses: string[];
  questionsForClarification: string[];
}

export type ComplianceStatus = 'met' | 'partial' | 'not_met' | 'missing' | 'unclear';

export interface Comparison {
  overallScore: number;
  verdict: 'pass' | 'at_risk' | 'fail';
  summary: string;
  items: {
    category: 'technical' | 'qualification' | 'financial' | 'documents' | 'commercial' | 'other';
    requirement: string;
    requirementRef: string | null;
    offered: string | null;
    offeredRef: string | null;
    status: ComplianceStatus;
    critical: boolean;
    note: string;
  }[];
  missingDocuments: string[];
  recommendations: string[];
}

export type Stage = 'new' | 'reviewing' | 'preparing' | 'submitted' | 'won' | 'lost' | 'dropped';

export interface TrackedTender {
  tender: Tender;
  stage: Stage;
  notes: string;
  addedAt: string;
  updatedAt: string;
  analysis?: Analysis;
  analyzedAt?: string;
  comparison?: Comparison;
  comparedAt?: string;
}
