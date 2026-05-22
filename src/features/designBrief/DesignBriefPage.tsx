import { useCallback, useEffect, useState } from 'react';
import { DesignBriefDetailLayer } from './components/DesignBriefDetailLayer';
import { DesignBriefListView } from './components/DesignBriefListView';
import { DESIGN_BRIEF_CREATOR_ID } from './constants';
import {
  buildDesignBriefUrl,
  designBriefDocumentTitle,
  designBriefItemDocumentTitle,
  parseDesignBriefSearch,
} from './designBriefPaths';
import { useDesignBriefWorkspace } from './useDesignBriefWorkspace';
import type { DesignBriefViewTabId } from './types';
import styles from './designBrief.module.css';

const DESIGN_BRIEF_VIEWER_STORAGE_KEY = 'design-brief-viewer-id';
const DESIGN_BRIEF_TAB_STORAGE_KEY = 'design-brief-active-tab';

function readTabFromStorage(): DesignBriefViewTabId {
  try {
    const stored = sessionStorage.getItem(DESIGN_BRIEF_TAB_STORAGE_KEY);
    if (stored === 'by-date' || stored === 'by-status' || stored === 'by-people' || stored === 'archive') {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return 'by-status';
}

function readViewerFromStorage(): string {
  try {
    const stored = sessionStorage.getItem(DESIGN_BRIEF_VIEWER_STORAGE_KEY);
    return stored || DESIGN_BRIEF_CREATOR_ID;
  } catch {
    return DESIGN_BRIEF_CREATOR_ID;
  }
}

export function DesignBriefPage() {
  const [urlSearch, setUrlSearch] = useState(() => window.location.search);
  const [viewerId, setViewerId] = useState(readViewerFromStorage);
  const [activeTab, setActiveTab] = useState<DesignBriefViewTabId>(readTabFromStorage);
  const workspace = useDesignBriefWorkspace(viewerId);
  const { panelBrief, selectedBriefId, openBrief, closeDetail } = workspace;

  const { briefId, full: briefFull } = parseDesignBriefSearch(urlSearch);

  const pushUrl = useCallback(
    (opts: { brief?: string | null; full?: boolean; replace?: boolean }) => {
      const current = parseDesignBriefSearch(urlSearch);
      const nextBrief = opts.brief !== undefined ? opts.brief : current.briefId;
      const nextFull = opts.full !== undefined ? opts.full : current.full;
      const path = buildDesignBriefUrl({ brief: nextBrief ?? undefined, full: nextFull });
      const next = path.includes('?') ? path.slice(path.indexOf('?')) : '';
      setUrlSearch(next);
      const fn = opts.replace ? window.history.replaceState : window.history.pushState;
      fn.call(window.history, {}, '', path);
      return next;
    },
    [urlSearch],
  );

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path !== '/design-brief') return;

    const parsed = parseDesignBriefSearch(window.location.search);
    if (parsed.briefId) openBrief(parsed.briefId, []);
    const root = workspace.briefs.find((b) => b.id === parsed.briefId);
    if (parsed.full && parsed.briefId && root) {
      document.title = designBriefItemDocumentTitle(root.title, parsed.briefId);
    } else {
      document.title = designBriefDocumentTitle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once
  }, []);

  useEffect(() => {
    const onPop = () => {
      const search = window.location.search;
      setUrlSearch(search);
      const parsed = parseDesignBriefSearch(search);
      if (parsed.briefId) openBrief(parsed.briefId, []);
      else closeDetail();
      const root = workspace.briefs.find((b) => b.id === parsed.briefId);
      if (parsed.full && parsed.briefId && root) {
        document.title = designBriefItemDocumentTitle(root.title, parsed.briefId);
      } else {
        document.title = designBriefDocumentTitle();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [closeDetail, openBrief, workspace.briefs]);

  const onViewerChange = useCallback(
    (memberId: string) => {
      setViewerId(memberId);
      try {
        sessionStorage.setItem(DESIGN_BRIEF_VIEWER_STORAGE_KEY, memberId);
      } catch {
        /* ignore */
      }
      closeDetail();
    },
    [closeDetail],
  );

  const onTab = useCallback((tabId: DesignBriefViewTabId) => {
    setActiveTab(tabId);
    try {
      sessionStorage.setItem(DESIGN_BRIEF_TAB_STORAGE_KEY, tabId);
    } catch {
      /* ignore */
    }
  }, []);

  const closeBriefDetail = useCallback(() => {
    closeDetail();
    pushUrl({ brief: null, full: false });
    document.title = designBriefDocumentTitle();
  }, [closeDetail, pushUrl]);

  const expandBrief = useCallback(() => {
    const id = selectedBriefId ?? panelBrief?.id ?? briefId;
    if (!id) return;
    pushUrl({ brief: id, full: true });
    if (panelBrief) document.title = designBriefItemDocumentTitle(panelBrief.title, id);
  }, [briefId, panelBrief, pushUrl, selectedBriefId]);

  const collapseBrief = useCallback(() => {
    const id = briefId ?? panelBrief?.id;
    pushUrl({ brief: id ?? null, full: false });
    if (panelBrief && id) document.title = designBriefItemDocumentTitle(panelBrief.title, id);
    else document.title = designBriefDocumentTitle();
  }, [briefId, panelBrief, pushUrl]);

  const wrapOpenBrief = useCallback(
    (openBriefId: string, path: string[] = []) => {
      openBrief(openBriefId, path);
      pushUrl({ brief: openBriefId, full: false });
    },
    [openBrief, pushUrl],
  );

  const onCreate = useCallback(() => {
    const id = workspace.createDesignBrief();
    pushUrl({ brief: id, full: false });
    document.title = designBriefItemDocumentTitle('Нове ТЗ', id);
  }, [pushUrl, workspace]);

  useEffect(() => {
    if (!briefId) return;
    const root = workspace.briefs.find((b) => b.id === briefId);
    if (briefFull && root) {
      document.title = designBriefItemDocumentTitle(root.title, briefId);
    }
  }, [briefFull, briefId, workspace.briefs]);

  const workspaceWithNav = { ...workspace, openBrief: wrapOpenBrief };

  if (briefFull && panelBrief) {
    return (
      <div className={styles['db-shell']}>
        <DesignBriefDetailLayer
          workspace={workspace}
          full
          onExpand={expandBrief}
          onCollapse={collapseBrief}
          onClose={closeBriefDetail}
        />
      </div>
    );
  }

  return (
    <div className={styles['db-shell']}>
      <div className={styles['db-main']}>
        <DesignBriefListView
          workspace={workspaceWithNav}
          activeTab={activeTab}
          onTab={onTab}
          viewerId={viewerId}
          onViewerChange={onViewerChange}
          onCreate={onCreate}
        />
      </div>
      <DesignBriefDetailLayer
        workspace={workspace}
        full={false}
        onExpand={expandBrief}
        onCollapse={collapseBrief}
        onClose={closeBriefDetail}
      />
    </div>
  );
}
