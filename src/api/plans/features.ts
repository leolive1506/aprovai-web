export const FEATURES = {
  HEATMAP:    'heatmap',
  CSV_EXPORT: 'csv_export',
  CSV_IMPORT: 'csv_import',
  WIDGET:     'widget',
} as const

export type FeatureSlug = (typeof FEATURES)[keyof typeof FEATURES]

export const FEATURE_LABELS: Record<FeatureSlug, string> = {
  [FEATURES.HEATMAP]:    'Mapa de calor',
  [FEATURES.CSV_EXPORT]: 'Exportação CSV',
  [FEATURES.CSV_IMPORT]: 'Importação CSV',
  [FEATURES.WIDGET]:     'Widget para site',
}
