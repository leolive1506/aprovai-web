interface PostInfoProps {
  category: string;
  dateToNow: string;
  authorName: string;
}

export function PostInfo({ category, dateToNow, authorName }: PostInfoProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-sm font-semibold leading-none truncate">{authorName}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
        {category && (
          <span className="truncate max-w-30">{category}</span>
        )}
        {category && <span aria-hidden className="shrink-0">·</span>}
        <span className="shrink-0 whitespace-nowrap">{dateToNow}</span>
      </div>
    </div>
  )
}