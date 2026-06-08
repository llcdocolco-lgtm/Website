import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveRootStatic() {
  return {
    name: 'serve-root-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent(req.url.split('?')[0])
        if (!url.startsWith('/data/') && !url.startsWith('/img/')) return next()
        const filePath = path.join(process.cwd(), url)
        if (!fs.existsSync(filePath)) return next()
        const ext = path.extname(filePath).toLowerCase()
        const mime = {
          '.json': 'application/json',
          '.png':  'image/png',
          '.jpg':  'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg':  'image/svg+xml',
          '.webp': 'image/webp',
          '.gif':  'image/gif',
        }
        res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveRootStatic()],
  server: { port: 3000 },
})
