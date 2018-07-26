import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {JhiEventManager, JhiParseLinks, JhiAlertService} from 'ng-jhipster';

import {VsSpo2} from './vs-spo-2.model';
import {VsSpo2Service} from './vs-spo-2.service';
import {ITEMS_PER_PAGE, Principal} from '../../shared';

@Component({
    selector: 'jhi-vs-spo-2',
    templateUrl: './vs-spo-2.component.html'
})
export class VsSpo2Component implements OnInit, OnDestroy {

    currentAccount: any;
    vsSpo2S: VsSpo2[];
    error: any;
    success: any;
    eventSubscriber: Subscription;
    routeData: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;
    hideChart: boolean;
    lineChartData: Array<object> = [
        {
            data: [],
            label: 'Blood Oxygen Level (SpO2)'
        },
        {
            data: [],
            label: 'Blood Oxygen Level (Mean)'
        },
        {
            data: [],
            label: 'Blood Oxygen Level (Median)'
        }
    ];
    lineChartLabels: Array<any> = [];
    lineChartOptions: any = {
        responsive: true
    };
    lineChartColors: Array<any> = [
        { // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        { // red red
            backgroundColor: 'transparent',
            borderColor: 'rgb(255, 0, 0)',
            pointBackgroundColor: 'rgb(255, 0, 0)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: 'rgb(255, 0, 0)',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        { // blue blue
            backgroundColor: 'transparent',
            borderColor: 'rgb(0, 0, 255)',
            pointBackgroundColor: 'rgb(0, 0, 255)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: 'rgb(0, 0, 255)',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        }
    ];
    lineChartLegend = true;
    lineChartType = 'line';

    constructor(
        private vsSpo2Service: VsSpo2Service,
        private parseLinks: JhiParseLinks,
        private jhiAlertService: JhiAlertService,
        private principal: Principal,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private eventManager: JhiEventManager
    ) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.routeData = this.activatedRoute.data.subscribe((data) => {
            this.page = data.pagingParams.page;
            this.previousPage = data.pagingParams.page;
            this.reverse = data.pagingParams.ascending;
            this.predicate = data.pagingParams.predicate;
        });
        this.hideChart = true;
    }

    loadAll() {
        this.vsSpo2Service.query({
            userids: this.principal.getLogin(),
            page: this.page - 1,
            size: this.itemsPerPage,
            sort: this.sort()
        }).subscribe(
            (res: HttpResponse<VsSpo2[]>) => this.onSuccess(res.body, res.headers),
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    loadPage(page: number) {
        if (page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }

    transition() {
        this.router.navigate(['/vs-spo-2'], {
            queryParams:
                {
                    page: this.page,
                    size: this.itemsPerPage,
                    sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
                }
        });
        this.loadAll();
    }

    clear() {
        this.page = 0;
        this.router.navigate(['/vs-spo-2', {
            page: this.page,
            sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
        }]);
        this.loadAll();
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInVsSpo2S();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: VsSpo2) {
        return item.id;
    }

    registerChangeInVsSpo2S() {
        this.eventSubscriber = this.eventManager.subscribe('vsSpo2ListModification', (response) => this.loadAll());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    private onSuccess(data, headers) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.queryCount = this.totalItems;
        // this.page = pagingParams.page;
        this.vsSpo2S = data;
        for (let i = 0; i < this.vsSpo2S.length; i++) {
            this.lineChartData[0]['data'].push(this.vsSpo2S[i].percent);
            this.lineChartLabels.push(this.vsSpo2S[i].measurmentdate.toString().substr(0, 21));
        }

        const spo2Sum = this.lineChartData[0]['data'].reduce((a, b) => a + b, 0);
        let median = 0;
        const sortedArr = this.lineChartData[0]['data'].sort((a, b) => a - b);

        if (sortedArr.length % 2 !== 0) {
            median = sortedArr[(sortedArr.length - 1) / 2];
        } else {
            median = (sortedArr[sortedArr.length / 2] + sortedArr[(sortedArr.length / 2) - 1]) / 2;
        }

        for (let i = 0; i < this.vsSpo2S.length; i++) {
            this.lineChartData[1]['data'].push(spo2Sum / this.lineChartData[0]['data'].length);
            this.lineChartData[2]['data'].push(median);
        }
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
