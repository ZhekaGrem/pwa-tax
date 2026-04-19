// Mapping human-readable keys to Form 50-132 internal field names.
// Generated 2026-04-19 by running scripts/inspect-pdf.ts against the
// HCAD-sourced template (src/assets/forms/50-132.pdf).
// Re-run `npm run inspect:pdf` if the template is replaced.
//
// INSPECTION RESULT: the HCAD-sourced 2023 revision has ZERO fillable
// AcroForm fields. The /AcroForm dict exists but /Fields is empty, there
// are no Widget annotations on either page, and no XFA stream is present.
// In other words, HCAD ships a flat, print-and-sign PDF rather than the
// interactive one that comptroller.texas.gov usually publishes.
//
// Consequence for Task 19 (pdf.ts):
//   We cannot use `form.getTextField(...).setText(...)`. Task 19 must draw
//   text directly with `page.drawText(value, { x, y, size, font })` at
//   hard-coded coordinates measured against the 2023 template. Page size
//   is US Letter (612 x 792 pt), two pages.
//
// Because there are no field names to map, every entry below is the empty
// string. Downstream code in pdf.ts should therefore branch on
// `PDF_MODE === 'overlay'` (see below) and skip AcroForm lookups entirely.
// If a future template revision ships with real AcroForm fields, re-run
// inspect:pdf, flip PDF_MODE to 'acroform', and fill in the names below.
export const PDF_FIELD_MAP = {
  OWNER_NAME: '',
  PROPERTY_ADDRESS: '',
  PARCEL_ID: '',
  YEAR: '',
  CURRENT_VALUE: '',
  PROPOSED_VALUE: '',
  SIGNATURE_NAME: '',
  SIGNATURE_DATE: '',
} as const

export type PdfFieldKey = keyof typeof PDF_FIELD_MAP

/**
 * How Task 19's pdf.ts should render the form.
 * - 'acroform': call form.getTextField(PDF_FIELD_MAP[key]).setText(value)
 * - 'overlay' : call page.drawText(value, coords) at measured coordinates
 *
 * The current bundled template is 'overlay' — see note above.
 */
export const PDF_MODE: 'acroform' | 'overlay' = 'overlay'
