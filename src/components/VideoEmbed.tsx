type Props = {
  title: string;
  client?: string;
  format?: string;
  driveId?: string;
  youtubeId?: string;
  vertical?: boolean;
};

export function VideoEmbed({ title, client, format, driveId, youtubeId, vertical }: Props) {
  const src = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0`
    : "";
  return (
    <div className="group">
      <div
        className={`relative overflow-hidden rounded-2xl border border-black/10 bg-black ring-brand transition group-hover:shadow-[0_30px_80px_-20px_rgba(123,45,142,0.5)] ${
          vertical ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <iframe
          src={src}
          title={title}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {format && <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{format}</span>}
      </div>
      {client && <p className="text-xs text-muted-foreground">{client}</p>}
    </div>
  );
}
