import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import hooks from 'eslint-plugin-react-hooks'
export default tseslint.config(
  {ignores:['.next/**','.open-next/**','.wrangler/**','.data/**','node_modules/**','artifacts/**','src/payload-types.ts','src/app/(payload)/admin/importMap.js','src/migrations*/**','cloudflare-env.d.ts']},
  {files:['src/**/*.{ts,tsx}','tests/**/*.ts'],extends:[js.configs.recommended,...tseslint.configs.recommended],plugins:{'react-hooks':hooks},rules:{
    '@typescript-eslint/no-explicit-any':'off',
    '@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_',caughtErrors:'none',ignoreRestSiblings:true}],
    'react-hooks/rules-of-hooks':'error',
    'react-hooks/exhaustive-deps':'error',
    'no-empty':['error',{allowEmptyCatch:true}],
    'no-control-regex':'off',
  }}
)
