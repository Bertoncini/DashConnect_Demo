import { Component, Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FirebaseUISignInSuccessWithAuthResult, FirebaseUISignInFailure, FirebaseuiAngularLibraryService } from 'firebaseui-angular';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { Action } from 'rxjs/internal/scheduler/Action';
import { HomePage } from './home/home.page';
import { ListPage } from './list/list.page';
import { ParameterPage, User } from './parameter/parameter.page';
import { single } from 'rxjs/operators';

@Injectable()
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  private appPagesDefault = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home',
      component: HomePage
    }
  ];

  public appPages = [];

  constructor(
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private firebaseuiAngularLibraryService: FirebaseuiAngularLibraryService,
    public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    public storage: Storage
  ) {
    firebaseuiAngularLibraryService.firebaseUiInstance.disableAutoSignIn();
    this.initializeApp();
    console.log('teslogin');
    this.storage.forEach((value: string, key: string, iterationNumber: Number) => {
      if (key === "Uid") {
        var sign: FirebaseUISignInSuccessWithAuthResult;
        this.buscarMenu(value, sign);
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    this.buscarMenu(signInSuccessData.authResult.user.uid, signInSuccessData);
  }

  buscarMenu(uid: string, signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    var uids;
    this.db.collection<User>('users', ref => ref.where('uid', '==', uid)).valueChanges({ uids })
      .subscribe(actions => {
        if (actions.length == 0 && signInSuccessData) {
          this.db.collection('users').add({
            uid: signInSuccessData.authResult.user.uid,
            name: signInSuccessData.authResult.user.displayName,
            email: signInSuccessData.authResult.user.email
          })
        };
        actions.forEach(action => {
          this.storage.set('Uid', action.uid);
          this.appPages = this.appPagesDefault.slice();
          if (action.pages) {
            action.pages.forEach(page => {
              this.appPages.push({ title: page.NameRel, url: '/home', icon: 'list', page: page, component: HomePage });
            });
          }
        });
        this.appPages.push({
          title: 'Logout',
          url: '/logout',
          icon: 'exit',
          component: ListPage
        });
      });
    this.router.navigateByUrl('/home', { state: { data: {} } });
  }

  errorCallback(errorData: FirebaseUISignInFailure) {
    console.log(errorData);
  }

  openPage(page) {
    if (page.url === "/logout") {
      firebase.auth().signOut();
      this.storage.clear();
    }
    if (page.page) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          "page": JSON.stringify(page)
        }
      };
      this.router.navigate([page.url], navigationExtras);
    } else {
      this.router.navigate([page.url]);
    }
  }

}
