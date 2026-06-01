import { ProjectDocumentsWorkspaceTab } from './ProjectDocumentsWorkspaceTab';

interface DocumentsTabProps {
  projectId: string;
}

export function DocumentsTab({ projectId }: DocumentsTabProps) {
  return <ProjectDocumentsWorkspaceTab projectId={projectId} scope="documents" />;
}
