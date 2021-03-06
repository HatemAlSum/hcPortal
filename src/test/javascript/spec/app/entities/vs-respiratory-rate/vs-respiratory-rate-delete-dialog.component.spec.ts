/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { HcPortalTestModule } from '../../../test.module';
import { VsRespiratoryRateDeleteDialogComponent } from '../../../../../../main/webapp/app/entities/vs-respiratory-rate/vs-respiratory-rate-delete-dialog.component';
import { VsRespiratoryRateService } from '../../../../../../main/webapp/app/entities/vs-respiratory-rate/vs-respiratory-rate.service';

describe('Component Tests', () => {

    describe('VsRespiratoryRate Management Delete Component', () => {
        let comp: VsRespiratoryRateDeleteDialogComponent;
        let fixture: ComponentFixture<VsRespiratoryRateDeleteDialogComponent>;
        let service: VsRespiratoryRateService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [HcPortalTestModule],
                declarations: [VsRespiratoryRateDeleteDialogComponent],
                providers: [
                    VsRespiratoryRateService
                ]
            })
            .overrideTemplate(VsRespiratoryRateDeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(VsRespiratoryRateDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(VsRespiratoryRateService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        spyOn(service, 'delete').and.returnValue(Observable.of({}));

                        // WHEN
                        comp.confirmDelete('123');
                        tick();

                        // THEN
                        expect(service.delete).toHaveBeenCalledWith('123');
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
