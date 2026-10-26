export default function MetalPanel({
  as: Tag = 'div',
  badge,
  title,
  headerRight,
  className = '',
  bodyClassName = 'p-4 sm:p-5',
  children,
  ...rest
}) {
  return (
    <Tag className={`metal-panel avionics-panel ${className}`} {...rest}>
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      {title && (
        <div className="panel-header flex-wrap justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {badge && (
              <span className="panel-badge" aria-hidden="true">
                {badge}
              </span>
            )}
            <h2 className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-ink truncate">
              {title}
            </h2>
          </div>
          {headerRight && <div className="flex flex-wrap items-center gap-2">{headerRight}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>
    </Tag>
  );
}
