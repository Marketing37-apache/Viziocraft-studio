type Props = {
  title: string;
  client?: string;
  format?: string;
  frameioUrl: string; // share URL
  vertical?: boolean;
};

export function FrameVideo({ title, client, format, frameioUrl, vertical }: Props) {
  // Convert /view/ share to /embed/ which Frame.io accepts in iframes
  const src = frameioUrl.replace("next.frame.io/share/", "next.frame.io/embed/share/");
  return (
    <div className="group">
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black ${
          vertical ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">{title}</h3>
        {format && <span className="text-xs text-muted-foreground">{format}</span>}
      </div>
      {client && <p className="text-xs text-muted-foreground">{client}</p>}
    </div>
  );
}
