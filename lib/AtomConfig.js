/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AtomConfig;
const path = require('path');
const process = require('process');
const mkdirp = require('mkdirp');

const Config = require('./Config');

module.exports =

//#*
// Config that retrieves its settings from Atom's config.
//#
(AtomConfig = (function() {
    AtomConfig = class AtomConfig extends Config {
        static initClass() {
            /**
             * The name of the package to use when searching for settings.
            */
            this.prototype.packageName = null;

            /**
             * @var {Array}
            */
            this.prototype.configurableProperties = null;
        }

        /**
         * @inheritdoc
        */
        constructor(packageName) {
            super();

            this.packageName = packageName;
            this.configurableProperties = [
                'core.phpExecutionType',
                'core.phpCommand',
                'core.memoryLimit',
                'core.additionalDockerVolumes',
                'general.indexContinuously',
                'general.additionalIndexingDelay',
                'datatips.enable',
                'signatureHelp.enable',
                'gotoDefinition.enable',
                'autocompletion.enable',
                'annotations.enable',
                'refactoring.enable',
                'linting.enable',
                'linting.showUnknownClasses',
                'linting.showUnknownMembers',
                'linting.showUnknownGlobalFunctions',
                'linting.showUnknownGlobalConstants',
                'linting.showUnusedUseStatements',
                'linting.showMissingDocs',
                'linting.validateDocblockCorrectness'
            ];

            this.attachListeners();
        }

        /**
         * @inheritdoc
        */
        load() {
            this.set('storagePath', this.getPathToStorageFolderInRidiculousWay());

            return Array.from(this.configurableProperties).map((property) =>
                this.set(property, atom.config.get(`${this.packageName}.${property}`)));
        }

        /**
         * Attaches listeners to listen to Atom configuration changes.
        */
        attachListeners() {
            return (() => {
                const result = [];
                for (let property of Array.from(this.configurableProperties)) {
                // Hmmm, I thought CoffeeScript automatically solved these variable copy bugs with function creation in
                // loops...
                    const callback = (function(propertyCopy, data) {
                        return this.set(propertyCopy, data.newValue);
                    }).bind(this, property);

                    result.push(atom.config.onDidChange(`${this.packageName}.${property}`, callback));
                }
                return result;
            })();
        }

        /**
         * @return {String}
        */
        getPathToStorageFolderInRidiculousWay() {
            // NOTE: Apparently process.env.ATOM_HOME is not always set for whatever reason and this ridiculous workaround
            // is needed to fetch an OS-compliant location to store application data.
            let baseFolder = null;

            if (process.env.APPDATA) {
                baseFolder = process.env.APPDATA;

            } else if (process.platform === 'darwin') {
                baseFolder = process.env.HOME + '/Library/Preferences';

            } else {
                baseFolder = process.env.HOME + '/.cache';
            }

            const packageFolder = baseFolder + path.sep + this.packageName;

            mkdirp.sync(packageFolder);

            return packageFolder;
        }
    };
    AtomConfig.initClass();
    return AtomConfig;
})());