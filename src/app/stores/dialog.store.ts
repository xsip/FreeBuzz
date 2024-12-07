import {getState, patchState, signalStore, withMethods, withState,} from '@ngrx/signals';
import {ComponentRef, Signal, ViewContainerRef} from '@angular/core';
import {DialogComponent} from '../ui/dialog/dialog.component';

export type DialogData = {
  title: string;
  description: string;
  onClose: () => void;
  style: 'success' | 'error' | 'info';
}
export type DialogStoreType = {
  componentRefs: ComponentRef<DialogComponent>[];
  containerRef: ViewContainerRef
};

function buildInitialState(): DialogStoreType {
  return {
    componentRefs: [] as ComponentRef<DialogComponent>[],
  } as DialogStoreType;
}

export const DialogStore = signalStore(
  {providedIn: 'root'},
  withState(buildInitialState()),

  withMethods((store,) => ({
    setContainerRef(containerRef: ViewContainerRef | undefined) {
      patchState(store, state => {
        console.log(containerRef);
        return ({...state, containerRef});
      })
    },
    showDialog(dialogData: DialogData) {
      const componentRef = getState(store).containerRef.createComponent(DialogComponent);
      componentRef.setInput('title', dialogData.title);
      componentRef.setInput('description', dialogData.description);
      componentRef.setInput('style', dialogData.style);
      componentRef.instance.closeClicked.subscribe((res => {
        componentRef.destroy();
        patchState(store, state => {
          return {...state, componentRefs: state.componentRefs.filter(cr => componentRef.instance !== cr.instance)};
        })
        dialogData.onClose();
       //  getState(store).containerRef.clear();
      }));
      patchState(store, state => {
        return ({...state, componentRefs: [...state.componentRefs, componentRef]});
      })
    }
  })),
);
