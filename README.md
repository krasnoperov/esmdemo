# Universal app with ES Modules

The goal of this repo is to find a way how to run the same code with ES Modules imports both on client and server - without babel and CJS requires. Check opened issues for progress.

The central part is universal preact application with CSS Modules, bundled images, and Flow types. The client bundle is build with Rollup. On the server, Babel processes code with ES Modules, and CJS Loader provides class names of CSS Modules and URLs for bundled images.

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

It is not as easy as to run with Babel, but still possible with some manipulations:

    # 1. Build client bundle:
    npm run build

    # 2. Add "type": "module" to package.json
    
    # 3. Run production service
    npm run esstart
    
    # 4. Open demo
    open http://localhost:3000/

Limitations:
* Flow types are not stripped
* Rollup and Node can't work with the same code because of different imports
* In development it is not possible to clear require cache and load new code for live edit
