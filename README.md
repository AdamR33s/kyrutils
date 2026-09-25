# KYR Utils
This library contains a number of "utility" functions used in KYR projects. Please feel free to use!


### buildTar()
This builder function is used to walk optional project directories, collecting files into a .tar.zst archive. 

Use the `TarBuildOptions` class in your build script to control config. Some of the preset directory options have filters in place, there's also room for additional directories to be walked indiscriminately.
```text
FILTERS
The 'overrideEnv' directory walker will grab .env config files from the root of the project.
The 'distDir' directory walker will collect everything indiscriminately.
The 'dataDir' directory walker will filter any ( .yml | .yaml | .json | .xml | .ini | .csv ) files.
The 'prismaDir' directory walker will collect everything indiscriminately.
The 'webServerDir' directory walker will ignore any files ending with `*.ts` to collect all templates, static resources etc.
The 'additionalDirs' directory walker will collect everything indiscriminately from the list of dir's provided.
```

### BuildTarOptions
This object is built and then passed as an argument to the `buildTar()` function.
```cs
export type TarBuildOptions = {
  overrideEnv: boolean;
  distDir?: string;
  dataDir?: string;
  prismaDir?: string;
  webServerDir?: string;
  additionalDirs?: string[];
};
```


### buildKyrApiResponseObj<T>()
This builder function is a utility function for building response objects aligned to KYR's internal network structure.

### KyrApiResponse<T>
This is the typed object for responses.
```cs
export type KyrApiResponse<T> = {
  message: string | undefined;
  error: string | undefined;
  data: T | undefined;
}
```


#### Tar(Zst)Builder - Project Structure
Loose suggested structure to use the buildTar() utility for rapid server deployment via a .tar.zst archive.
```text
STRUCTURE
projectRoot:                    ./
projectRoot/.env ->             .env config files. 
prjectRoot/dist ->              Compiled/bundled files
projectRoot/data ->             Static datafiles for apps (YAML / JSON etc.)
projectRoot/prisma ->           Static prisma files for ORM usage (schema etc.)
projectRoot/src ->              Local deploy script (imports tarBuild() and compiles to `./dist`) & project TS files
projectRoot/webServer ->        Webserver.ts files, /views directory, /static directory
```

### getRandUUID()
Return a UUID from the Crypto library

### sleep()
Wait a defined number of seconds

### minutesElapsed()
Return a boolean from a Date object (time to judge from), and a number (number of minutes to check as passed since the Date object)

### hoursElapsed()
Return a boolean from a Date object (time to judge from), and a number (number of hours to check as passed since the Date object)

### shuffleArray()
Shuffle an Array using the Fisher-Yates algorithm

### chooseRandomFromArray()
Select a random element from an Array

### dateTimeUIString()
Return a UI-friendly date-stamp ("en-gb") from a String | Number | Date

### dateTimeFSString()
Return a filesystem-friendly date-stamp ("en-gb") from a String | Number | Date


# PREVIOUS VERSION NOTES

### kyrUtils v3.6.0
- KYRApiManager method changes

### kyrUtils v3.5.0
- KYRApiManager now responsible for connection creation, management, routing and deletion

### kyrUtils v3.4.1
- Export bug fix

### kyrUtils v3.4.0
- Added KYRApiConnectionsManager class for storing & controlling KyrApiConnection instances

### kyrUtils v3.3.0
- Added KyrApiConnections class for handling API connections internally

### kyrUtils v3.2.3
- Updated utility function for building API Response Obj with simplified names and code

### kyrUtils v3.2.2
- Updated utility function for building API Response Obj to accept options object for building with named fields

### kyrUtils v3.2.1
- Added utility function for building API Response Obj

### kyrUtils v3.1.1
- Added generic KyrApiResponse type for wrapping custom API responses

### kyrUtils v3.0.1
- adjusted the collection for additional dirs to preserve parent folder provided in path when building the archive

### kyrUtils v3.0.0
- Dist folder now optional and dir adjustable
- allows custom/part deployment scripts

### kyrUtils v2.1.1
- Fix an issue with files in dataDir being filtered out incorrectly

### kyrUtils v2.1.0
- Removed projFiles collection (move package files to dist through your script!)

### kyrUtils v2.0.9
- /prisma now collected indiscriminately 

### kyrUtils v2.0.8
- Bug fix for Prisma versions 7.x (Grabbing prisma.config.ts) from project root
- Version notes added to readme

### kyrUtils v2.0.7
- Added support for new Prisma versions 7.x

### kyrUtils v2.0.6
- Internal package manager changed to PNPM
- Removed async from date functions
- Removed async from tarBuild (refactored async compression function)
- Added PNPM compatibility to buildTar filters (pnpm-lock.yaml & pnpm-workspace.yaml)

### kyrUtils v2.0.5
- Function names updated
- Function descriptions updated

### kyrUtils v2.0.4
- Readme updated

### kyrUtils v2.0.3
- Readme updated

### kyrUtils v2.0.2
- Fixed import and require definitions
- Function names updated
- Function descriptions updated
- Readme updated

### kyrUtils v2.0.1
- Readme update

### kyrUtils v2.0.0
- Package.json update

### kyrUtils v2.0.0
- Changed name back 
- Corrected structure
- Added tsdown for packaging public libraries
- Commented all exported functions
- Moved to "entrypoint" file structure
- Cleaned dependencies
- Added env override option to tar builder

### kyrUtilsInternal v1.3.0
- Changed name to kyrUtilsInternal to allow public repo

### kyrUtils v1.2.0
- Added additional Dir's list option

### kyrUtils v1.1.0
- Update to grab project file (package & package-lock)

### kyrUtils v1.0.0
- Project Tar Building working for S.C.a.R.S and CM

















