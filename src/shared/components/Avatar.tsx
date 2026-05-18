interface AvatarProps {
  name: string;
  hue?: number;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, hue = 0, src, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const className = `av av-${size}`;

  if (src) {
    return <img src={src} alt={name} className={`av-img av-img-${size}`} />;
  }

  return (
    <div
      className={className}
      style={{
        background: `oklch(0.42 0.08 ${hue})`,
        color: `oklch(0.92 0.04 ${hue})`,
      }}
    >
      {initials}
    </div>
  );
}
