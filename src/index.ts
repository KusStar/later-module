import { existsSync, readFileSync, promises as pfs } from 'fs';
import pacote, { Options } from 'pacote'
import { join } from 'path';
import Module from 'module'
import semver from 'semver'

const DEFAULT_CWD = process.cwd()

const LOCKFILE_NAME = 'later-lock.json'

interface LaterLock {
  [key: string]: string
}

type ModuleName = string
type Version = string

export class LaterModule {
  installed: Map<ModuleName, Version>

  #root: string;
  #module: Module
  #preferLock: boolean
  #lockfile: string
  #pacoteOptions?: Options
  #alwaysFetchRemote: boolean

  constructor({
    /**
     * current working library
     * @default process.cwd()
     */
    cwd = DEFAULT_CWD,
    /**
     * root directory of the project
     * @default './later-modules'
     */
    rootPath = './later-modules',
    /**
     * prefer lock file
     * @default true
     */
    preferLock = true,
    /**
     * pcoteOptions
     * @default undefine
     */
    pacoteOptions = undefined,
    /**
     * always fetch package from remote when version is not specified
     * @default false
     */
    alwaysFetchRemote = false
  } = {}) {
    this.installed = new Map()
    this.#root = join(cwd, rootPath, './node_modules');
    this.#preferLock = preferLock
    this.#pacoteOptions = pacoteOptions
    this.#alwaysFetchRemote = alwaysFetchRemote

    if (preferLock) {
      this.#lockfile = join(cwd, rootPath, LOCKFILE_NAME)
      this.#loadLock()
    }

    this.#module = new Module('', undefined)
    this.#module.paths = [this.#root]
  }

  #loadLock() {
    if (existsSync(this.#lockfile)) {
      const lockJson = JSON.parse(readFileSync(this.#lockfile).toString()) as LaterLock
      for (const [pkg, version] of Object.entries(lockJson)) {
        this.installed.set(pkg, version)
      }
    }
  }

  async #writeLock() {
    if (!this.#preferLock) return
    const data = {}
    Array.from(this.installed.entries()).forEach(([pkg, version]) => {
      data[pkg] = version
    })
    return pfs.writeFile(this.#lockfile, JSON.stringify(data, null, 2), 'utf-8')
  }

  #moduleName(name: string, version?: string) {
    return version ? `${name}@${version}` : name
  }

  #dest(name: string) {
    return join(this.#root, './', name)
  }

  async freshInstall(name: string, version: string | undefined, fetchList: any[]) {
    const module = this.#moduleName(name, version)
    const { dependencies, version: remoteVersion } = await pacote.manifest(module, this.#pacoteOptions)
    this.installed.set(name, remoteVersion)
    if (dependencies) {
      for (const [pkg, version] of Object.entries(dependencies)) {
        if (!this.installed.has(pkg)) {
          fetchList.push(this.#install(pkg, version))
          this.installed.set(pkg, version)
        }
      }
    }
    fetchList.push(pacote.extract(this.#moduleName(name, version), this.#dest(name), this.#pacoteOptions))
  }

  async #install(name: string, version?: string) {
    const fetchList = []
    if (!this.installed.has(name)) {
      await this.freshInstall(name, version, fetchList)
    } else {
      if (version) {
        await this.freshInstall(name, version, fetchList)
      } else {
        if (this.#alwaysFetchRemote) {
          const module = this.#moduleName(name, version)
          const { version: remoteVersion } = await pacote.manifest(module, this.#pacoteOptions)
          if (semver.gt(remoteVersion, this.installed.get(name))) {
            console.log('fetch remote', module)
            await this.freshInstall(name, remoteVersion, fetchList)
          }
        }
      }
    }
    return Promise.all(fetchList)
  }

  async install(name: string, version?: string) {
    await this.#install(name, version)
    return this.#writeLock()
  }

  require<T>(name: string): T | undefined {
    try {
      const required = this.#module.require(name) as T
      return required
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  async installAndRequire<T>(name: string, version?: string): Promise<T | undefined> {
    await this.install(name, version)
    return this.require<T>(name)
  }
}

export default LaterModule