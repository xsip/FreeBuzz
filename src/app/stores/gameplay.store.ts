import {getState, patchState, signalStore, withComputed, withMethods, withState,} from '@ngrx/signals';
import {ChangeDetectorRef} from '@angular/core';
import {IBuzzer} from 'node-buzzers/types/types';
import {Item, Playlist} from '../../yt/playlist';
const nodeBuzzers: typeof import('node-buzzers').default = window.require("node-buzzers");

const fs: typeof import('fs') = window.require('fs');
type PlayerPoints = Record<number, number>;
export const emptyPlayerPoints: PlayerPoints = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
};

const emptyPlaylist: Playlist = {
  items: [],
  metadata: {
    playlistMetadataRenderer: {
      title: 'EMPTY',
      androidAppindexingLink: '',
      description: 'EMPTY',
      iosAppindexingLink: ''
    }
  }
}
export type Round = {
  possibleAnswers: {value: Item; key: number}[];
  rightAnswer: Item;
}
export type GamePlayStoreType = {
  pointsForAnswer: number;
  initialCountdown: number;
  countDown: number;
  countdownRunning: boolean;
  countdownInterval: any | undefined;
  isLocked: boolean;
  lastLockedInPlayer: number | undefined;
  answerGiven: boolean;
  buzzer: IBuzzer | undefined;
  playerPoints: PlayerPoints;
  freeBuzzFolder: string | undefined;
  selectedPlayList: Playlist;
  recentlyPlayedSongs: number[];
  round: Round;
};

function buildInitialState(): GamePlayStoreType {

  let points: any = localStorage.getItem('playerPoints');
  if (points)
    points = JSON.parse(points);
  else
    points = emptyPlayerPoints;

  let folder: any = localStorage.getItem('freeBuzzFolder');
  if(folder)
    folder = JSON.parse(folder);
  else
    folder = 'C:\\FreeBuzz';

  return {
    pointsForAnswer: 100,
    initialCountdown: 10,
    countDown: 1,
    countdownRunning: false,
    countdownInterval: undefined,
    lastLockedInPlayer: undefined,
    isLocked: false,
    buzzer: undefined,
    playerPoints: points,
    freeBuzzFolder: folder,
    selectedPlayList: emptyPlaylist,
    recentlyPlayedSongs: [],
    answerGiven: false,
    round: {
      possibleAnswers: [],
      rightAnswer: {} as Item,
    }
  } as GamePlayStoreType;
}

function shuffle(array: number[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
function  generateRandomUniqueInList(to: number, list: number[], recentlyPlayed: number[]) {
  let _random = random(0, to);
  if (list.includes(_random) || recentlyPlayed.includes(_random)) {
    _random = generateRandomUniqueInList(to, list, recentlyPlayed);
  }
  return _random;
}


function generateFourRandoms(to: number, recentlyPlayedSongs: number[]) {
  const randoms: number[] = [];
  for (let i = 0; i < 4; i++) {
    const random = generateRandomUniqueInList(to, randoms, recentlyPlayedSongs);
    randoms.push(random);
  }
  return randoms;
}
export function   random(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export const GamePlayStore = signalStore(
  {providedIn: 'root'},
  withState(buildInitialState()),

  withMethods((store) => ({

    startNewRound() {
      patchState(store, state => {
        if(state.recentlyPlayedSongs.length === state.selectedPlayList.items.length) {
          alert("Game Played Through!");
          return state;
        }
        const possibleAnswers: {value: Item; key: number}[] = shuffle(generateFourRandoms(state.selectedPlayList.items.length - 1, state.recentlyPlayedSongs)).map((r, i) => {
          return {value: state.selectedPlayList.items[r], key: i};
        });
        const rightAnswerIdx = random(0, 3);
        const rightAnswer: Item = possibleAnswers[rightAnswerIdx].value;

        return {
          ...state,
          recentlyPlayedSongs: [...state.recentlyPlayedSongs, state.selectedPlayList.items.findIndex(e => e.title === rightAnswer!.title)],
          round: {
            ...state.round,
            possibleAnswers,
            rightAnswer,
          }
        }
      });
    },
    updateRecentlyPlayedSongs(recentlyPlayedSongs: number[]) {
      patchState(store,state => {
        return {
          ...state,
          recentlyPlayedSongs: [...state.recentlyPlayedSongs, ...recentlyPlayedSongs]
        }
      })
    },
    setSelectedPlayList(playlist: Playlist = emptyPlaylist, resetRecentlyPlayed: boolean = true) {
      patchState(store, state => {
        return {
          ...state,
          recentlyPlayedSongs: resetRecentlyPlayed ? [] : state.recentlyPlayedSongs,
          selectedPlayList: playlist
        }
      })
    },
    setIsLocked(isLocked: boolean, lastLockedInPlayer?:number) {
      patchState(store, state => {
        return {
          ...state,
          isLocked,
          lastLockedInPlayer
        }
      })
    },
    setAnswerGiven(answerGiven: boolean) {
      patchState(store, state => {
        return {
          ...state,
          answerGiven
        }
      })
    },
    resetGame() {
      patchState(store, state => {
        return {
          ...state,
          round: {
            possibleAnswers: [],
            rightAnswer: {} as Item,
          },
          playerPoints: emptyPlayerPoints,
        }
      })
    },
    setFreeBuzzFolder(freeBuzzFolder: string) {
      localStorage.setItem('freeBuzzFolder', JSON.stringify(freeBuzzFolder));
      patchState(store,state => {
        return {
          ...state,
          freeBuzzFolder,
        }
      })
    },
    init() {
      if(store.buzzer!()) {
        console.info('Already initialized!');
        return;
      }
      const buzzer = nodeBuzzers(true) as IBuzzer;
      buzzer.setLeds(false,false, false, false);
      patchState(store, state => {
        return {
          ...state,
          buzzer
        }
      })
    },
    setAllPoints(playerPoints: PlayerPoints) {
      localStorage.setItem('playerPoints', JSON.stringify(playerPoints));
      patchState(store, state => {
        return {
          ...state,
          playerPoints,
        }
      })
    },
    setPointsForPlayer(idx: number, points: number) {
      localStorage.setItem('playerPoints', JSON.stringify(points));
      patchState(store, state => {
        return {
          ...state,
          points: {
            ...state.playerPoints,
            [idx]: points
          }
        }
      })
    },

    addPointsForPlayer(idx: number, points: number) {
      patchState(store, state => {

        const newPoints =  {
          ...state.playerPoints,
          [idx]: state.playerPoints[idx]+points
        }
        localStorage.setItem('playerPoints',JSON.stringify(newPoints));
        return {
          ...state,
          playerPoints: newPoints
        }
      })
    },
    removePointsFromPlayer(idx: number, points: number) {

      patchState(store, state => {
        const newPoints =  {
          ...state.playerPoints,
          [idx]: state.playerPoints[idx]-points
        }
        localStorage.setItem('playerPoints',JSON.stringify(newPoints));
        return {
          ...state,
         playerPoints: newPoints
        }
      })
    },
    resetCountdown() {
      clearInterval(store.countdownInterval!());
      patchState(store, state => {
        return {
          ...state,
          countdownRunning: false,
          countDown: state.initialCountdown,
          countdownInterval: undefined,
        }
      })
    },
    startCountdown(cdr: ChangeDetectorRef, audioElement: HTMLAudioElement | undefined, onCountdownEnd: () => void) {
      patchState(store,state => {
        return {
          ...{...state},
          countDown: state.initialCountdown,
          countdownRunning: true,
        }
      });
      setTimeout(() => {
        patchState(store, state => {
          audioElement?.play();

          return {
            ...state,
            countdownInterval: setInterval(() => {
              cdr.markForCheck();
              if (store.countDown() === 1) {
                onCountdownEnd();
                this.resetCountdown();
                cdr.detectChanges();
                return;
              }
              audioElement?.play();
              patchState(store, state => {
                return {
                  ...state,
                  countDown: state.countDown-1
                }
              })
              cdr.detectChanges();

            }, 1000)
          }
        })
      },1);
    }
    /*
        toggleMenu() {
        patchState(store, (state) => {
          localStorage.setItem('menuOpen', JSON.stringify(!state.menuOpen));
          return {
            ...{...state},
            menuOpen: !state.menuOpen,
            updated: new Date(),
          };
        });
      },

     */
  })),
);
