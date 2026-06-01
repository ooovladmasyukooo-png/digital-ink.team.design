import { useCallback, useEffect, useMemo } from 'react';
import { DESIGN_BRIEF_CREATOR_ID } from './constants';
import {
  allocateDesignBriefId,
  setDesignBriefs,
} from './designBriefStore';
import {
  createDesignBriefForProject,
  createDesignBriefForProjectGroup,
  createDesignBriefForProjectMember,
  createDesignBriefForProjectStatus,
  filterDesignBriefsForProject,
} from './projectDesignBrief';
import type { DateGroupId } from '../tasks/types';
import { useDesignBriefWorkspace } from './useDesignBriefWorkspace';
import type { Status } from './types';

export function useProjectDesignBriefWorkspace(projectId: string) {
  const base = useDesignBriefWorkspace(DESIGN_BRIEF_CREATOR_ID);

  const projectBriefs = useMemo(
    () => filterDesignBriefsForProject(base.briefs, projectId),
    [base.briefs, projectId],
  );

  useEffect(() => {
    base.closeDetail();
  }, [projectId, base.closeDetail]);

  const addDesignBriefForStatus = useCallback(
    (status: Status) => {
      const id = allocateDesignBriefId();
      setDesignBriefs((prev) => [
        ...prev,
        createDesignBriefForProjectStatus(projectId, status, id),
      ]);
    },
    [projectId],
  );

  const addDesignBriefForGroup = useCallback(
    (groupId: DateGroupId) => {
      const id = allocateDesignBriefId();
      setDesignBriefs((prev) => [
        ...prev,
        createDesignBriefForProjectGroup(projectId, groupId, id),
      ]);
    },
    [projectId],
  );

  const addDesignBriefForMember = useCallback(
    (memberId: string) => {
      const id = allocateDesignBriefId();
      setDesignBriefs((prev) => [
        ...prev,
        createDesignBriefForProjectMember(projectId, memberId, id),
      ]);
    },
    [projectId],
  );

  const createDesignBrief = useCallback(() => {
    const id = allocateDesignBriefId();
    const brief = createDesignBriefForProject(projectId, id);
    setDesignBriefs((prev) => [...prev, brief]);
    base.openBrief(id, []);
    return id;
  }, [base, projectId]);

  return {
    ...base,
    briefs: projectBriefs,
    addDesignBriefForStatus,
    addDesignBriefForGroup,
    addDesignBriefForMember,
    createDesignBrief,
  };
}

export type ProjectDesignBriefWorkspace = ReturnType<typeof useProjectDesignBriefWorkspace>;
