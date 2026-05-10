///////////////////////
/// Tar Zst Builder ///
///////////////////////

README
Import this builder into a local deployment script for projects to walk relevant (and optional) dir's and collect project files into a .tar.zst archive. 

This script assume's it'll be executed from inside the `./dist` folder of your project. It will automatically walk and collect all files and dir's from `./dist` maintaining their structure. 

There's also then room for 3 additional Dir's to be walked. The optional Dir's have specific filters...

FILTERS
The `./dist` walker has a default filter to ignore any scripts containing the string `deploy` - To stop server uploads of compiled deploy scripts.
The optional Data Dir has no filters and will walk and collect everything.
The optional Prisma Dir has no filters and will walk and collect everything.
The optional WebServer filter will ignore any files ending with `*.ts` - This is to walk and collect all templates, static resources and css files.
The options Additional Dirs list has no filters and will walk and collect everything from all dir's in this list.
The override env option will grab any .env file from the project base dir when selected.



/////////////////////////
/// PROJECT STRUCTURE ///
/////////////////////////

Described here is the typical suggested structure for use of this tool. 

Following this will allow you to import and use the tarZstBuilder script for instant server deployment via a tar.zst file.

projectRoot -> 

    projectRoot/infrastructure ->   Systemd files && apache configs
    projectRoot/data ->             Static datafiles for apps (YAML / JSON etc.) *OPTIONAL*
    projectRoot/primsa ->           Static prisma files for ORM usage (schema etc.) *OPTIONAL*
    projectRoot/src ->              Local deploy script (imports this and compiles to `./dist`) & project TS files
    projectRoot/.env                .env config files. *OPTIONAL*

        projectRoot/src/webServer ->        SubFolder for Webserver.ts files, /views, /static dirs  *OPTIONAL*
