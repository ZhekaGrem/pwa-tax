import { readdirSync, readFileSync } from 'node:fs'
import { z } from 'zod'
import { CompSchema } from '../src/schemas/appeal'

const dir = 'public/data/comps'
let hadError = false
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.json')) continue
  const data = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'))
  const parsed = z.array(CompSchema).safeParse(data)
  if (!parsed.success) {
    console.error(`INVALID: ${file}`, parsed.error.issues)
    hadError = true
    continue
  }
  console.log(`OK ${file}: ${parsed.data.length} comps`)
}
process.exit(hadError ? 1 : 0)
