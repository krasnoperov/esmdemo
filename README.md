# Universal app with ES Modules

Universal preact application with:
 * CSS Modules
 * Bundled images
 * Flow types

Rollup is used to build code with ES modules for client-side. 

Babel is used to process ESM imports and strip flow types on server-side.

## Run

Make sure you are using latest node version with ES Modules without flag.

Install dependencies:

    npm install

### Run with Babel

    # run in development mode – rollup will be watching for changes
    npm run dev
    
    # or run in production mode
    npm run build 
    npm run start
    
    # open demo
    open http://localhost:3000/

### Run with ESM 

    # 1. Build client bundle:
    npm run build

    # 2. Add "type": "module" to package.json

    # 3. Replace named imports of external packages:
    # import { h } from 'preact'
    # with:
    # import preact from 'preact'
    # const { h } = preact 
    
    # 4. Run production service
    npm run esstart
    
    # 5. Open demo
    open http://localhost:3000/
