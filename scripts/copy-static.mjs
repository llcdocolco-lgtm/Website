import { cpSync, mkdirSync, existsSync } from 'fs'

const targets = [
  { src: 'data', dest: 'dist/data' },
  { src: 'img',  dest: 'dist/img'  },
]

for (const { src, dest } of targets) {
  if (existsSync(src)) {
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true })
    console.log(`copied ${src}/ → ${dest}/`)
  }
}
