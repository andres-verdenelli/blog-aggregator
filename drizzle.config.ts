import { defineConfig } from 'drizzle-kit'
import { readConfig } from './src/config.ts'

const config = readConfig().dbUrl

export default defineConfig({
  schema: 'src/schema.ts',
  out: 'drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config,
  },
})
