import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, viewChild, ViewContainerRef} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BuzzerEventData} from 'node-buzzers/types/types';
import {Item, Playlist} from '../yt/playlist';
import {SelectPlaylistComponent} from './dialogs/select-playlist/select-playlist.component';
import {PlaylistService} from './playlist.service';
import {emptyPlayerPoints, GamePlayStore, random} from './stores/gameplay.store';
import {ToastrService} from 'ngx-toastr';
import {clickSound} from './sounds/click';
import {wrongSelectionSound} from './sounds/wrong';
import {correctSelectionSound} from './sounds/correct';
import {bounceIn, fadeInOut} from './animations';
import {DialogStore} from './stores/dialog.store';

const nodeHid: typeof import('node-hid') = window.require('node-hid');
const {ipcRenderer}: typeof import('electron') = window.require('electron');


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SelectPlaylistComponent],
  template: `

    <div
      class="h-12 w-full rounded-t-md drag bg-blue-600 text-white top-0 drop-shadow-xl left-0 flex items-center px-5 justify-between">
      <h1 class="text-4xl">FreeBuzz</h1>
      @if (playlistService.setupDone) {
        <div class="flex gap-2">
          @if (!gamePlayStore.buzzer()) {
            <h1 class="bg-blue-500 cursor-pointer text-white p-2 rounded-md no-drag" (click)="Init()">Initialize</h1>
          }
          <h1 class="bg-orange-500 cursor-pointer text-white p-2 rounded-md no-drag"
              (click)="gamePlayStore.setAllPoints(emptyPlayerPoints)">Reset points</h1>
          <h1 class="bg-green-500 cursor-pointer text-white p-2 rounded-md no-drag"
              (click)="playlistService.resetPlaylist(); gamePlayStore.resetGame()">Select New Playlist</h1>
          <h1 class="bg-yellow-500 cursor-pointer text-white p-2 rounded-md no-drag" (click)="Reset()">Next song</h1>

        </div>
      }
      <div class="no-drag flex  gap-5">
        <svg (click)="minimize()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
             stroke="currentColor"
             class="size-6 no-drag hover:scale-105 transition-all ease-in-out duration-500 cursor-pointer">
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
        </svg>
        <svg (click)="close()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
             stroke="currentColor"
             class="size-6 no-drag hover:scale-105 transition-all ease-in-out duration-500 cursor-pointer">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>


      </div>
    </div>
    @if (playlistService.setupDone) {

      <div
        class="w-screen rounded-b-md bg-slate-700 h-[calc(100vh-3rem)] flex justify-center items-center flex-col overflow-y-auto px-10">

        <h1 class="text-2xl text-blue-200">{{ selectedPlaylist().metadata.playlistMetadataRenderer.title }}</h1>


        <div class="answers mt-2 flex gap-5 flex-col w-full">
          <div class="flex w-full gap-5">
            <div
              class="bg-blue-500 px-5 rounded-md drop-shadow-xl {{isRightAnswer(0) && (selectedAnswer  || showRightAnswer)? 'border-green-950 border-4' : ( (selectedAnswer  || showRightAnswer) ? 'opacity-50' : '') }} {{isSelectedAnswer(0) && !isRightAnswer(0) ? 'border-red-400 border-4' : ''}} w-[50%] h-[100px] items-center flex justify-center text-white">
              <p> {{ round().possibleAnswers[0]?.value?.title }} {{ round().rightAnswer?.title && selectedAnswer?.title && round().possibleAnswers[0].value.title === selectedAnswer?.title ? 'Selected' : '' }}</p>
            </div>
            <div
              class="bg-orange-500 px-5 rounded-md drop-shadow-xl {{isRightAnswer(1) &&  (selectedAnswer  || showRightAnswer) ? 'border-green-950 border-4' :( (selectedAnswer  || showRightAnswer) ? 'opacity-50' : '') }}  {{isSelectedAnswer(1) && !isRightAnswer(1) ? 'border-red-400 border-4' : ''}}  w-[50%] h-[100px] items-center flex justify-center text-white">
              <p>{{ round().possibleAnswers[1]?.value?.title }} {{ round().rightAnswer?.title && selectedAnswer?.title && round().possibleAnswers[1].value.title === selectedAnswer?.title ? 'Selected' : '' }}</p>
            </div>

          </div>
          <div class="flex w-full  gap-5">

            <div
              class="bg-green-500 px-5 rounded-md drop-shadow-xl {{isRightAnswer(2) &&  (selectedAnswer  || showRightAnswer)  ? 'border-green-950 border-4' :( (selectedAnswer  || showRightAnswer) ? 'opacity-50' : '') }} {{isSelectedAnswer(2) && !isRightAnswer(2) ? 'border-red-400 border-4' : ''}}  w-[50%] h-[100px] items-center flex justify-center text-white">
              <p> {{ round().possibleAnswers[2]?.value?.title }} {{ round().rightAnswer?.title && selectedAnswer?.title && round().possibleAnswers[2].value.title === selectedAnswer?.title ? 'Selected' : '' }}</p>
            </div>
            <div
              class="bg-yellow-500 px-5 rounded-md drop-shadow-xl {{isRightAnswer(3) &&  (selectedAnswer  || showRightAnswer)  ? 'border-green-400 border-4' : ( (selectedAnswer  || showRightAnswer) ? 'opacity-50' : '') }} {{isSelectedAnswer(3) && !isRightAnswer(3) ? 'border-red-400 border-4' : ''}}  w-[50%]  h-[100px] items-center flex justify-center text-white">
              <p>{{ round().possibleAnswers[3]?.value?.title }} {{ round().rightAnswer?.title && selectedAnswer?.title && round().possibleAnswers[3].value.title === selectedAnswer?.title ? 'Selected' : '' }}</p>
            </div>
          </div>
        </div>
        <div
          class="w-full mt-5 mb-5 h-[120px] rounded-md items-center drop-shadow-xl place-items-center grid grid-cols-4 gap-7 bg-slate-600">
          @for (player of players; track $index; ) {
            <div [class.!bg-red-500]="lastLockedInPlayer() == player"
                 class="bg-gray-500 drop-shadow-xl text-white flex items-center self-center justify-center rounded-full w-[100px] h-[100px]">
              <p>{{ this.countdownRunning() && lastLockedInPlayer() == player ? this.countdown() : '' }}</p>
            </div>
          }
        </div>
        <div
          class="w-full drop-shadow-xl px-2 text-white mt-5 mb-5 rounded-md items-center place-items-center grid grid-cols-4 gap-7 bg-blue-500">
          <p>1: {{ playerPoints()[1] }} Points</p>
          <p>2: {{ playerPoints()[2] }} Points</p>
          <p>3: {{ playerPoints()[3] }} Points</p>
          <p>4: {{ playerPoints()[4] }} Points</p>
        </div>
        <!--@if(round().rightAnswer?.title && selectedAnswer?.title) {
        <h1>{{  round().rightAnswer?.title === selectedAnswer?.title ? 'RIGHT ANSWER' : 'WRONG ANSWER' }}</h1>
        }!-->
        <!--<h1>{{ timeRanOut ? 'Time ran out. Please press the red button to restart.' : '' }}</h1>!-->

        <router-outlet/>
      </div>
      <div #player class="hidden player">
        <iframe src="" allow="autoplay"></iframe>

      </div>
    } @else {
      <app-select-playlist/>
    }
    <audio #click controls="controls" class="hidden" autobuffer="autobuffer">
      <source src="{{clickSound}}"/>
    </audio>
    <audio #wrong controls="controls" class="hidden" autobuffer="autobuffer">
      <source src="{{wrongSelectionSound}}"/>
    </audio>
    <audio #correct controls="controls" class="hidden" autobuffer="autobuffer">
      <source src="{{correctSelectionSound}}"/>
    </audio>
    @if (loading) {


      <div class="fixed top-0 left-0 w-screen h-screen bg-slate-800/90 flex items-center justify-center text-white">
        <div role="status" class="flex flex-col items-center gap-5">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
               viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"/>
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"/>
          </svg>
          <span class="">{{ loadingMessage }}</span>
        </div>
      </div>
    }
    <ng-container #dialogContainer> </ng-container>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  loading = false;
  buzzersConnected = false;
  emptyPlayerPoints = emptyPlayerPoints;
  loadingMessage = 'Loading';
  clickSound = clickSound;
  wrongSelectionSound = wrongSelectionSound;
  correctSelectionSound = correctSelectionSound;
  gamePlayStore = inject(GamePlayStore);
  toastr = inject(ToastrService);
  playerPoints = this.gamePlayStore.playerPoints;
  countdownRunning = this.gamePlayStore.countdownRunning;
  round = this.gamePlayStore.round;
  lastLockedInPlayer = this.gamePlayStore.lastLockedInPlayer;

  countdown = this.gamePlayStore.countDown;
  selectedPlaylist = this.gamePlayStore.selectedPlayList;

  playlistService = inject(PlaylistService);

  cdr = inject(ChangeDetectorRef);

  players = [1, 2, 3, 4];

  selectedAnswer?: Item;

  playerContainer = viewChild<ElementRef<HTMLDivElement>>('player');
  beepAudio = viewChild<ElementRef<HTMLAudioElement>>('click');
  wrongSelectionAudio = viewChild<ElementRef<HTMLAudioElement>>('wrong');
  correctSelectionAudio = viewChild<ElementRef<HTMLAudioElement>>('correct');
  vcr = viewChild('dialogContainer', { read: ViewContainerRef });
  dialogStore = inject(DialogStore);
  isRightAnswer(idx: number): boolean | undefined {

    if (this.showRightAnswer)
      return this.round().possibleAnswers[idx]?.value?.title === this.round().rightAnswer?.title;

    if (!this.round().rightAnswer || !this.selectedAnswer)
      return false;
    return (this.round().possibleAnswers[idx]?.value?.title === this.round().rightAnswer?.title);
  }

  isSelectedAnswer(idx: number): boolean | undefined {

    if (this.showRightAnswer)
      return this.round().possibleAnswers[idx]?.value?.title === this.round().rightAnswer?.title;

    if (!this.round().rightAnswer || !this.selectedAnswer)
      return false;
    return (this.round().possibleAnswers[idx]?.value?.title === this.selectedAnswer?.title);
  }

  selectRandomSong() {
    this.gamePlayStore.startNewRound();
  }

  ngOnInit() {

    const containerRefInterval = setInterval(() => {
      if(this.vcr()) {
        this.dialogStore.setContainerRef(this.vcr());
        console.log('found vcr!!');
        clearInterval(containerRefInterval);
      }
    },100);

    this.checkForBuzzers()
    // @ts-ignore
    window['restart'] = () => {
      console.log('DONE');
      return ipcRenderer.invoke('restart');
    }
    // this.Init();
    this.selectNewSong();
    console.log(this.playerContainer());
    this.playSong();

  }

  close() {
    return ipcRenderer.invoke('close');
  }
  minimize() {
    return ipcRenderer.invoke('minimize');
  }

  checkForBuzzers() {
    if (!nodeHid
      .devices()
      .find((d) => d?.product?.match(/Buzz/))) {
      this.loadingMessage = 'Please connect your buzzers...';
      this.loading = true;

      const loadingIval = setInterval(() => {
        const buzzDevice = nodeHid
          .devices()
          .find((d) => d?.product?.match(/Buzz/));
        if (buzzDevice) {
          this.loadingMessage = 'Buzzers connected! Initializing game.'
          clearInterval(loadingIval);
          setTimeout(() => {
            this.loading = false;
            this.loadingMessage = '';
          }, 1500)
        }
      }, 500);
    }
  }

  selectNewSong() {
    if (!this.gamePlayStore.selectedPlayList().items.length)
      return

    this.selectRandomSong();

    if (!this.playerContainer()?.nativeElement)
      return;

    this.removeIframe();
    const newFrame = document.createElement("iframe");
    newFrame.src = `https://www.youtube.com/embed/${this.round().rightAnswer!.id}?autoplay=1`;
    this.playerContainer()!.nativeElement.appendChild(newFrame);
  }

  removeIframe() {
    const iframe = this.playerContainer()?.nativeElement?.querySelector('iframe');
    if (iframe) {
      this.playerContainer()!.nativeElement.removeChild(iframe);
    }
  }

  playSong() {
    console.log(this.round().rightAnswer?.id);
  }

  Reset(selectNewSong = true) {
    this.cdr.markForCheck();
    if (!this.gamePlayStore.buzzer())
      return;
    this.gamePlayStore.buzzer()!.setLeds(false, false, false, false);
    // this.gamePlayService.lastLockedInPlayer = undefined;
    this.gamePlayStore.setIsLocked(false, undefined);
    this.gamePlayStore.setAnswerGiven(false);
    this.selectedAnswer = undefined;
    this.showRightAnswer = false;
    this.timeRanOut = false;
    if (selectNewSong)
      this.selectNewSong();

    this.cdr.detectChanges();
  }

  showRightAnswer = false;
  timeRanOut = false;

  displayRightAnswerAndReset() {
    if (!this.gamePlayStore.buzzer())
      return;
    this.gamePlayStore.buzzer()!.setLeds(false, false, false, false);
    this.timeRanOut = true;
    this.showRightAnswer = true;
    this.toastr.info('Please press the red button to restart.', 'Time ran out');
    this.removeIframe();
  }

  Init() {
    if (!this.gamePlayStore.buzzer()) {
      this.gamePlayStore.init();
      if (!this.gamePlayStore.buzzer())
        return;
      this.Reset();
      this.initPressListener();
      // test
    }
  }


  listener = (data: BuzzerEventData) => {
    this.cdr.markForCheck();
    if (!this.gamePlayStore.buzzer())
      return;

    if (this.timeRanOut && data.button === 0) {
      this.Reset();
      this.cdr.detectChanges();
      return;
    }

    if (this.gamePlayStore.isLocked() && this.gamePlayStore.lastLockedInPlayer()) {
      if (this.gamePlayStore.lastLockedInPlayer() !== data.controller) {
        this.cdr.detectChanges();
        return;

      }
      if (data.button - 1 === -1) {
        if (this.selectedAnswer && this.round().rightAnswer && (this.selectedAnswer?.title === this.round().rightAnswer?.title || this.selectedAnswer?.title !== this.round().rightAnswer?.title)) {
          this.Reset();
        }
        this.cdr.detectChanges();
        return;

      }
      if(!this.gamePlayStore.answerGiven())
        this.selectedAnswer = this.round().possibleAnswers[data.button - 1].value;
      if (this.selectedAnswer?.title !== this.round().rightAnswer?.title && !this.gamePlayStore.answerGiven()) {
        this.wrongSelectionAudio()?.nativeElement?.play();
        this.toastr.error(`-${this.gamePlayStore.pointsForAnswer()} Points`, `Player ${this.gamePlayStore.lastLockedInPlayer()}`);
        this.gamePlayStore.removePointsFromPlayer(data.controller, this.gamePlayStore.pointsForAnswer());
        this.gamePlayStore.setAnswerGiven(true);

      } else if(!this.gamePlayStore.answerGiven()) {
        this.correctSelectionAudio()?.nativeElement?.play();

        this.toastr.success(`+${this.gamePlayStore.pointsForAnswer()} Points`, `Player ${this.gamePlayStore.lastLockedInPlayer()}`);
        this.gamePlayStore.addPointsForPlayer(data.controller, this.gamePlayStore.pointsForAnswer());
        this.gamePlayStore.setAnswerGiven(true);
      }
      console.log(this.selectedAnswer?.title, this.round().rightAnswer)
      this.gamePlayStore.resetCountdown();

      this.cdr.detectChanges();
      return;
    }

    if (data.button !== 0) {
      this.cdr.detectChanges();
      return;
    }

    console.log(data.controller, data);
    this.gamePlayStore.setIsLocked(true, data.controller);
    this.gamePlayStore.buzzer()!.setLeds(data.controller === 1, data.controller === 2, data.controller === 3, data.controller === 4);
    this.gamePlayStore.startCountdown(this.cdr, this.beepAudio()?.nativeElement, () => {
      this.toastr.error(`Player ${this.gamePlayStore.lastLockedInPlayer()} -${this.gamePlayStore.pointsForAnswer()} Points`);
      this.wrongSelectionAudio()?.nativeElement?.play();
      this.gamePlayStore.removePointsFromPlayer(this.gamePlayStore.lastLockedInPlayer()!, this.gamePlayStore.pointsForAnswer());
      this.displayRightAnswerAndReset();
    });
    this.cdr.detectChanges()
  }

  initPressListener() {
    if (!this.gamePlayStore.buzzer())
      return;
    this.gamePlayStore.buzzer()!.onPress(this.listener);

  }

}
