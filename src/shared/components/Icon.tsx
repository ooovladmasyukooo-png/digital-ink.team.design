import type { ReactNode, SVGProps } from 'react';

interface IconProps extends Pick<SVGProps<SVGSVGElement>, 'className'> {
  d: ReactNode;
  size?: number;
  sw?: number;
}

export function Icon({ d, size = 18, sw = 1.6, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

export const Icons = {
  dashboard: (
    <Icon
      d={
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" />
        </>
      }
    />
  ),
  /** Іконка прапорця пріоритету (списки як у ClickUp). */
  flag: (
    <Icon
      sw={1.55}
      size={12}
      d={
        <>
          <path d="M5 22V4" />
          <path d="M5 6h8l2 3h9v7h-9l-2-3H7v11" />
        </>
      }
    />
  ),
  crm: <Icon d={<path d="M3 7h18M3 12h18M3 17h12" />} />,
  projects: <Icon d={<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />} />,
  briefcase: <Icon d={<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>} size={13} />,
  calendar: <Icon d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>} size={13} />,
  lock: <Icon d={<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>} size={34} sw={1.35} />,
  analytics: <Icon d={<path d="M4 19V5M10 19v-8M16 19v-4M22 19H2" />} />,
  finance: <Icon d={<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />} />,
  team: <Icon d={<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="6.5" r="2.5" /><path d="M21.5 18a4.5 4.5 0 0 0-6-4.2" /></>} />,
  tasks: (
    <Icon
      d={
        <>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
          <path d="M9 12l2 2 4-4" />
        </>
      }
    />
  ),
  settings: <Icon d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>} />,
  logout: <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>} />,
  search: <Icon d={<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>} />,
  filter: <Icon d={<path d="M3 5h18M6 12h12M10 19h4" />} />,
  plus: <Icon d={<path d="M12 5v14M5 12h14" />} />,
  bell: <Icon d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></>} />,
  chevD: <Icon d={<path d="m6 9 6 6 6-6" />} size={14} />,
  arrowU: <Icon d={<path d="M12 19V5M5 12l7-7 7 7" />} size={14} />,
  arrowD: <Icon d={<path d="M12 5v14M19 12l-7 7-7-7" />} size={14} />,
  more: <Icon d={<><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>} />,
  call: <Icon d={<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />} size={14} />,
  mail: <Icon d={<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>} size={14} />,
  check: <Icon d={<path d="M20 6 9 17l-5-5" />} size={14} />,
  spark: <Icon d={<path d="M12 2 14 9l7 1-5 5 2 7-6-4-6 4 2-7-5-5 7-1Z" />} size={14} />,
  inbox: <Icon d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /></>} size={14} />,
  play: (
    <Icon
      size={14}
      sw={0}
      d={<path d="m8 6.5 9.5 5.5-9.5 5.5V6.5Z" fill="currentColor" stroke="none" />}
    />
  ),
  eye: (
    <Icon
      size={14}
      d={
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      }
    />
  ),
  archive: (
    <Icon
      size={14}
      d={
        <>
          <rect x="2" y="4" width="20" height="4" rx="1" />
          <path d="M4 8v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
          <path d="M10 12h4" />
        </>
      }
    />
  ),
  sun: (
    <Icon
      d={
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      }
    />
  ),
  moon: <Icon d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />} />,
  camera: (
    <Icon
      d={
        <>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </>
      }
      size={18}
    />
  ),
  download: <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>} size={14} />,
  trend: <Icon d={<><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></>} size={14} />,
  trash: (
    <Icon
      d={
        <>
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </>
      }
      size={14}
    />
  ),
  duplicate: (
    <Icon
      d={
        <>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
      }
      size={14}
    />
  ),
  chevR: <Icon d={<path d="m9 18 6-6-6-6" />} size={12} />,
  /** Іконка гілки підзадач (лічильник у списку). */
  repeat: (
    <Icon
      size={11}
      sw={1.5}
      d={
        <>
          <path d="M17 2v4h-4" />
          <path d="M7 22v-4h4" />
          <path d="M20 12a8 8 0 0 0-14-5.3L3 10" />
          <path d="M4 12a8 8 0 0 0 14 5.3L21 14" />
        </>
      }
    />
  ),
  description: (
    <Icon
      size={11}
      sw={1.5}
      d={
        <>
          <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M10 9h6M10 13h6M10 17h4" />
        </>
      }
    />
  ),
  subtree: (
    <Icon
      size={11}
      sw={1.5}
      d={
        <>
          <path d="M6 3v12" />
          <path d="M6 9h4a2 2 0 0 1 2 2v4" />
          <circle cx="6" cy="3" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
        </>
      }
    />
  ),
  openExternal: (
    <Icon
      size={12}
      d={
        <>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="m15 3 21 3 21 9" />
          <path d="M10 14 21 3" />
        </>
      }
    />
  ),
  share: (
    <Icon
      size={14}
      d={
        <>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5" />
        </>
      }
    />
  ),
  close: <Icon d={<path d="M18 6 6 18M6 6l12 12" />} size={14} />,
};
