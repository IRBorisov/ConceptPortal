import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // https: {
    //   key: fs.readFileSync('cert/portal-key.pem'),
    //   cert: fs.readFileSync('cert/portal-cert.pem'),
    // }
  }
})
