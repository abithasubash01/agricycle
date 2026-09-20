// src/components/farmer/GovernmentSupport.jsx
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Landmark, ExternalLink, ShieldCheck, FileText, Info, Leaf, Tractor, Zap } from 'lucide-react';

export default function GovernmentSupport() {
  const { t } = useLanguage();

  const schemes = [
    {
      id: 'crm',
      name: 'Crop Residue Management (CRM) Scheme',
      ministry: 'Ministry of Agriculture & Farmers Welfare (MoA&FW), Government of India',
      officialDescription:
        'Central Sector Scheme for promoting agricultural mechanization for in-situ and ex-situ management of crop residue in the States of Punjab, Haryana, Uttar Pradesh, and NCT of Delhi to address air pollution and support residue aggregation machinery.',
      agriCycleRelevance:
        'Supports farmers, Custom Hiring Centres (CHCs), and cooperatives acquiring balers, rakes, happy seeders, super SMS, and residue collection equipment.',
      officialSource: 'Department of Agriculture & Farmers Welfare (agricoop.nic.in)',
      officialLink: 'https://agricoop.nic.in/',
      icon: Tractor,
      tag: 'Mechanization & CRM',
    },
    {
      id: 'national-bioenergy',
      name: 'National Bioenergy Programme',
      ministry: 'Ministry of New and Renewable Energy (MNRE), Government of India',
      officialDescription:
        'Supports the setting up of Biomass Pellet and Briquetting manufacturing plants, Biomass power cogeneration projects, and bioenergy supply chains across India to utilize agricultural waste as industrial fuel.',
      agriCycleRelevance:
        'Commercial buyers and pelletizers procuring paddy straw and bagasse through AgriCycle operate under MNRE biomass utilization guidelines.',
      officialSource: 'Ministry of New and Renewable Energy (mnre.gov.in / PIB)',
      officialLink: 'https://mnre.gov.in/',
      icon: Zap,
      tag: 'Biomass & Energy',
    },
    {
      id: 'aif',
      name: 'Agriculture Infrastructure Fund (AIF)',
      ministry: 'Department of Agriculture and Farmers Welfare, Government of India',
      officialDescription:
        'A medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets, with interest subvention and credit guarantee support.',
      agriCycleRelevance:
        'Enables FPOs, agri-entrepreneurs, and primary agricultural credit societies to finance biomass storage yards, baling hubs, and logistics units.',
      officialSource: 'Agriculture Infrastructure Fund Portal (agriinfra.dac.gov.in)',
      officialLink: 'https://agriinfra.dac.gov.in/',
      icon: Landmark,
      tag: 'Post-Harvest Infrastructure',
    },
    {
      id: 'satat',
      name: 'SATAT (Sustainable Alternative Towards Affordable Transportation)',
      ministry: 'Ministry of Petroleum and Natural Gas (MoPNG), Government of India',
      officialDescription:
        'An initiative aimed at establishing Compressed Bio-Gas (CBG) production plants from agricultural residue, cattle dung, and municipal solid waste, providing commercial offtake guarantees from Public Sector Oil Marketing Companies (OMCs).',
      agriCycleRelevance:
        'CBG producers require steady tonnages of paddy straw and agricultural residue as primary feedstock.',
      officialSource: 'Ministry of Petroleum & Natural Gas (mopng.gov.in / satat.co.in)',
      officialLink: 'https://mopng.gov.in/',
      icon: Leaf,
      tag: 'Bio-Gas & Biofuels',
    },
    {
      id: 'pm-pranam',
      name: 'PM-PRANAM (Programme for Restoration, Awareness, Nourishment & Amelioration of Mother Earth)',
      ministry: 'Ministry of Chemicals and Fertilizers, Government of India',
      officialDescription:
        'Incentivizes States and Union Territories to promote alternative fertilizers and balanced use of chemical fertilizers, supporting the integration of organic compost derived from biomass residues.',
      agriCycleRelevance:
        'Composting units procuring sugarcane bagasse and agricultural residue produce organic bio-enrichers supported under sustainable soil nourishment policies.',
      officialSource: 'Department of Fertilizers, Ministry of Chemicals and Fertilizers (fert.nic.in)',
      officialLink: 'https://www.fert.nic.in/',
      icon: ShieldCheck,
      tag: 'Sustainable Farming',
    },
  ];

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header flex justify-between items-center mb-2">
        <div>
          <h1 className="page-title">{t('govSupport')}</h1>
          <p className="page-subtitle">
            Information directory on official Government of India schemes connected to crop residue management, agricultural mechanization, and bioenergy.
          </p>
        </div>
      </div>

      {/* Mandatory Verbatim Official Disclaimer */}
      <div className="official-disclaimer-card mb-2">
        <div className="flex items-start gap-1">
          <Info size={22} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div className="font-bold text-blue-900" style={{ fontSize: '0.95rem' }}>
              Official Programme Information Disclaimer
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.45' }}>
              {t('officialGoIDisclaimer')}
            </p>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex flex-col gap-2">
        {schemes.map((scheme) => {
          const Icon = scheme.icon;

          return (
            <div key={scheme.id} className="card scheme-card">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1">
                  <div className="scheme-icon-wrap">
                    <Icon size={24} color="var(--color-brand-primary)" />
                  </div>
                  <div>
                    <span className="badge badge-subtle">{scheme.tag}</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem' }}>{scheme.name}</h3>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {scheme.ministry}
                    </div>
                  </div>
                </div>

                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex items-center gap-1"
                  style={{ fontSize: '0.85rem' }}
                >
                  <span>Official Portal</span>
                  <ExternalLink size={15} />
                </a>
              </div>

              <div className="scheme-body-grid grid grid-cols-2 gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <span className="font-semibold text-muted" style={{ fontSize: '0.85rem' }}>Official Programme Description:</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {scheme.officialDescription}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-muted" style={{ fontSize: '0.85rem' }}>Relevance to AgriCycle Users:</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-brand-dark)' }}>
                    {scheme.agriCycleRelevance}
                  </p>
                  <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                    <strong>Verified Source:</strong> {scheme.officialSource}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
