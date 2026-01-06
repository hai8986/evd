interface CanvasOverlaysProps {
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  safeZoneMm: number;
  mmToPixels: number;
  zoom: number;
  showBleed?: boolean;
  showSafeZone?: boolean;
  showLabels?: boolean;
  showTopIndicator?: boolean;
}

export function CanvasOverlays({
  widthPx,
  heightPx,
  widthMm,
  heightMm,
  bleedMm,
  safeZoneMm,
  mmToPixels,
  zoom,
  showBleed = true,
  showSafeZone = true,
  showLabels = true,
  showTopIndicator = true,
}: CanvasOverlaysProps) {
  const bleedPx = bleedMm * mmToPixels * zoom;
  const safeZonePx = safeZoneMm * mmToPixels * zoom;

  // Calculate safe zone dimensions
  const safeZoneWidthMm = Math.round(widthMm - (safeZoneMm * 2));
  const safeZoneHeightMm = Math.round(heightMm - (safeZoneMm * 2));

  // Calculate bleed line dimensions (outer dimensions including bleed)
  const bleedWidthMm = Math.round(widthMm + (bleedMm * 2));
  const bleedHeightMm = Math.round(heightMm + (bleedMm * 2));

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ width: widthPx * zoom, height: heightPx * zoom }}
    >
      {/* TOP Indicator */}
      {showTopIndicator && showLabels && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-wider"
          style={{ 
            top: showBleed && bleedMm > 0 ? -bleedPx - 20 : -20,
            color: 'hsl(var(--destructive))',
          }}
        >
          ^TOP^
        </div>
      )}

      {/* Bleed Line */}
      {showBleed && bleedMm > 0 && (
        <>
          <div 
            className="absolute border-2 border-dashed rounded-sm"
            style={{
              top: -bleedPx,
              left: -bleedPx,
              right: -bleedPx,
              bottom: -bleedPx,
              borderColor: 'hsl(186 100% 50% / 0.7)', // Cyan color
            }}
          />
          {showLabels && (
            <span 
              className="absolute text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded"
              style={{ 
                top: -bleedPx - 18, 
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'hsl(186 100% 50%)',
                backgroundColor: 'hsl(var(--background) / 0.9)',
              }}
            >
              BLEED LINE {bleedWidthMm}X{bleedHeightMm}MM
            </span>
          )}
        </>
      )}

      {/* Safe Zone */}
      {showSafeZone && safeZoneMm > 0 && (
        <>
          <div 
            className="absolute border-2 border-dashed rounded-lg"
            style={{
              top: safeZonePx,
              left: safeZonePx,
              right: safeZonePx,
              bottom: safeZonePx,
              borderColor: 'hsl(142 70% 45% / 0.7)', // Green color
            }}
          />
          {showLabels && (
            <span 
              className="absolute text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded"
              style={{ 
                top: safeZonePx - 18, 
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'hsl(142 70% 45%)',
                backgroundColor: 'hsl(var(--background) / 0.9)',
              }}
            >
              SAFE ZONE {safeZoneWidthMm}X{safeZoneHeightMm}MM
            </span>
          )}
        </>
      )}

      {/* Corner guides */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-muted-foreground/30" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-muted-foreground/30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-muted-foreground/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-muted-foreground/30" />
    </div>
  );
}
