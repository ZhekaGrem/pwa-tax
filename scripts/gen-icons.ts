import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

async function makeIcon(size: number, file: string, padding = 0) {
  const inner = size - padding * 2
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#0f172a" rx="${size * 0.18}"/>
      <text x="50%" y="55%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
            font-size="${inner * 0.42}" font-weight="700" fill="#ffffff"
            dominant-baseline="middle">PP</text>
    </svg>`
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  writeFileSync(file, buf)
  console.log(`wrote ${file}`)
}

async function main() {
  await makeIcon(192, 'public/icons/icon-192.png')
  await makeIcon(512, 'public/icons/icon-512.png')
  // Maskable: add safe-zone padding (about 10% inset)
  await makeIcon(512, 'public/icons/maskable-512.png', 50)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
