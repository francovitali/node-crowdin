# node-crowdin
Synchronize with crowdin your gettext based PO files.
> This is a transitional package to sync with "m10e-service" instead of crowdin
> To migrate from previous versions replace old "crowdin.json" file with "i18n.json" described here

## Dependencies
This module works with [node-translator](https://github.com/pablonazareno/node-translator). So when scaning src file to get translations keys, look for its functions names.

## Instalation
npm install node-crowdin@0.1.0-transitional-i18n --save

## Configuration
Place a file named **i18n.json** in the root of your project with this information:
```javascript
{
	"app": "my-app-repository-name"
	"project": "my-translation-project-name",
	"srcPath": "classes"
}
```

> **name: application repository name** 
> Used to identify this application (usually the repository name). On force upload, only unused messages from THIS application will be removed

> **project: translation project name** 
> This is the name used by the Content Management (CM) team to identify the "translation projects" (think of this as a "group" tag). Request this name to CM team

> Note: is ok if different "applications" (repositories), share the same "project"

If you are using **Mac**, make sure you already have gettext available in your OS. If not, install it:

```bash
brew install gettext
brew link gettext --force
```

## Usage

### node-crowdin gettext
- Localy scan src path for source messages and generate keys file.

### node-crowdin upload [--force]
- Upload messages sources to translation service
> Warning: DO NOT USE force option! Otherwise all sources not present in the current upload will be removed from crowdin !!!

### node-crowdin download
- Download translations from translation service, into **i18n** directory.

## Migrate from previous versions

1) Update package to "node-crowdin:0.1.0-transitional-i18n"
2) Remove file "crowdin.json"
3) Add file "i18n.json" as:

```javascript
{
    "app": "github repository name",
    "project": "request new Babel project name to CM, sending the old Crowdin projectid",
    "srcPath": "same as crowdin.json"
}
```
