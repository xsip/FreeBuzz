import {inject, Injectable} from '@angular/core';
import {GamePlayStore} from './stores/gameplay.store';
import OpenDialogReturnValue = Electron.OpenDialogReturnValue;
import {DialogStore} from './stores/dialog.store';

const fs: typeof import('fs') = window.require("fs");
const {ipcRenderer}: typeof import('electron') = window.require('electron');
const path: typeof import('path') = window.require("path");


@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  gamePlayStore = inject(GamePlayStore);
  filesInSelectedFolder: { path: string; name: string; }[] = [];
  selectedFolder = false;
  setupDone = false;
  dialogStore = inject(DialogStore);
  selectPlaylist(file: { path: string; name: string; }) {
    this.gamePlayStore.setSelectedPlayList(JSON.parse(fs.readFileSync(file.path, 'utf-8')), true);
    this.setupDone = true;
  }

  async parsePlaylist(playlistId: string) {
    const res: 'canceled' | 'success' |string = await ipcRenderer.invoke('parsePlaylist', playlistId);
    if(res === 'success') {
      this.dialogStore.showDialog({
        title: 'Playlist download success!',
        description: 'Playlist saved successfully',
        style: 'success',
        onClose: () => {}
      })
    } else if(res == 'canceled'){
      this.dialogStore.showDialog({
        title: 'Playlist download aborted!',
        description: '',
        style: 'info',
        onClose: () => {}
      })
    } else {
      this.dialogStore.showDialog({
        title: 'Playlist download error!',
        description: res,
        style: 'error',
        onClose: () => {}
      })
    }
  }


  async selectFromFs(folder?: string) {
    const res: OpenDialogReturnValue = await ipcRenderer.invoke('select-folder', {
      title: 'Select folder containing playlists',
      defaultPath: this.gamePlayStore.freeBuzzFolder()
    });

    if (res.canceled)
      return;
    this.gamePlayStore.setFreeBuzzFolder(res.filePaths[0]);
    this.loadFromFilePath(res.filePaths[0])

  }

  loadFromFilePath(_path?: string) {
    if(!_path)
      return;
    console.log(_path);
    const files = fs.readdirSync(_path, {withFileTypes: true, recursive: true}).filter(fileOrFolder => {
      return fileOrFolder.isFile() && fileOrFolder.name.includes('.json')
    }).map(file => {
      return {path: path.join(file.path, file.name), name: file.name};
    })
    this.selectedFolder = true;
    this.filesInSelectedFolder = files;
    console.log(files);
  }

  resetPlaylist() {

    this.setupDone = false;
    this.selectedFolder = false;
    this.filesInSelectedFolder = [];
    this.gamePlayStore.setSelectedPlayList();
  }

}
