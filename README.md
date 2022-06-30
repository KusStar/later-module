# lazy-module

> Download and load npm module lazily

## Usage

### Install

```sh
npm i lazy-module
# or
yarn add lazy-module
# or
pnpm add lazy-module
```

### Example

```js
// Commonjs
const LazyModule = require('lazy-module')
// ES6
import LazyModule from 'lazy-module'

const lazyModule = new LazyModule()

const someModule = lazyModule.installAndRequire('some-module')

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
     * @default './mincu-lazy-modules'
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
    alwaysFetchRemote }: {
        cwd?: string;
        rootPath?: string;
        preferLock?: boolean;
        pacoteOptions?: any;
        alwaysFetchRemote?: boolean;
    });
    freshInstall(name: string, version: string, fetchList: any[]): Promise<void>;
    install(name: string, version?: string): Promise<void>;
    require(name: string): any;
    installAndRequire(name: string, version?: string): Promise<any>;
}

export { LazyModule, LazyModule as default };
```

## License

- [MIT](./LICENSE)
