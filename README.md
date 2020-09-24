# tlib
fetch template from git repo

### USAGE
 `npx github:sha-m64/tlib -FLAG value ... file [file ...]`

#### FLAGS
 **-h**: help menu  
 **-r**: git repo  
 **-d**: target directory  

#### Example
 ```
 $ # fetch 'router.template.js' from 'sha-m64/templates', save it under current directory
 $ npx github:sha-m64/tlib -r sha-m64/templates router
 ```

 ```
 $ # save mentioned files under '/tmp/buzz' directory
 $ npx github:sha-m64/tlib -r sha-m64/templates -d /tmp/buzz router controller
 ```
