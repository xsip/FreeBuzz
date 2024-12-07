import {Component, inject, output} from '@angular/core';
import {GamePlayStore} from '../../stores/gameplay.store';

@Component({
  selector: 'app-recently-played',
  imports: [],
  template: `
    <div
      class="w-screen rounded-b-md bg-slate-700 h-[calc(100vh-3rem)] py-5 flex flex-col overflow-y-auto px-10">
      <h1 class="bg-blue-500 cursor-pointer flex text-center items-center justify-center text-white p-2 w-[200px] rounded-md no-drag" (click)="closed.emit()">Back to game</h1>
      <div class="grid grid-cols-3 mt-10 gap-10">
        @for(entry of recentlyPlayed(); track $index) {
          <div class="bg-blue-500 rounded-md h-[150px] px-5 flex justify-between items-center text-white">
            <div>
              {{selectedPlaylist().items[entry].title}}
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: ``
})
export class RecentlyPlayedComponent {
  gamePlayStore = inject(GamePlayStore);
  selectedPlaylist = this.gamePlayStore.selectedPlayList;
  recentlyPlayed = this.gamePlayStore.recentlyPlayedSongs;
  closed = output<void>();
}
