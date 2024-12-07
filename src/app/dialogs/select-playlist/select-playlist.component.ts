import {ChangeDetectorRef, Component, ComponentRef, inject, OnInit, viewChild, ViewContainerRef} from '@angular/core';
import {PlaylistService} from '../../playlist.service';
import {GamePlayStore} from '../../stores/gameplay.store';
import {fadeInOut} from '../../animations';
import {DialogComponent} from '../../ui/dialog/dialog.component';

@Component({
  selector: 'app-select-playlist',
  imports: [],
  animations: [fadeInOut('0.2s', '0.2s')],

  template: `
    @if (!playlistService.filesInSelectedFolder.length) {


      <div class="w-screen rounded-b-md h-[calc(100vh-3rem)] text-blue-200 bg-slate-700 flex flex-col items-center justify-center overflow-y-auto p-10">
        <h1 class="text-4xl">Please enter a youtube PlaylistID</h1>
        <div class="mt-5">
          <label for="first_name" class="block mb-2 text-sm font-medium text-blue-200 ">Playlist ID:</label>
          <input #playlistId (keyup)="detectChanges(playlistId.value)" type="text" id="first_name"
                 class="bg-gray-50 border border-gray-300 bg-slate-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                 placeholder="" required/>
        </div>
        <button [disabled]="!canFetch" (click)="playlistService.parsePlaylist(playlistId.value)"
                class="text-white mt-5 disabled:cursor-not-allowed disabled:bg-gray-500 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
          Parse Playlist
        </button>

        <h1 class="text-4xl mt-5 mb-5">Or select pre-parsed from filesystem</h1>
        <div class="flex gap-5 w-full justify-center">
          <button (click)="playlistService.selectFromFs()"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
            Select Folder
          </button>
          <button (click)="playlistService.loadFromFilePath(freeBuzzFolder())"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
            Use {{ freeBuzzFolder() }}
          </button>
        </div>


      </div>

    } @else {
      <div class="w-screen  rounded-b-md h-[calc(100vh-3rem)] text-blue-200 bg-slate-700 flex flex-col overflow-y-auto p-10">
        <button (click)="playlistService.filesInSelectedFolder = []; playlistService.selectedFolder = false"
                class="text-white  mb-10 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
          Go Back
        </button>
        <div class="grid grid-cols-2 gap-5">
          @for (file of playlistService.filesInSelectedFolder; track $index) {
            <div
              (click)="playlistService.selectPlaylist(file)"
              class="bg-blue-700 h-full flex  justify-between cursor-pointer px-10 hover:scale-110 transition-all ease-in-out duration-500 items-center h-[110px]  w-full rounded-md">
              <div class="w-[30%]">

              </div>
              <p class="text-white w-[70%]">{{ file.name }}</p>
            </div>
          }
        </div>

      </div>
    }

  `,
  styles: ``
})
export class SelectPlaylistComponent {

  playlistService = inject(PlaylistService);
  gamePlayStore = inject(GamePlayStore);
  freeBuzzFolder = this.gamePlayStore.freeBuzzFolder;
  cdr = inject(ChangeDetectorRef);
  canFetch = false
  detectChanges(value: string) {
    this.cdr.markForCheck();
    this.canFetch = !!value;
    this.cdr.detectChanges();
    console.log(this.canFetch);
  }
}
