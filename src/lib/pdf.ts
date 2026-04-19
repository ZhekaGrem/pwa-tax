import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { Appeal } from '@/schemas/appeal'
import { PdfGenerationError } from './errors'

const TEMPLATE_PATH = path.join(process.cwd(), 'src/assets/forms/50-132.pdf')

// Approximate coordinates on page 1 of the HCAD-sourced 50-132 template
// (US Letter, 612x792 pt). The bundled template is flat (no AcroForm fields;
// see src/lib/pdf-schema.ts), so we draw text directly on page 1. Tuning was
// eyeballed against a visual reference; refine these by printing the output
// and measuring against the actual form. (0,0) is the bottom-left corner
// per PDF convention.
type Coord = { x: number; y: number }
const FIELD_COORDS: Record<string, Coord> = {
  ownerName: { x: 70, y: 615 },
  propertyAddress: { x: 70, y: 575 },
  parcelId: { x: 70, y: 535 },
  taxYear: { x: 470, y: 700 },
  currentValue: { x: 350, y: 360 },
  proposedValue: { x: 470, y: 360 },
  signatureName: { x: 70, y: 90 },
  signatureDate: { x: 470, y: 90 },
}

export async function fillForm50132(appeal: Appeal, signatureName: string): Promise<Uint8Array> {
  let bytes: Buffer
  try {
    bytes = await readFile(TEMPLATE_PATH)
  } catch (e) {
    throw new PdfGenerationError(`Template not found at ${TEMPLATE_PATH}: ${(e as Error).message}`)
  }

  const pdf = await PDFDocument.load(bytes)
  const page = pdf.getPages()[0]
  if (!page) throw new PdfGenerationError('Template has no pages')

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const draw = (key: keyof typeof FIELD_COORDS, value: string) => {
    const { x, y } = FIELD_COORDS[key]
    page.drawText(value, { x, y, size: 11, font, color: rgb(0, 0, 0) })
  }

  draw('ownerName', signatureName)
  draw('propertyAddress', appeal.property.address)
  draw('parcelId', appeal.property.parcelId)
  draw('taxYear', String(appeal.year))
  draw('currentValue', `$${appeal.assessment.currentAssessedValue.toFixed(0)}`)
  draw('proposedValue', `$${(appeal.calculation?.proposedValue ?? 0).toFixed(0)}`)
  draw('signatureName', signatureName)
  draw('signatureDate', new Date().toISOString().slice(0, 10))

  return pdf.save()
}
