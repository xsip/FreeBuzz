import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPlaylistComponent } from './select-playlist.component';

describe('SelectPlaylistComponent', () => {
  let component: SelectPlaylistComponent;
  let fixture: ComponentFixture<SelectPlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPlaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
