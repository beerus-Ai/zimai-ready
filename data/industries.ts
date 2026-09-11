import type { Industry } from '../types';

/** Zimbabwe-relevant sectors. `aiExposure` is a baseline used by the readiness engine. */
export const INDUSTRIES: Industry[] = [
  {
    id: 'banking',
    name: 'Banking & Finance',
    icon: 'Landmark',
    aiExposure: 78,
    description: 'Banks, insurers, microfinance, pensions and mobile money.',
    aiUseCases: ['Fraud and anomaly detection', 'Credit scoring', 'KYC/AML automation', 'Customer service chatbots', 'Automated reporting'],
  },
  {
    id: 'mining',
    name: 'Mining',
    icon: 'Pickaxe',
    aiExposure: 58,
    description: 'Gold, platinum, lithium, chrome and coal operations.',
    aiUseCases: ['Predictive equipment maintenance', 'Safety monitoring', 'Ore-grade prediction', 'Fleet & logistics optimisation'],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: 'Sprout',
    aiExposure: 48,
    description: 'Tobacco, maize, horticulture, livestock and agro-processing.',
    aiUseCases: ['Crop and weather forecasting', 'Pest and disease detection', 'Market price prediction', 'Farmer advisory services'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'HeartPulse',
    aiExposure: 55,
    description: 'Hospitals, clinics, pharmacies and health NGOs.',
    aiUseCases: ['Clinical documentation', 'Diagnostic decision support', 'Patient triage', 'Supply forecasting'],
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: 'ShoppingBag',
    aiExposure: 64,
    description: 'Supermarkets, wholesale, FMCG distribution and e-commerce.',
    aiUseCases: ['Demand forecasting', 'Dynamic pricing', 'Customer insights', 'Inventory optimisation'],
  },
  {
    id: 'telecoms',
    name: 'Telecommunications',
    icon: 'RadioTower',
    aiExposure: 76,
    description: 'Mobile networks, ISPs and digital services.',
    aiUseCases: ['Network optimisation', 'Churn prediction', 'Customer support automation', 'Fraud detection'],
  },
  {
    id: 'government',
    name: 'Government / Public Sector',
    icon: 'Building2',
    aiExposure: 42,
    description: 'Ministries, local authorities, parastatals and agencies.',
    aiUseCases: ['Document processing', 'Citizen service chatbots', 'Revenue analytics', 'Records digitisation'],
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    aiExposure: 57,
    description: 'Schools, colleges, universities and training providers.',
    aiUseCases: ['Lesson planning', 'Personalised learning', 'Assessment feedback', 'Administrative automation'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    aiExposure: 56,
    description: 'Food processing, beverages, textiles, steel and chemicals.',
    aiUseCases: ['Quality inspection', 'Predictive maintenance', 'Production planning', 'Energy optimisation'],
  },
  {
    id: 'tourism',
    name: 'Tourism & Hospitality',
    icon: 'Palmtree',
    aiExposure: 50,
    description: 'Hotels, lodges, tour operators and travel services.',
    aiUseCases: ['Booking & revenue management', 'Multilingual guest service', 'Marketing content', 'Review analysis'],
  },
  {
    id: 'ict',
    name: 'ICT / Technology',
    icon: 'Cpu',
    aiExposure: 85,
    description: 'Software, fintech, IT services and start-ups.',
    aiUseCases: ['AI-assisted coding', 'Automated testing', 'IT support automation', 'AI product development'],
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: 'Briefcase',
    aiExposure: 72,
    description: 'Audit, legal, consulting and advisory firms.',
    aiUseCases: ['Document review', 'Research & drafting', 'Audit analytics', 'Proposal writing'],
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'Shapes',
    aiExposure: 50,
    description: 'Another sector not listed here.',
    aiUseCases: ['Document drafting', 'Research', 'Reporting', 'Process automation'],
  },
];

export const getIndustry = (id?: string) => INDUSTRIES.find((i) => i.id === id);
export const industryName = (id?: string, other?: string) =>
  id === 'other' && other ? other : getIndustry(id)?.name ?? 'Your industry';
