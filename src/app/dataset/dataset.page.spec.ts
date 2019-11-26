import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DatasetPage } from './dataset.page';

describe('DatasetPage', () => {
  let component: DatasetPage;
  let fixture: ComponentFixture<DatasetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
