# later-module

> Install and load npm module later

## Usage

### Install

```sh
npm i later-module
# or
yarn add later-module
# or
pnpm add later-module
```

### Example

```js
// Commonjs
const LaterModule = require('later-module')
// ES6
import LaterModule from 'later-module'

const laterModule = new LaterModule()

const someModule = laterModule.installAndRequire('some-module')

someModule.theMethod();
```

## Interfaces

```ts
declare type ModuleName = string;
declare type Version = string;
declare class LazyModule {
    #private;
    installed: Map<ModuleName, Version>;
    constructor({ 
    /**
     * current working library
     * @default process.cwd()
     */
    cwd, 
    /**
     * root directory of the project
     * @default './later-modules'
     */
    rootPath, 
    /**
     * prefer lock file
     * @default true
     */
    preferLock, 
    /**
     * pcoteOptions
     * @default undefine
     */
    pacoteOptions, 
    /**
     * always fetch package from remote when version is not specified
     * @default false
     */
    alwaysFetchRemote }?: {
        cwd?: string;
        rootPath?: string;
        preferLock?: boolean;
        pacoteOptions?: any;
        alwaysFetchRemote?: boolean;
    });
    freshInstall(name: string, version: string | undefined, fetchList: any[]): Promise<void>;
    install(name: string, version?: string): Promise<void>;
    require(name: string): any;
    installAndRequire(name: string, version?: string): Promise<any>;
}

export { LazyModule, LazyModule as default };
```

## License

- [MIT](./LICENSE)
