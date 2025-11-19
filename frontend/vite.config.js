// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),

    // Copy _redirects into dist after build
    {
      name: "copy-redirects",
      closeBundle() {
        const src = path.resolve(__dirname, "public/_redirects")
        const dest = path.resolve(__dirname, "dist/_redirects")

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
          console.log("✔ _redirects file copied to dist/")
        } else {
          console.log("⚠ _redirects file not found in public/")
        }
      }
    }
  ]
})
