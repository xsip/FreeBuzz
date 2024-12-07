"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
// @ts-ignore
const sanitize = require("sanitize-filename");
// const debug =  import('electron-debug');
// @ts-ignore
const http = require("http");
const yt = require('youtube-search-api');
//@ts-ignore
const mime = require("mime");
let win = null;
const args = process.argv.slice(1), serve = args.some(val => val === '--serve');
console.log('Serve ', serve);
electron_1.ipcMain.handle('select-folder', (event, arg) => {
    return electron_1.dialog.showOpenDialog({
        properties: ['openDirectory', 'showHiddenFiles'],
        title: arg.title,
        defaultPath: arg.defaultPath
    });
});
electron_1.ipcMain.handle('parsePlaylist', (event, playlistId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield electron_1.dialog.showOpenDialog({
        properties: ['openDirectory', 'showHiddenFiles'],
        title: 'Select folder where to save playlist',
        defaultPath: 'C:\\FreeBuzz'
    });
    if (res.canceled)
        return 'canceled';
    try {
        const playlistData = yield yt.GetPlaylistData(playlistId, 1000);
        fs.writeFileSync(`${res.filePaths[0]}/${sanitize(playlistData.metadata.playlistMetadataRenderer.title)}.json`, JSON.stringify(playlistData, null, 2), 'utf-8');
        return 'success';
    }
    catch (e) {
        return e;
    }
}));
electron_1.ipcMain.handle('restart', () => {
    const exec = require('child_process').exec;
    exec(process.argv.join(' ')); // execute the command that was used to run the app
    setTimeout(function () {
        electron_1.app.quit();
    }, 50); // wait 50ms before killing the app
});
electron_1.ipcMain.handle('close', () => {
    electron_1.app.quit();
});
electron_1.ipcMain.handle('minimize', () => {
    win.minimize();
});
let server;
function createWindow() {
    const size = electron_1.screen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: 1280,
        resizable: true,
        height: 720,
        titleBarStyle: 'hidden',
        frame: false,
        transparent: true,
        roundedCorners: true,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: (serve),
            contextIsolation: false,
            webSecurity: false
        },
    });
    // We set an intercept on incoming requests to disable x-frame-options
    // headers.
    win.webContents.session.webRequest.onHeadersReceived({ urls: ["*://*/*"] }, (d, c) => {
        var _a, _b;
        if ((_a = d.responseHeaders) === null || _a === void 0 ? void 0 : _a['X-Frame-Options']) {
            delete d.responseHeaders['X-Frame-Options'];
        }
        else if ((_b = d.responseHeaders) === null || _b === void 0 ? void 0 : _b['x-frame-options']) {
            delete d.responseHeaders['x-frame-options'];
        }
        c({ cancel: false, responseHeaders: d.responseHeaders });
    });
    // win.webContents.openDevTools();
    win.setResizable(true);
    if (serve) {
        //    debug.default();
        require('electron-reloader')(module);
        win.loadURL('http://localhost:4200');
    }
    else {
        // Path when running electron executable
        let pathIndex = './index.html';
        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }
        //at start
        server = http.createServer((req, res) => {
            var _a;
            if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.includes('.js.map')) {
                res.setHeader("Content-Type", 'application/json');
                res.writeHead(200);
                res.end('{}');
                return;
            }
            const filePath = path.join(electron_1.app.getAppPath(), 'dist', req.url);
            const file = fs.readFileSync(filePath);
            // @ts-ignore
            res.setHeader("Content-Type", mime.getType(filePath));
            res.writeHead(200);
            res.end(file.toString());
        }).listen(1334);
        /*const port=21;
        const ftpServer = new FtpSrv({
          url: "ftp://0.0.0.0:" + port,
          anonymous: true
        });
    
        ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
            return resolve({ root:path.join(app.getAppPath(), 'dist') });
        });
    
        ftpServer.listen().then(() => {
          console.log('Ftp server is starting...')
        });*/
        //after app-ready event
        win.loadURL('http://localhost:1334/index.html');
        // const url = new URL(path.join('file:', __dirname, pathIndex));
        // win.loadURL(url.href);
    }
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    return win;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', () => setTimeout(createWindow, 400));
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', () => {
        if (server) {
            server.close();
        }
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', () => __awaiter(void 0, void 0, void 0, function* () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    }));
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map