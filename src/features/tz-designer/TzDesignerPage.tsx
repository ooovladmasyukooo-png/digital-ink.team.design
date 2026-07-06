import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icons } from '../../shared/components/Icon';
import { cx } from '../../shared/styles/cx';
import dbStyles from '../designBrief/designBrief.module.css';
import { MaterialDetailPanel } from './components/MaterialDetailPanel';
import { ReferralLinkDetailPanel } from './components/ReferralLinkDetailPanel';
import { ReferralLinksView } from './components/ReferralLinksView';
import { ReferralMaterialsView } from './components/ReferralMaterialsView';
import { referralLinks, referralMaterials as seedMaterials } from './data';
import { createReferralMaterialId, EMPTY_REFERRAL_MATERIAL_STATS } from './materialOptions';
import styles from './tzDesigner.module.css';
import type { ReferralMaterial, ReferralMaterialPatch, ReferralTabId } from './types';

const REFERRAL_TABS: { id: ReferralTabId; label: string; icon: ReactNode }[] = [
  { id: 'referral', label: 'Рефералка', icon: Icons.link },
  { id: 'materials', label: 'Матеріали', icon: Icons.description },
];

export function TzDesignerPage() {
  const [activeTab, setActiveTab] = useState<ReferralTabId>('referral');
  const [materials, setMaterials] = useState<ReferralMaterial[]>(() => seedMaterials);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedReferralLinkId, setSelectedReferralLinkId] = useState<string | null>(null);

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );

  const selectedReferralLink = useMemo(
    () => referralLinks.find((link) => link.id === selectedReferralLinkId) ?? null,
    [selectedReferralLinkId],
  );

  const headerCount = activeTab === 'materials' ? materials.length : referralLinks.length;

  useEffect(() => {
    document.title = 'Рефералка · Aurora CRM';
  }, []);

  const addMaterial = () => {
    const material: ReferralMaterial = {
      id: createReferralMaterialId(),
      title: 'Новий матеріал',
      description: '',
      html: '',
      status: 'draft',
      stats: { ...EMPTY_REFERRAL_MATERIAL_STATS },
      updatedAt: new Date().toISOString(),
    };
    setMaterials((prev) => [material, ...prev]);
    setSelectedMaterialId(material.id);
    setActiveTab('materials');
  };

  const updateMaterial = (id: string, patch: ReferralMaterialPatch) => {
    setMaterials((prev) => prev.map((material) => (material.id === id ? { ...material, ...patch } : material)));
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((material) => material.id !== id));
    setSelectedMaterialId((current) => (current === id ? null : current));
  };

  return (
    <div className={dbStyles['db-shell']}>
      <div className={dbStyles['db-main']}>
        <div className={dbStyles['db-design-brief-shell']}>
          <header className={dbStyles['db-stacked-header']}>
            <div className={dbStyles['db-design-brief-header']}>
              <div className={dbStyles['db-design-brief-header-main']}>
                <div className={dbStyles['db-design-brief-header-title-row']}>
                  <h1 className={dbStyles['db-design-brief-header-title']}>Рефералка</h1>
                  <span className={dbStyles['db-design-brief-header-count']}>{headerCount}</span>
                </div>
              </div>
              {activeTab === 'materials' ? (
                <div className={dbStyles['db-design-brief-header-action']}>
                  <button className="red-out-btn" type="button" onClick={addMaterial}>
                    {Icons.plus} Новий матеріал
                  </button>
                </div>
              ) : null}
            </div>
            <div className={dbStyles['db-stacked-tabs-bar']}>
              <nav className={dbStyles['db-stacked-tabs']} aria-label="Рефералка">
                {REFERRAL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={cx(dbStyles['db-tab'], activeTab === tab.id && dbStyles.on)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className={dbStyles['db-tab-i']}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </header>

          <div className={styles['tz-content']}>
            {activeTab === 'referral' ? (
              <ReferralLinksView links={referralLinks} onOpen={setSelectedReferralLinkId} />
            ) : (
              <ReferralMaterialsView
                materials={materials}
                onOpen={setSelectedMaterialId}
                onUpdate={updateMaterial}
                onAdd={addMaterial}
              />
            )}
          </div>
        </div>
      </div>

      {selectedReferralLink ? (
        <ReferralLinkDetailPanel link={selectedReferralLink} onClose={() => setSelectedReferralLinkId(null)} />
      ) : null}

      {selectedMaterial ? (
        <MaterialDetailPanel
          material={selectedMaterial}
          onClose={() => setSelectedMaterialId(null)}
          onUpdate={updateMaterial}
          onDelete={deleteMaterial}
        />
      ) : null}
    </div>
  );
}
