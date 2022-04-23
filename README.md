# simple-lootsheet-5e

FoundryVTT module for creating and managing simple and easy loot sheets.

## Development

### Dev board

The kanban board can be found here:
https://trello.com/b/nvXXmrJx/simple-loot-sheet-5e

### Development environment

For a simple development environment add a symlink from the "dist/PROJECT_NAME" directory of this repository into your FoundryVTT modules dir.

#### MacOS example

```
ln -s ~/src/simple-lootsheet-5e/dist/simple-lootsheet-5e/ /Users/Beaver/Library/Application\ Support/FoundryVTT/Data/modules
```

#### Windows exmaple

```
mklink /D C:/Beaver/src/simple-lootsheet-5e/dist/simple-lootsheet-5e/	C:/Programs/FoundryVTT/Modules/
```

#### Build

To build the project execute `yarn run build` or for a distribution build `yarn run build-dist`.
