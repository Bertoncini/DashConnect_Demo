import { Component, Injectable, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { ToastController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading.service';
import { ParameterPage } from '../parameter/parameter.page';

@Injectable()
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public toastCtrl: ToastController
    , public modalCtrl: ModalController, private http: HttpClient, public navParams: ActivatedRoute, public loading: LoadingService) {

    this.navParams.queryParams.subscribe(params => {
      if (params.page) {
        this.selectedItem = JSON.parse(params.page).page;
        this.Title = this.selectedItem.NameRel;
        this.gerarRelatorio();
      }
      else
        this.selectedItem = {};
    });
  }

  @ViewChild('lineCanvas', { static: false }) lineCanvas;
  @ViewChild('barCanvas',{ static: false }) barCanvas;
  @ViewChild('radarCanvas', { static: false }) radarCanvas;
  @ViewChild('doughnutCanvas', { static: false }) doughnutCanvas;
  @ViewChild('polarCanvas', { static: false }) polarCanvas;
  @ViewChild('bubbleCanvas', { static: false }) bubbleCanvas;
  @ViewChild('scatterCanvas', { static: false }) scatterCanvas;
  @ViewChild('areaCanvas', { static: false }) areaCanvas;
  @ViewChild('mixedCanvas', { static: false }) mixedCanvas;

  Title: string;
  selectedItem: any;
  lineChar: any;
  barChart: any;
  radarChart: any;
  doughnutChart: any;
  polarChart: any;
  bubbleChart: any;
  scatterChart: any;
  areaChart: any;
  mixedChart: any;

  backgroundColors() {
    return [
      'rgba(255, 99, 132)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)']
  }

  borderColors() {
    return [
      'rgba(255, 99, 132)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)']
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
    });
    toast.present();
  }

  retornaArray(objectRaiz) {
    var objetoRetorno = objectRaiz;
    if (Array.isArray(objetoRetorno))
      return objetoRetorno
    return this.retornaArray(objectRaiz[Object.keys(objectRaiz)[0]]);
  }

  async retornarDados(currentValue) {
    return await this.http.get(currentValue.UrlApi).subscribe(function (data) {
      return data;
    }, function (error) { return undefined; });
  }

  async gerarRelatorio() {
    this.loading.present();

    await this.selectedItem.DataSets.map((currentValue, index, arr) => {
      this.realizarRequisicao(currentValue, index).then((data) => {
        return data;
      }).then(() => {
        if (this.selectedItem.DataSets && Array.isArray(this.selectedItem.DataSets[0].ResultCache))
          this.exibirDadosRelatorio();
      });
    });

    this.loading.dismiss();
  }

  async realizarRequisicao(currentValue, index) {
    return await new Promise((resolve, reject) => {
      this.http.get(currentValue.UrlApi).toPromise().then((result) => {
        if (result)
          this.selectedItem.DataSets[index].ResultCache = this.retornaArray(result);
        else
          this.exibirMensagem('Acessando dados da memoria.');
        if (this.selectedItem.DataSets.length == index + 1)
          resolve(this.selectedItem);
      }, function (error) { reject(); });
    });
  }

  ngOnInit(): void {
    // this.afAuth.authState.subscribe(d => console.log(d));
  }

  logout() {
    // this.afAuth.auth.signOut();
  }

  async openConfigPage() {
    let profileModal = await this.modalCtrl.create({
      component: ParameterPage,
      // componentProps: { dataSet }
    }).then((res) => {
      res.present();
      
      res.onDidDismiss().then((dis) => {
        console.log(dis);
        if (dis.data) {
         
        }
      });
    });     
  }

  async exibirDadosRelatorio() {
    var datasetsValues = []
    var eixoXs = []
    var backColors = this.backgroundColors();
    var borderColors = this.borderColors();
    var qtdDataSets = this.selectedItem.DataSets.length;
    var barCanvas = this.barCanvas;
    var barChart = this.barChart;
    var bubbleCanvas = this.bubbleCanvas;
    var bubbleChart = this.bubbleChart;
    var doughnutCanvas = this.doughnutCanvas;
    var doughnutChart = this.doughnutChart;
    var lineCanvas = this.lineCanvas;
    var lineChar = this.lineChar;
    var mixedCanvas = this.mixedCanvas;
    var mixedChart = this.mixedChart;
    var polarCanvas = this.polarCanvas;
    var polarChart = this.polarChart;
    var radarCanvas = this.radarCanvas;
    var radarChart = this.radarChart;

    await Promise.all(this.selectedItem.DataSets.map(function (currentValue, index) {
      var eixoX = currentValue.ResultCache.map(function (k) { return k[currentValue.EixoX] });
      eixoXs.push(eixoX);

      datasetsValues.push({
        label: currentValue.Nome,
        data: currentValue.ResultCache.map(function (k) { return k[currentValue.EixoY] }),
        backgroundColor: qtdDataSets === 1 ? backColors : backColors[index],
        borderColor: qtdDataSets === 1 ? borderColors : borderColors[index],
        borderWidth: 1
      })
    })
    );

    var item = this.selectedItem;

    await new Promise(function (resolve, reject) {
      var chaves = eixoXs.filter((x, i, a) => { return a.indexOf(x) == i })[0];

      if (item.Grafico === 'barraH')
        barChart = new Chart(barCanvas.nativeElement, {
          type: 'horizontalBar',
          data: {
            labels: chaves,
            datasets: datasetsValues
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }

        });

      if (item.Grafico === 'barraV')
        barChart = new Chart(barCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: chaves,
            datasets: datasetsValues
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }],
            }
          }
        });

      if (item.Grafico === 'bolha')
        bubbleChart = new Chart(bubbleCanvas.nativeElement, {
          type: 'bubble',
          data: {
            labels: chaves,
            datasets: datasetsValues
          }
        });

      if (item.Grafico === 'linha')
        lineChar = new Chart(lineCanvas.nativeElement, {

          type: 'line',
          data: {
            labels: chaves,
            datasets: datasetsValues
          }

        });

      if (item.Grafico === 'mix')
        mixedChart = new Chart(mixedCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: chaves,
            datasets: datasetsValues,
            type: 'line'
          }
        });

      if (item.Grafico === 'pizza')
        doughnutChart = new Chart(doughnutCanvas.nativeElement, {
          type: 'pie',
          data: {
            labels: chaves,
            datasets: datasetsValues
          }
        });

      if (item.Grafico === 'polar')
        polarChart = new Chart(polarCanvas.nativeElement, {
          type: 'polarArea',
          data: {
            labels: chaves,
            datasets: datasetsValues
          }
        });

      if (item.Grafico === 'radar')
        radarChart = new Chart(radarCanvas.nativeElement, {
          type: 'radar',
          data: {
            labels: chaves,
            datasets: datasetsValues
          }
        });

      if (item.Grafico === 'rosca')
        doughnutChart = new Chart(doughnutCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: chaves,
            datasets: datasetsValues
          }
        });

      resolve(item.Nome);

    }).then(x => { })

    if (barChart === undefined || bubbleChart === undefined || doughnutChart === undefined || lineChar === undefined || mixedChart === undefined || polarChart === undefined || radarChart === undefined)
      console.log('chartUndefined');
  }

}
