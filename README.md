# simple-lootsheet-5e

FoundryVTT module for creating and managing simple and easy loot sheets.

## Development

### Dev board

The kanban board can be found here:
https://trello.com/b/nvXXmrJx/simple-loot-sheet-5e

### Development environment

For a simple development environment add a symlink from the root directory of this repository into your FoundryVTT modules dir.

#### MacOS example

```
ln -s ~/src/simple-lootsheet-5e/ /Users/Beaver/Library/Application\ Support/FoundryVTT/Data/modules
```

#### Windows exmaple

```
mklink /D C:/Beaver/src/simple-lootsheet-5e/	C:/Programs/FoundryVTT/Modules/
```

#### Build

Using the symlink / softlink, there is no need to build the module. Each change will be available after a refresh (F5 or command + R) of FoundryVTT.
