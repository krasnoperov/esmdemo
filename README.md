# Universal app with ES Modules

The goal of this repo is to find a way how to run the same code with ES Modules imports both on client and server - without babel and CJS requires. Check opened issues for progress.

The central part is universal preact application with CSS Modules, bundled images, and Flow types. The client bundle is build with Rollup. On the server, Babel processes code with ES Modules, and CJS Loader provides class names of CSS Modules and URLs for bundled images.

## Run

Make sure you are using latest node version with ES Modules without flag.

Install dependencies:

    npm install

### Run with ESM in production

    # 1. Build client bundle:
    npm run build
    
    # 2. Run production service
    npm run start
    
    # 3. Open demo
    open http://localhost:3000/
    
### Run with ESM in development

    npm run dev
