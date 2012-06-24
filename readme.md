Crossweb
========

Crossweb is configuration web framework base on JSP style in Java.

Installation
============

    sudo npm install -g crossweb
    
How to use
==========

After install crossweb, generate package with `cw generate <project name>`. Crossweb will create 
directory with file and folder structure that needs to run service. File structure is like below.

    - client
    - server
     - app.js
     - config-default.json
    - package.json
    
There have two ways to run application.

- via app.js by `node server/app.js` directly.
- `cw <project name>`
  
It can run with specific ip and port with `-address` and `-port` argument.
