import { Icons } from '../../../shared/components/Icon';
import { isDocumentImageIcon } from './dateDisplay';
import type { ProjectDocument } from './types';
import { isFolder } from './types';

export function renderDocumentIcon(
  node: Pick<ProjectDocument, 'kind' | 'icon'>,
  className: string,
  imgClassName: string,
  emojiClassName: string,
) {
  if (isFolder(node)) {
    return <span className={className}>{Icons.projects}</span>;
  }
  if (node.icon && isDocumentImageIcon(node.icon)) {
    return <img src={node.icon} alt="" className={imgClassName} />;
  }
  if (node.icon) {
    return <span className={emojiClassName}>{node.icon}</span>;
  }
  return <span className={className}>{Icons.crm}</span>;
}
