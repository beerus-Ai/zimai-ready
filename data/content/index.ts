import type { DomainId, ModuleContent, PracticalActivity } from '../../types';
import { CORE_CONTENT } from './core';
import { FINANCE_CONTENT } from './finance';
import { HR_CONTENT } from './hr';
import { MARKETING_CONTENT } from './marketing';
import { SOFTWARE_CONTENT } from './software';
import { CUSTOMER_SERVICE_CONTENT } from './customer-service';
import { OPERATIONS_CONTENT } from './operations';
import { MANAGEMENT_CONTENT } from './management';
import { AGRICULTURE_CONTENT } from './agriculture';
import { HEALTHCARE_CONTENT } from './healthcare';
import { EDUCATION_CONTENT } from './education';
import { DATA_ANALYTICS_CONTENT } from './data-analytics';

const ALL: ModuleContent[] = [
  ...CORE_CONTENT,
  ...FINANCE_CONTENT,
  ...HR_CONTENT,
  ...MARKETING_CONTENT,
  ...SOFTWARE_CONTENT,
  ...CUSTOMER_SERVICE_CONTENT,
  ...OPERATIONS_CONTENT,
  ...MANAGEMENT_CONTENT,
  ...AGRICULTURE_CONTENT,
  ...HEALTHCARE_CONTENT,
  ...EDUCATION_CONTENT,
  ...DATA_ANALYTICS_CONTENT,
];

export const CONTENT: Record<string, ModuleContent> = Object.fromEntries(ALL.map((c) => [c.moduleId, c]));

export const getModuleContent = (moduleId: string): ModuleContent | null => CONTENT[moduleId] ?? null;

/** All practical activities available for a domain (domain modules + challenge). */
export function getDomainActivities(domainId: DomainId): { moduleId: string; activity: PracticalActivity }[] {
  return ALL.filter((c) => c.activity && (c.activity.domainId === domainId || c.moduleId.startsWith(domainPrefix(domainId)))).map((c) => ({
    moduleId: c.moduleId,
    activity: c.activity!,
  }));
}

const PREFIX: Record<DomainId, string> = {
  finance: 'fin-',
  hr: 'hr-',
  marketing: 'mkt-',
  software: 'sw-',
  'customer-service': 'cs-',
  operations: 'ops-',
  management: 'mgmt-',
  agriculture: 'agri-',
  healthcare: 'hc-',
  education: 'edu-',
  'data-analytics': 'da-',
};
export const domainPrefix = (d: DomainId) => PREFIX[d];
