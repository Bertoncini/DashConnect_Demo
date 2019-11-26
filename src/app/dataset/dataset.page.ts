import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, NavParams, Events, ToastController, ModalController } from '@ionic/angular';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.page.html',
  styleUrls: ['./dataset.page.scss'],
})
@Injectable()
export class DatasetPage implements OnInit {
  DataSet: { Nome?: string, UrlApi?: string, EixoX?: string, EixoY?: string, ResultCache?: any };
  retornoApi: any;
  teste: string;

  constructor(
    public params: NavParams
    , public navCtrl: NavController
    , public events: Events
    , public toastCtrl: ToastController
    , private http: HttpClient
    , public loading: LoadingService
    , private modalCtrl: ModalController
  ) {
    this.DataSet = {
      Nome: '',
      UrlApi: '',
      EixoX: '',
      EixoY: '',
      ResultCache: {},
    };
    console.log(this.params);
    this.DataSet = this.params.data['dataSet'] || this.DataSet;
    this.requestUrl();
  }

  ngOnInit() {
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000
    });
    toast.present();
  }

  adicionar() {
    if (!this.DataSet.Nome) {
      this.exibirMensagem('Informe o Nome do DataSet.');
      return;
    }

    if (!this.DataSet.UrlApi) {
      this.exibirMensagem('Informe o end-point para localizar as informações para o relatório.');
      return;
    }

    if (!this.DataSet.EixoX) {
      this.exibirMensagem('Informe a descrição do eixo X.');
      return;
    }

    if (!this.DataSet.EixoY) {
      this.exibirMensagem('Informe o valor do eixo Y.');
      return;
    }

    this.modalCtrl.dismiss(this.DataSet);
  }

  requestUrl() {
    if (this.DataSet.UrlApi) {
      this.loading.present();
      this.http.get(this.DataSet.UrlApi)
        .subscribe((result: any) => {

          var object = this.retornaArray(result);

          this.retornoApi = Object.keys(object[0]);

          this.loading.dismiss();
        },
          (error) => {
            this.exibirMensagem(error.statusText);
            this.loading.dismiss();
          });
    }
  }

  retornaArray(objectRaiz) {
    var objetoRetorno = objectRaiz;
    if (Array.isArray(objetoRetorno))
      return objetoRetorno
    return this.retornaArray(objectRaiz[Object.keys(objectRaiz)[0]]);
  }
}
