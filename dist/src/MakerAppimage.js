"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker_base_1 = __importDefault(require("@electron-forge/maker-base"));
const path_1 = __importDefault(require("path"));
const appBuilder = __importStar(require("app-builder-lib/out/util/appBuilder"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const makerPackageName = "electron-forge-maker-appimage";
const isIForgeResolvableMaker = (maker) => {
    return maker.hasOwnProperty("name");
};
class MakerAppImage extends maker_base_1.default {
    constructor() {
        super(...arguments);
        this.name = "appImage";
        this.defaultPlatforms = ["linux"];
    }
    isSupportedOnCurrentPlatform() {
        return process.platform === "linux";
    }
    make(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dir, // '/home/build/Software/monorepo/packages/electron/out/name-linux-x64'
        appName, // 'name'
        makeDir, // '/home/build/Software/monorepo/packages/electron/out/make',
        targetArch, // 'x64'
        packageJSON, targetPlatform, //'linux',
        forgeConfig, }) {
            var _b;
            const executableName = forgeConfig.packagerConfig.executableName || appName;
            // Check for any optional configuration data passed in from forge config, specific to this maker.
            let config;
            const maker = forgeConfig.makers.find((maker) => isIForgeResolvableMaker(maker) && maker.name === makerPackageName);
            if (maker !== undefined && isIForgeResolvableMaker(maker)) {
                config = maker.config;
            }
            const appFileName = `${appName}-${packageJSON.version}.AppImage`;
            const appPath = path_1.default.join(makeDir, appFileName);
            // construct the desktop file.
            const desktopMeta = {
                Name: appName,
                Exec: executableName,
                Terminal: "false",
                Type: "Application",
                Icon: executableName,
                StartupWMClass: packageJSON.productName,
                "X-AppImage-Version": packageJSON.version,
                Comment: packageJSON.description,
                Categories: "Utility",
            };
            let desktopEntry = `[Desktop Entry]`;
            for (const name of Object.keys(desktopMeta)) {
                desktopEntry += `\n${name}=${desktopMeta[name]}`;
            }
            desktopEntry += "\n";
            // Use icon from config if provided, otherwise use packager config icon, otherwise fall back to hardcoded path
            let iconFile;
            if ((_b = config === null || config === void 0 ? void 0 : config.options) === null || _b === void 0 ? void 0 : _b.icon) {
                iconFile = path_1.default.resolve(config.options.icon);
            }
            else if (forgeConfig.packagerConfig.icon) {
                // Handle icon path from packager config (might be without extension for cross-platform compatibility)
                const packagerIcon = forgeConfig.packagerConfig.icon;
                iconFile = packagerIcon.endsWith(".png")
                    ? path_1.default.resolve(packagerIcon)
                    : path_1.default.resolve(`${packagerIcon}.png`);
            }
            // If we have a single icon file, use it for all sizes
            const icons = iconFile && (0, fs_1.existsSync)(iconFile)
                ? [{ file: iconFile, size: 512 }]
                : [
                    // Fallback to old hardcoded path structure if no icon configured
                    {
                        file: path_1.default.join(dir, "../../src/icons/linux/16x16.png"),
                        size: 16,
                    },
                    {
                        file: path_1.default.join(dir, "../../src/icons/linux/32x32.png"),
                        size: 32,
                    },
                    {
                        file: path_1.default.join(dir, "../../src/icons/linux/48x48.png"),
                        size: 48,
                    },
                    {
                        file: path_1.default.join(dir, "../../src/icons/linux/64x64.png"),
                        size: 64,
                    },
                    {
                        file: path_1.default.join(dir, "../../src/icons/linux/128x128.png"),
                        size: 128,
                    },
                    {
                        file: path_1.default.join(dir, "../../src/icons/linux/256x256.png"),
                        size: 256,
                    },
                ];
            const stageDir = path_1.default.join(makeDir, "__appImage-x64");
            if (!(0, fs_1.existsSync)(makeDir)) {
                (0, fs_1.mkdirSync)(makeDir, { recursive: true });
            }
            if ((0, fs_1.existsSync)(stageDir)) {
                (0, fs_1.rmdirSync)(stageDir);
            }
            (0, fs_1.mkdirSync)(stageDir, { recursive: true });
            // if the user passed us a chmodChromeSandbox parameter, use that to modify the permissions of chrome-sandbox.
            // this sets up the ability to run the application conditionally with --no-sandbox on select systems.
            if (config !== undefined && config.chmodChromeSandbox !== undefined) {
                yield (0, child_process_1.exec)(`chmod ${config.chmodChromeSandbox} ${path_1.default.join(dir, "chrome-sandbox")}`);
            }
            const args = [
                "appimage",
                "--stage", // '/home/build/Software/monorepo/packages/electron/out/make/__appImage-x64',
                stageDir,
                "--arch", // 'x64'
                "x64",
                "--output", // '/home/build/Software/monorepo/packages/electron/out/make/name-2.0.6.AppImage',
                appPath,
                "--app", // '/home/build/Software/monorepo/packages/electron/out/name-linux-x64',
                dir,
                "--configuration",
                JSON.stringify({
                    productName: appName,
                    productFilename: appName,
                    desktopEntry: desktopEntry,
                    executableName: executableName,
                    icons: icons,
                    fileAssociations: [],
                }),
            ];
            // the --template option allows us to replace AppRun bash script with a custom version, e.g. a libstdc++ bootstrapper.
            if (config !== undefined && config.template) {
                args.push("--template");
                args.push(config.template);
            }
            const result = yield appBuilder.executeAppBuilderAsJson(args);
            return [appPath];
        });
    }
}
exports.default = MakerAppImage;
//# sourceMappingURL=MakerAppimage.js.map