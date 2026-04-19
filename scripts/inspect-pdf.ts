import { readFileSync } from 'node:fs'
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } from 'pdf-lib'

async function main() {
  const bytes = readFileSync('src/assets/forms/50-132.pdf')
  const pdf = await PDFDocument.load(bytes)
  const form = pdf.getForm()
  const fields = form.getFields()

  console.log(`Found ${fields.length} AcroForm fields`)
  for (const f of fields) {
    console.log(JSON.stringify({ name: f.getName(), type: f.constructor.name }))
  }

  // Extra diagnostics — useful when a template turns out to be non-interactive.
  // Documents whether the PDF is flat, XFA-only, or truly has empty AcroForm.
  const catalog = pdf.catalog
  const acroForm = catalog.lookup(PDFName.of('AcroForm'))
  console.log(`\nAcroForm dict present: ${acroForm !== undefined}`)
  if (acroForm instanceof PDFDict) {
    const xfa = acroForm.lookup(PDFName.of('XFA'))
    console.log(`XFA present: ${xfa !== undefined}`)
    const fieldsEntry = acroForm.lookup(PDFName.of('Fields'))
    if (fieldsEntry instanceof PDFArray) {
      console.log(`AcroForm /Fields array length: ${fieldsEntry.size()}`)
    }
  }

  const pages = pdf.getPages()
  console.log(`\nPage count: ${pages.length}`)
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const annots = page.node.lookup(PDFName.of('Annots'))
    let widgetCount = 0
    let otherCount = 0
    if (annots instanceof PDFArray) {
      for (let j = 0; j < annots.size(); j++) {
        const raw = annots.get(j)
        const a = raw instanceof PDFRef ? pdf.context.lookup(raw) : raw
        if (a instanceof PDFDict) {
          const subtype = a.lookup(PDFName.of('Subtype'))
          if (subtype instanceof PDFName && subtype.asString() === '/Widget') widgetCount++
          else otherCount++
        }
      }
    }
    const { width, height } = page.getSize()
    console.log(
      `  page ${i + 1}: ${width.toFixed(1)} x ${height.toFixed(1)} pt, ${widgetCount} widget(s), ${otherCount} other annotation(s)`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
