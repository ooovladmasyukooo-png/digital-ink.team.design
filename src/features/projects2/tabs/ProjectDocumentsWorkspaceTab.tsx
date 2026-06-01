import { useEffect } from 'react';
import { DocumentEditorPanel } from '../components/DocumentEditorPanel';
import { DocumentTreeSidebar } from '../components/DocumentTreeSidebar';
import type { ProjectDocumentScope } from '../documents/documentScope';
import { PROJECT_DOCUMENT_SCOPE_LABEL } from '../documents/documentScope';
import { useProjectDocuments } from '../documents/useProjectDocuments';
import styles from '../projects2.module.css';

interface ProjectDocumentsWorkspaceTabProps {
  projectId: string;
  scope: ProjectDocumentScope;
}

export function ProjectDocumentsWorkspaceTab({ projectId, scope }: ProjectDocumentsWorkspaceTabProps) {
  const {
    tree,
    selected,
    selectedId,
    setSelectedId,
    expandedIds,
    toggleExpand,
    updateSelected,
    addPage,
    addFolder,
    deleteSelected,
    deleteDocument,
    moveDocument,
    duplicateDocument,
    resetForProject,
  } = useProjectDocuments(projectId, scope);

  const headLabel = PROJECT_DOCUMENT_SCOPE_LABEL[scope];

  useEffect(() => {
    resetForProject(projectId);
  }, [projectId, resetForProject]);

  return (
    <div className={styles['p2-documents']}>
      <DocumentTreeSidebar
        tree={tree}
        selectedId={selectedId}
        expandedIds={expandedIds}
        headLabel={headLabel}
        onSelect={setSelectedId}
        onToggleExpand={toggleExpand}
        onAddPage={addPage}
        onAddFolder={addFolder}
        onMoveDocument={moveDocument}
        onDuplicate={duplicateDocument}
        onDelete={deleteDocument}
      />
      <DocumentEditorPanel
        projectId={projectId}
        scope={scope}
        document={selected}
        onUpdate={updateSelected}
        onDelete={deleteSelected}
      />
    </div>
  );
}
