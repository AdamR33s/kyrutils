# KYR Utils
This library contains a number of "utility" functions used in KYR projects. Please feel free to use!

I've listed the functions available and their general usage below.


### buildTar()
This builder function is used to walk relevant (and optional) project Dirs, collecting project files into a .tar.zst archive. 

This script assumes it will be executed from inside the `./dist` folder of your project.. Use the `TarBuildOptions` class in your build script to control config. Some of the preset Dir options have filters in place, there's also room for additional Dirs to be walked indiscriminately.
```text
FILTERS
The base directory walker will include package files (Note: The override env option will grab any .env file from the project base Dir when selected.)
The `./dist` walker has a default filter to ignore any scripts containing the string `deploy` - To stop server uploads of compiled deploy scripts.
The optional Data directory walker will filter any ( .yml | .yaml | .json | .xml | .ini | .csv ) files
The optional Prisma directory walker will only select files with the .prisma extension.
The optional WebServer directory walker will ignore any files ending with `*.ts` - This is to walk and collect all templates, static resources and css files.
The optional Additional directory walker has no filters and will walk and collect everything from all Dir's in this list.
```
#### Tar(Zst)Builder - Project Structure
Following this structure will allow you to import and use the buildTar() utility for rapid server deployment via a .tar.zst archive.
```text
STRUCTURE
projectRoot:                    ./
projectRoot/.env ->             .env config files. *OPTIONAL*
projectRoot/data ->             Static datafiles for apps (YAML / JSON etc.) *OPTIONAL*
projectRoot/prisma ->           Static prisma files for ORM usage (schema etc.) *OPTIONAL*
projectRoot/src ->              Local deploy script (imports this and compiles to `./dist`) & project TS files
projectRoot/src/webServer ->    SubFolder for Webserver.ts files, /views, /static Dirs  *OPTIONAL*
```

### getRandUUID
Return a UUID from the Crypto library

### sleep
Wait a defined number of seconds

### minutesElapsed
Return a boolean from a Date object (time to judge from), and a number (number of minutes to check as passed since the Date object)

### hoursElapsed
Return a boolean from a Date object (time to judge from), and a number (number of hours to check as passed since the Date object)

### shuffleArray
Shuffle an Array using the Fisher-Yates algorithm

### chooseRandomFromArray
Select a random element from an Array

### dateTimeUIString
Return a UI-friendly date-stamp ("en-gb") from a String | Number | Date

### dateTimeFSString
Return a filesystem-friendly date-stamp ("en-gb") from a String | Number | Date