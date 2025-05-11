import { z } from 'zod';

export interface TaxonomyCategory {
  name: string;
  labels: string[];
}

export const TAXONOMY: TaxonomyCategory[] = [
  {
    name: 'Estate Planning & Legal',
    labels: [
      'Last Will and Testament',
      'Trust Agreements (Revocable / Irrevocable)',
      'Power of Attorney (Financial / Medical)',
      'Living Will / Advance Directive',
      'Healthcare Proxy',
      'Beneficiary Designations',
      'Guardianship Documents',
      'Funeral / Final Wishes',
    ],
  },
  {
    name: 'Investment & Financial Management',
    labels: [
      'Investment Policy Statement (IPS)',
      'Asset Allocation Reports',
      'Performance Statements',
      'Transaction Confirmations',
      'Brokerage/Custodial Agreements',
      'Advisory Fees & Disclosures',
      'Advisor Commentary & Reports',
    ],
  },
  {
    name: 'Tax & Income Reporting',
    labels: [
      'Personal Tax Returns (e.g., SA100 / 1040)',
      'Form 1099 / Dividend & Interest Summaries',
      'Form K-1 / Partnership Distributions',
      'Gift Tax Returns',
      'Estate Tax Returns',
      'Tax Computations / Allowance Records',
    ],
  },
  {
    name: 'Insurance & Risk Management',
    labels: [
      'Life Insurance Policies',
      'Disability Insurance',
      'Long-Term Care Insurance',
      'Property & Casualty Insurance',
      'Riders & Addenda',
      'Claims Documents',
      'Payment & Premium Schedules',
    ],
  },
  {
    name: 'Compliance & Regulation',
    labels: [
      'KYC Documentation',
      'AML Checks & SARs',
      'Risk Disclosures',
      'Privacy & Data Protection Policies',
      'Regulatory Attestations',
      'Training Records',
      'Incident Reports',
    ],
  },
  {
    name: 'Client Advisory & Relationship',
    labels: [
      'Advisory Agreements',
      'Financial Plans',
      'Quarterly/Annual Review Docs',
      'Advisor Notes & Commentary',
      'Client Feedback / Meeting Minutes',
      'Advisor Contact Records',
    ],
  },
  {
    name: 'Investment Product Documentation',
    labels: [
      'Fund Prospectuses / Offering Memoranda',
      'Fund Fact Sheets',
      'Subscription Agreements',
      'Private Placement Memorandums (PPM)',
      'Performance Reports by Product',
      'Redemption / Transfer Forms',
    ],
  },
  {
    name: 'Digital Assets',
    labels: [
      'Digital Asset Inventories',
      'Crypto Wallet Keys / Seed Phrases',
      'Digital Estate Plans',
      'NFT Ownership Records',
      'Online Financial Account Info',
      'Password Vaults & 2FA Access',
    ],
  },
  {
    name: 'Family Governance & Legacy',
    labels: [
      'Family Constitution / Charter',
      'Ethical Wills',
      'Family Meeting Minutes',
      'Succession Plans',
      'Governance Role Definitions',
      'Educational Retreat Docs',
      'Conflict Resolution Agreements',
    ],
  },
  {
    name: 'Education & Heir Preparedness',
    labels: [
      'Financial Literacy Resources',
      'Heir Readiness Assessments',
      'Education Plans & Schedules',
      'Mentorship Records',
      'Retreat Materials / Schedules',
    ],
  },
  {
    name: 'Administrative & Miscellaneous',
    labels: [
      'Document Templates',
      'Signed Receipt Confirmations',
      'Correspondence (letters/emails)',
      'File Indexes / Checklists',
    ],
  },
];

export const TAXONOMY_SCHEMA = z.enum(
  TAXONOMY.flatMap((category) => category.labels) as [string, ...string[]],
);
