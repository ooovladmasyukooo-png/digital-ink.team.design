/** Same illustration style for every project; seed only changes the face. */
const DICEBEAR_STYLE = 'lorelei';

const AVATAR_BACKGROUND = 'e8eaed';

export const PROJECT_AVATAR_FALLBACK_HUE = 250;

export function projectAvatarUrl(projectId: string): string {
  const seed = encodeURIComponent(projectId);
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${seed}&backgroundColor=${AVATAR_BACKGROUND}`;
}

export function resolveProjectAvatarSrc(
  projectId: string,
  uploadedSrc?: string | null,
): string {
  return uploadedSrc?.trim() ? uploadedSrc : projectAvatarUrl(projectId);
}
