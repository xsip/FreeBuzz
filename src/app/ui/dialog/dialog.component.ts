import {Component, input, output} from '@angular/core';
import {fadeInOut} from '../../animations';

@Component({
  selector: 'app-dialog',
  imports: [],
  animations: [fadeInOut('0.2s', '0.2s')],

  template: `

    <div
         class="fixed inset-0 rounded-md bg-gray-500/75 transition-opacity"
         aria-hidden="true"></div>

    <div class="fixed rounded-md inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

        <div
          [@fadeInOut]="true"
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                @if (style() === 'success') {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                       stroke="currentColor" class="size-6 text-green-600">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>

                } @else if(style() === 'error') {
                  <svg class="size-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                       stroke="currentColor" aria-hidden="true" data-slot="icon">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                  </svg>
                }@else  if(style() === 'info') {

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-orange-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>

                }
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold text-gray-900" id="modal-title">{{title()}}</h3>
                <div class="mt-2">
                  <p
                    class="text-sm text-gray-500">{{description()}}</p>
                </div>
              </div>
            </div>
          </div>
          <div (click)="closeClicked.emit()"
               class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class DialogComponent {
  title = input.required<string>({alias: 'title'});
  description = input.required<string>({alias: 'description'});
  style = input.required<'success' | 'error' | 'info'>({alias: 'style'});
  closeClicked = output<void>({alias: 'closeClicked'});
}
