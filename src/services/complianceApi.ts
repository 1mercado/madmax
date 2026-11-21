import {
  AdminComplianceOverview,
  AmlCaseStatus,
  ComplianceProfileResponse,
  GovernmentIdType,
  KycProfile,
  KycStatus,
  KycTier,
  SanctionsScreeningResult,
} from '../types';
import { PUBLIC_GATEWAY_KEYS } from './fintechApi';

function buildComplianceHeaders(actorPhone?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-DigiCash-Public-Key': PUBLIC_GATEWAY_KEYS.digicash,
  };
  if (actorPhone) {
    headers['X-Compliance-Actor-Phone'] = actorPhone;
  }
  return headers;
}

export async function fetchComplianceProfileApi(
  phone: string
): Promise<ComplianceProfileResponse | null> {
  try {
    const res = await fetch(`/api/compliance/profile/${encodeURIComponent(phone)}`, {
      headers: buildComplianceHeaders(phone),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface KycSubmissionPayload {
  phone: string;
  fullLegalName: string;
  dateOfBirth: string;
  nationality: string;
  residentialAddress: string;
  city: string;
  occupation: string;
  sourceOfFunds: string;
  idType: GovernmentIdType;
  idNumber: string;
  frontIdImage?: string;
  backIdImage?: string;
  selfieImage?: string;
  isPep: boolean;
  pepDetails?: string;
  requestedTier?: KycTier;
}

export async function submitKycApplicationApi(
  payload: KycSubmissionPayload
): Promise<{
  success: boolean;
  profile?: KycProfile;
  screening?: SanctionsScreeningResult;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/compliance/kyc/submit', {
      method: 'POST',
      headers: buildComplianceHeaders(payload.phone),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return {
      success: false,
      error: 'Unable to reach KYC Compliance Verification server. Please try again.',
    };
  }
}

export async function screenEntityComplianceApi(params: {
  actorPhone: string;
  fullName: string;
  nationality?: string;
  dateOfBirth?: string;
}): Promise<{ success: boolean; result?: SanctionsScreeningResult; error?: string }> {
  try {
    const res = await fetch('/api/compliance/screen', {
      method: 'POST',
      headers: buildComplianceHeaders(params.actorPhone),
      body: JSON.stringify({
        fullName: params.fullName,
        nationality: params.nationality,
        dateOfBirth: params.dateOfBirth,
      }),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Failed to contact Sanctions/PEP Screening service.' };
  }
}

export async function fetchAdminComplianceOverviewApi(
  actorPhone: string
): Promise<AdminComplianceOverview | null> {
  try {
    const res = await fetch('/api/compliance/admin/overview', {
      headers: buildComplianceHeaders(actorPhone),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function reviewKycApplicationApi(params: {
  actorPhone: string;
  targetPhone: string;
  decision: KycStatus;
  approvedTier?: KycTier;
  reviewerNotes?: string;
}): Promise<{ success: boolean; profile?: KycProfile; error?: string }> {
  try {
    const res = await fetch('/api/compliance/admin/kyc/review', {
      method: 'POST',
      headers: buildComplianceHeaders(params.actorPhone),
      body: JSON.stringify({
        targetPhone: params.targetPhone,
        decision: params.decision,
        approvedTier: params.approvedTier,
        reviewerNotes: params.reviewerNotes,
      }),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error submitting KYC decision.' };
  }
}

export async function updateAmlCaseApi(params: {
  actorPhone: string;
  alertId: string;
  status: AmlCaseStatus;
  reviewerNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/compliance/admin/aml/case', {
      method: 'POST',
      headers: buildComplianceHeaders(params.actorPhone),
      body: JSON.stringify({
        alertId: params.alertId,
        status: params.status,
        reviewerNotes: params.reviewerNotes,
      }),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error updating AML alert case.' };
  }
}

export async function toggleAccountFreezeApi(params: {
  actorPhone: string;
  targetPhone: string;
  freeze: boolean;
  reason?: string;
}): Promise<{ success: boolean; isFrozen?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/compliance/admin/account/freeze', {
      method: 'POST',
      headers: buildComplianceHeaders(params.actorPhone),
      body: JSON.stringify({
        targetPhone: params.targetPhone,
        freeze: params.freeze,
        reason: params.reason,
      }),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error updating account freeze status.' };
  }
}

export async function exportAmlcReportApi(
  actorPhone: string,
  format: 'json' | 'csv' = 'csv'
): Promise<{ success: boolean; filename?: string; content?: string; mimeType?: string; error?: string }> {
  try {
    const res = await fetch(`/api/compliance/admin/export-report?format=${encodeURIComponent(format)}`, {
      headers: buildComplianceHeaders(actorPhone),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Unauthorized to export AMLC report.' };
    }
    return await res.json();
  } catch {
    return { success: false, error: 'Failed to export AMLC compliance report.' };
  }
}
