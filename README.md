# KYR Utils
This library contains a number of "utility" functions used in KYR projects. Please feel free to use!

I've listed the functions available and their general usage below.

## Tar(Zst)Builder 
This builder function is used to walk relevant (and optional) project dir's, collecting project files into a .tar.zst archive. 

This script assumes it'll be executed from inside the `./dist` folder of your project. Use the tarBuildOptions class in your build script to control the builder. 

There's also then room for additional Dir's to be walked. Some of the preset Dir options have filters in place.

FILTERS
The basem dir walker will grab the Package files (Note: The override env option will grab any .env file from the project base dir when selected.)
The `./dist` walker has a default filter to ignore any scripts containing the string `deploy` - To stop server uploads of compiled deploy scripts.
The optional Data Dir will filter any ( .yml | .yaml | .json | .xml | .ini | .csv ) files
The optional Prisma Dir will only select files with the .prisma extention.
The optional WebServer filter will ignore any files ending with `*.ts` - This is to walk and collect all templates, static resources and css files.
The options Additional Dirs list has no filters and will walk and collect everything from all dir's in this list.


### Tar(Zst)Builder - Project Structure
Described here is the typical suggested structure for use of this tool. 

Following this will allow you to import and use the tarZstBuilder script for instant server deployment via a tar.zst file.

projectRoot ->                  ./
projectRoot/.env ->             .env config files. *OPTIONAL*
projectRoot/data ->             Static datafiles for apps (YAML / JSON etc.) *OPTIONAL*
projectRoot/primsa ->           Static prisma files for ORM usage (schema etc.) *OPTIONAL*
projectRoot/src ->              Local deploy script (imports this and compiles to `./dist`) & project TS files
projectRoot/src/webServer ->    SubFolder for Webserver.ts files, /views, /static dirs  *OPTIONAL*

## Tools
General/Generic Tools

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
Return a UI friendly date-stamp ("en-gb") from a String | Number | Date

### dateTimeFSString
Return a FileSystem friendly date-stamp ("en-gb") from a String | Number | Date