# Gatsby Empty Project

## Steps to code

1. Create a new directory by using `mkdir gatsbyfrontend`
2. Naviagte to the newly created directory using `cd gatsbyfrontend`
3. use `npm init` to initilize an yarn project in the directory which creates a package.json file with the following content
   ```json
   {
     "name": "gatsbyfrontend",
     "version": "1.0.0",
     "main": "index.js",
     "author": "Hassan Ali Khan",
     "license": "MIT",
     "private": true
   }
   ```
4. Install gatsby, react and react dom using `yarn add gatsby react react-dom`. This will update packge.json and create node_modules.json along with yarn.lock
5. update package.json to add scripts

   ```json
   "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build",
    "clean": "gatsby clean"
   }
   ```

6. create gatsby-config.js

   ```js
   module.exports = {
     plugins: [],
   };
   ```

7. create "src/pages/index.tsx"

   ```js
   import React from "react";
   export default function Home() {
     return <div>Home Page</div>;
   }
   ```

8. create "src/pages/404.tsx"

   ```js
   import React from "react";
   export default function Error() {
     return <div>Error Page</div>;
   }
   ```

9. create "static/favicon.ico"

10. create ".gitignore"

    ```
    node_modules/
    .cache
    public/
    ```

11. To run the site use `gatsby develop`
12. Deployemnt will be done through CI/CD
