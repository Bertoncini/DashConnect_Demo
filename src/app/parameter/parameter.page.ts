import { Component, Injectable } from '@angular/core';
import { ToastController, NavController, Events, AlertController, ModalController } from '@ionic/angular';
import { DatasetPage } from '../dataset/dataset.page';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage'
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";

export interface User { id: string, uid: string, name: string, email: string, pages: Page[] }
export interface Page { NameRel?: string, Grafico?: string, DataSets?: any }

@Injectable()
@Component({
  selector: 'page-parameter',
  templateUrl: 'parameter.page.html'
})
export class ParameterPage {
  item: { NameRel?: string, Grafico?: string, DataSets?: any };
  DataSet: { Nome?: string, UrlApi?: string, EixoX?: string, EixoY?: string, ResultCache?: any };
  itens: Array<{ NameRel?: string, UrlApi?: string, Grafico?: string }>;
  retornoApi: any;
  usersRef: AngularFirestoreCollection<User>;
  user: any;

  constructor(public toastCtrl: ToastController
    , public navCtrl: NavController
    , public modalCtrl: ModalController
    , public events: Events
    , public alertController: AlertController
    , public db: AngularFirestore
    , public storage: Storage
  ) {
    this.itens = [];

    this.storage.forEach((value: string, key: string, iterationNumber: Number) => {
      if (key === "Uid") {
        this.usersRef = this.db.collection<User>('users');
        this.usersRef.snapshotChanges()
          .forEach(actions => {
            actions.forEach(action => {
              const data = action.payload.doc.data() as User;
              if (data.uid === value) {
                const id = action.payload.doc.id;
                this.user = { id, ...data, pages: {} };
              }
            });

            //     return actions.map(action => {
            //       const data = action.payload.doc.data() as User;
            //       if (!data.pages)
            //         data.pages = [];
            //       const id = action.payload.doc.id;
            //       return { id, ...data };
            //     });
            // });
          }
          )
      }
    });
    // this.storage.get('MenuDash').then(data => {
    //   if (data) {
    //     this.itens = data;
    //   }
    // });

    this.item = {
      NameRel: '',
      Grafico: '',
      DataSets: [],
    };

    this.DataSet = {
      Nome: '',
      UrlApi: '',
      EixoX: '',
      EixoY: '',
      ResultCache: {},
    };
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
    });
    toast.present();
  }

  logForm() {
    if (!this.item.NameRel) {
      this.exibirMensagem('Informe o nome do Relatório.');
      return;
    }

    if (!this.item.Grafico) {
      this.exibirMensagem('Informe qual será o gráfico para exibição os valores.');
      return;
    }

    if (!this.item.DataSets || this.item.DataSets.length == 0) {
      this.exibirMensagem('Adicione pelo menos um DataSet.');
      return;
    }

    this.itens.push(this.item);
    this.user.pages.push(this.item);

    this.usersRef.doc(this.user.id).update(this.user);
    // this.storage.set('MenuDash', this.itens).then(data => {
    //   this.events.publish('menu:addRel', data, Date.now());
    // });
    this.modalCtrl.dismiss(this.user);
  }

  async adicionarDataSet(dataSet) {
    let profileModal = await this.modalCtrl.create({
      component: DatasetPage,
      componentProps: { dataSet }
    }).then((res) => {
      res.present();

      res.onDidDismiss().then((dis) => {
        console.log(dis);
        if (dis.data) {
          let i = this.item.DataSets.indexOf(dis.data);
          if (i > -1) {
            this.item.DataSets[i] = dis.data;
          }
          else {
            this.item.DataSets.push(dis.data);
          }
        }
      });
    });
  }

  apagarDataSet(dataSet) {
    this.confirmarExclusaoDataSet(dataSet);
  }

  editarDataSet(dataSet) {
    this.adicionarDataSet(dataSet);
  }

  // ionViewWillEnter() {
  //   this.DataSet = this.navParams.get('DataSet')|| null;
  //   if(this.DataSet)
  //   {
  //     let i = this.item.DataSets.indexOf(this.DataSet);
  //     if(i > -1)
  //     {
  //       this.item.DataSets[i] = this.DataSet;  
  //     }
  //     else
  //     {
  //       this.item.DataSets.push(this.DataSet);
  //     }
  //   }
  // }

  async confirmarExclusaoDataSet(dataSet) {
    let alert = await this.alertController.create({
      header: ' Confirmar exclusão?',
      message: 'Apagar o DataSet "' + dataSet.Nome + '" ?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Apagar',
          handler: () => {
            let i = this.item.DataSets.indexOf(dataSet);
            if (i > -1) {
              this.item.DataSets.splice(i, 1);
            }
          }
        }
      ]
    });
    alert.present();
  }

}
