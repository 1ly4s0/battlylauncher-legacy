const builder = require('electron-builder');
const obfuscator = require('javascript-obfuscator');
const fs = require('fs-extra');
const path = require('path');
const { productname } = require('./package.json');

// Función para obfuscar un archivo
async function obfuscateFile(filePath) {
    try {
        const code = await fs.readFile(filePath, 'utf-8');
        const obfuscatedCode = obfuscator.obfuscate(code, { /* opciones de obfuscator */ }).getObfuscatedCode();
        await fs.writeFile(filePath, obfuscatedCode);
        console.log(`✅ Código obfuscado correctamente: ${filePath}`);
    } catch (error) {
        console.error(`Error al obfuscar el archivo ${filePath}`, error);
    }
}

// Función para obfuscar todos los archivos .js en el directorio src
async function obfuscateSrc() {
    try {
        const srcPath = './src';
        const files = await fs.readdir(srcPath);

        // Filtrar solo archivos .js
        const jsFiles = files.filter(file => path.extname(file) === '.js');

        // Obfuscar cada archivo .js
        await Promise.all(jsFiles.map(file => obfuscateFile(path.join(srcPath, file))));
    } catch (error) {
        console.error('Error al obfuscar el código', error);
    }
}
// Ejecutar la obfuscación antes de construir
obfuscateSrc().then(() => {

    builder.build({
        config: {
            publish: [
                {
                    provider: "github",
                    owner: "1ly4s0",
                    repo: "battlylauncher-legacy",
                    releaseType: "release"
                }
            ],
            generateUpdatesFilesForAllChannels: true,
            appId: productname,
            productName: productname,
            artifactName: '${productName}-${os}-${arch}.${ext}',
            files: ["src/**/*", "package.json", "LICENSE.md"],
            directories: { "output": "dist" },
            compression: 'maximum',
            asar: false,
            //asar unpack de 7zip-bin
            asarUnpack: [
                "node_modules/7zip-bin/**/*",
                "node_modules/7zip/**/*",
            ],
            win: {
                icon: "./src/assets/images/icon.ico",
                target: [{
                    target: "nsis",
                    arch: ["x64", "ia32"]
                }]
            },
            nsis: {
                oneClick: false,
                allowToChangeInstallationDirectory: true,
                createDesktopShortcut: true,
                runAfterFinish: true,
                installerLanguages: ['es'],
                multiLanguageInstaller: true,
                license: "./LICENSE.md",
            }
        }
    }).then(() => {
        console.log('✅ El build se ha realizado correctamente.')
    }).catch(err => {
        console.error('Error al realizar el build', err)
    })
});