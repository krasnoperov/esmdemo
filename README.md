# Universal app with ES Modules

Universal preact application with:
 * CSS Modules
 * Bundled images
 * Flow types

Rollup is used to build code with ES modules for client-side. 
Babel is used to process ESM imports and strip flow types on server-side.

## Run

Make sure you are using latest node with ES Modules without flag.

Install dependencies:

    npm install

### Run with Babel

    # run in development mode – rollup will be watching for changes
    npm run dev
    
    # or run in production mode
    npm run build 
    npm run start
    
    # open demo
    npm run http://localhost:3000/

### Run with ESM 

It would be great to run ES Modules on node without Babel:

    # run in development mode
    npm run esdev
    
    # or run in production mode
    npm run build 
    npm run esstart
    
    # open demo
    npm run http://localhost:3000/

Unfortunatelly it didn't work yet:

* Named imports are not working for rollup-pluginutils and preact:
   
    `import { h } from 'preact'` does not work in node
    `import preact from 'preact'; preact.h` does not work in rollup
    
* Flow types must not removed in node

