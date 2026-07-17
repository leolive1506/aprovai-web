export function DataTableEmpty() {
  return (
    <div className="data-table-empty flex flex-col items-center justify-center px-8 py-16 select-none">
      <style>{`
        @keyframes dte-scan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dte-pulse-ring {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes dte-float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.35; }
          33% { transform: translate(6px, -8px) scale(1.1); opacity: 0.55; }
          66% { transform: translate(-4px, 5px) scale(0.9); opacity: 0.25; }
        }
        @keyframes dte-float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.25; }
          40% { transform: translate(-7px, 6px) scale(0.85); opacity: 0.5; }
          70% { transform: translate(5px, -4px) scale(1.15); opacity: 0.3; }
        }
        @keyframes dte-float-3 {
          0%, 100% { transform: translate(0px, 0px); opacity: 0.4; }
          50% { transform: translate(8px, 8px); opacity: 0.15; }
        }
        @keyframes dte-dash-draw {
          0% { stroke-dashoffset: 120; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes dte-fade-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        @keyframes dte-blink-cell {
          0%, 80%, 100% { opacity: 0.12; }
          40% { opacity: 0.28; }
        }
        .dte-scan-arm {
          transform-origin: 64px 64px;
          animation: dte-scan 4s linear infinite;
        }
        .dte-pulse-ring {
          transform-origin: 64px 64px;
          animation: dte-pulse-ring 4s ease-out infinite;
        }
        .dte-pulse-ring-2 {
          transform-origin: 64px 64px;
          animation: dte-pulse-ring 4s ease-out infinite 2s;
        }
        .dte-dot-1 { animation: dte-float-1 5.2s ease-in-out infinite; }
        .dte-dot-2 { animation: dte-float-2 6.8s ease-in-out infinite 0.8s; }
        .dte-dot-3 { animation: dte-float-3 4.5s ease-in-out infinite 1.5s; }
        .dte-dot-4 { animation: dte-float-1 7.1s ease-in-out infinite 2.2s; }
        .dte-dot-5 { animation: dte-float-2 5.9s ease-in-out infinite 0.3s; }
        .dte-border-draw {
          stroke-dasharray: 120;
          animation: dte-dash-draw 1.2s cubic-bezier(0.4,0,0.2,1) forwards 0.2s;
          stroke-dashoffset: 120;
        }
        .dte-text-block {
          animation: dte-fade-up 0.7s cubic-bezier(0.4,0,0.2,1) forwards 0.5s;
          opacity: 0;
        }
        .dte-cell-1 { animation: dte-blink-cell 3.5s ease-in-out infinite 0s; }
        .dte-cell-2 { animation: dte-blink-cell 3.5s ease-in-out infinite 0.7s; }
        .dte-cell-3 { animation: dte-blink-cell 3.5s ease-in-out infinite 1.4s; }
        .dte-cell-4 { animation: dte-blink-cell 3.5s ease-in-out infinite 2.1s; }
        .dte-cell-5 { animation: dte-blink-cell 3.5s ease-in-out infinite 2.8s; }
        .dte-cell-6 { animation: dte-blink-cell 3.5s ease-in-out infinite 0.35s; }
      `}</style>

      {/* Illustration */}
      <div className="relative mb-8">
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Pulse rings */}
          <circle
            cx="64"
            cy="64"
            r="52"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="dte-pulse-ring text-primary/30"
          />
          <circle
            cx="64"
            cy="64"
            r="52"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="dte-pulse-ring-2 text-primary/20"
          />

          {/* Outer circle border */}
          <circle
            cx="64"
            cy="64"
            r="44"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="dte-border-draw text-border"
          />

          {/* Inner grid — empty table cells */}
          {/* Row dividers */}
          <line
            x1="26"
            y1="51"
            x2="102"
            y2="51"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-border/60"
          />
          <line
            x1="26"
            y1="64"
            x2="102"
            y2="64"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-border/60"
          />
          <line
            x1="26"
            y1="77"
            x2="102"
            y2="77"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-border/60"
          />

          {/* Col dividers */}
          <line
            x1="51"
            y1="38"
            x2="51"
            y2="90"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-border/60"
          />
          <line
            x1="77"
            y1="38"
            x2="77"
            y2="90"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-border/60"
          />

          {/* Blinking empty cell fills */}
          <rect
            x="27"
            y="52"
            width="23"
            height="12"
            rx="1"
            fill="currentColor"
            className="dte-cell-1 text-primary"
          />
          <rect
            x="52"
            y="52"
            width="24"
            height="12"
            rx="1"
            fill="currentColor"
            className="dte-cell-2 text-primary"
          />
          <rect
            x="78"
            y="52"
            width="23"
            height="12"
            rx="1"
            fill="currentColor"
            className="dte-cell-3 text-primary"
          />
          <rect
            x="27"
            y="65"
            width="23"
            height="12"
            rx="1"
            fill="currentColor"
            className="dte-cell-4 text-primary"
          />
          <rect
            x="52"
            y="65"
            width="24"
            height="12"
            rx="1"
            fill="currentColor"
            className="dte-cell-5 text-primary"
          />
          <rect
            x="78"
            y="65"
            width="23"
            height="12"
            rx="1"
            fill="currentColor"
            className="dte-cell-6 text-primary"
          />

          {/* Header row */}
          <rect
            x="26"
            y="38"
            width="76"
            height="13"
            rx="1"
            fill="currentColor"
            className="text-muted-foreground/10"
          />
          <rect
            x="29"
            y="41.5"
            width="18"
            height="6"
            rx="2"
            fill="currentColor"
            className="text-muted-foreground/25"
          />
          <rect
            x="54"
            y="41.5"
            width="14"
            height="6"
            rx="2"
            fill="currentColor"
            className="text-muted-foreground/20"
          />
          <rect
            x="80"
            y="41.5"
            width="18"
            height="6"
            rx="2"
            fill="currentColor"
            className="text-muted-foreground/25"
          />

          {/* Radar scan arm */}
          <g className="dte-scan-arm">
            <line
              x1="64"
              y1="64"
              x2="108"
              y2="64"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Scan gradient fill — approximated with a triangle */}
            <path
              d="M64 64 L108 64 A44 44 0 0 0 64 20 Z"
              fill="currentColor"
              className="text-primary"
              opacity="0.06"
            />
          </g>

          {/* Center dot */}
          <circle
            cx="64"
            cy="64"
            r="3"
            fill="currentColor"
            className="text-primary"
          />
          <circle
            cx="64"
            cy="64"
            r="1.5"
            fill="currentColor"
            className="text-background"
          />

          {/* Floating escaped data dots */}
          <circle
            cx="18"
            cy="28"
            r="3.5"
            fill="currentColor"
            className="dte-dot-1 text-primary/40"
          />
          <circle
            cx="112"
            cy="34"
            r="2.5"
            fill="currentColor"
            className="dte-dot-2 text-primary/30"
          />
          <circle
            cx="108"
            cy="98"
            r="4"
            fill="currentColor"
            className="dte-dot-3 text-muted-foreground/30"
          />
          <circle
            cx="14"
            cy="92"
            r="2"
            fill="currentColor"
            className="dte-dot-4 text-primary/25"
          />
          <circle
            cx="64"
            cy="112"
            r="3"
            fill="currentColor"
            className="dte-dot-5 text-muted-foreground/25"
          />

          {/* Small cross marks at escaped dot positions */}
          <g className="dte-dot-1 text-primary/30">
            <line
              x1="26"
              y1="16"
              x2="26"
              y2="22"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="23"
              y1="19"
              x2="29"
              y2="19"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
          <g className="dte-dot-3 text-muted-foreground/20">
            <line
              x1="118"
              y1="106"
              x2="118"
              y2="112"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="115"
              y1="109"
              x2="121"
              y2="109"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Text */}
      <div className="dte-text-block space-y-2 text-center">
        <p className="text-lg font-semibold tracking-widest text-muted-foreground/60 uppercase">
          Sem resultados
        </p>
        <p className="text-md leading-relaxed text-muted-foreground/40">
          Tente ajustar seus filtros ou termos de pesquisa.
        </p>
      </div>
    </div>
  )
}
