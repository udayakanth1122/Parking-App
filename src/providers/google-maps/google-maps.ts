import { Injectable } from '@angular/core';
import { ConnectivityProvider } from '../connectivity/connectivity'
import { Geolocation } from '@ionic-native/geolocation';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the GoogleMapsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/

declare var google;

/* Google Maps Styling */
var $main_color = '#2d313f',
  $saturation = -20,
  $brightness = 5;
var style = [
  {
    //set saturation for the labels on the map
    elementType: "labels",
    stylers: [
      { saturation: $saturation }
    ]
  },
  {	//poi stands for point of interest - don't show these lables on the map
    featureType: "poi",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    //don't show highways lables on the map
    featureType: 'road.highway',
    elementType: 'labels',
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    //don't show local road lables on the map
    featureType: "road.local",
    elementType: "labels.icon",
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    //don't show arterial road lables on the map
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    //don't show road lables on the map
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      { visibility: "off" }
    ]
  },
  //style different elements on the map
  {
    featureType: "transit",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "poi",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "poi.government",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "poi.sport_complex",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "poi.attraction",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "poi.business",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "transit",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "transit.station",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "landscape",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]

  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      { hue: $main_color },
      { visibility: "on" },
      { lightness: $brightness },
      { saturation: $saturation }
    ]
  }
];

let options = { timeout: 10000, enableHighAccuracy: true };

@Injectable()
export class GoogleMapsProvider {

  mapElement: any;
  pleaseConnect: any;
  map: any;
  mapInitialised: boolean = false;
  mapLoaded: any;
  mapLoadedObserver: any;
  markers: any = [];
  // add your apiKey for GoogleMaps
  // example: apiKey: string = 'ARfdaDE..';
  apiKey: string = 'AIzaSyB_lXHx2An5sR4F0Fwvy2s4x-eVQDfJBwc';

  constructor(public connectivityService: ConnectivityProvider,
    public geolocation: Geolocation,
    private alertCtrl: AlertController) {

  }

  init(mapElement: any, pleaseConnect: any): Promise<any> {

    this.mapElement = mapElement;
    this.pleaseConnect = pleaseConnect;

    return this.loadGoogleMaps();

  }

  loadGoogleMaps(): Promise<any> {

    return new Promise((resolve) => {

      if (typeof google == "undefined" || typeof google.maps == "undefined") {
        console.log("Google maps JavaScript needs to be loaded.");
        this.disableMap();
        if (this.connectivityService.isOnline()) {
          window['mapInit'] = () => {
            this.initMap().then(() => {
              resolve(true);
            });
            this.enableMap();
          }

          let script = document.createElement("script");
          script.id = "googleMaps";
          if (this.apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
          } else {
            script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
          }
          document.body.appendChild(script);
        }
      }
      else {
        if (this.connectivityService.isOnline()) {
          this.initMap();
          this.enableMap();
        }
        else {
          this.disableMap();
        }
      }
      this.addConnectivityListeners();
    });
  }

  initMap(): Promise<any> {
    this.mapInitialised = true;
    return new Promise((resolve) => {
      this.geolocation.getCurrentPosition(options).then((position) => {
        // UNCOMMENT FOR NORMAL USE
        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //let latLng = new google.maps.LatLng(40.713744, -74.009056);
        let mapOptions = {
          center: latLng,
          zoom: 15,
          panControl: false,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          scrollwheel: false,
          styles: style,
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(this.mapElement, mapOptions);
        this.addMarker(position.coords.latitude, position.coords.longitude);
        resolve(true);

      });

    });

  }

  disableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "block";
    }

  }

  enableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "none";
    }

  }

  addConnectivityListeners(): void {

    document.addEventListener('online', () => {

      console.log("online");

      setTimeout(() => {

        if (typeof google == "undefined" || typeof google.maps == "undefined") {
          this.loadGoogleMaps();
        }
        else {
          if (!this.mapInitialised) {
            this.initMap();
          }

          this.enableMap();
        }

      }, 2000);

    }, false);

    document.addEventListener('offline', () => {

      console.log("offline");

      this.disableMap();

    }, false);

  }

  addMarker(lat: number, lng: number): void {

    let latLng = new google.maps.LatLng(lat, lng);

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });

    this.markers.push(marker);

  }

  getCurrentPosition(): void {

    this.geolocation.getCurrentPosition(options).then((position) => {
      let alert = this.alertCtrl.create({
        title: 'Thanks!',
        subTitle: 'Successfully Marked this spot!!',
        buttons: ['Ok']
      });
      alert.present();
      // UNCOMMENT FOR NORMAL USE
      //let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      console.log(position.coords.latitude + "+" + position.coords.longitude);
      var userSpotInformation = {
        // "username": this.auth.user['name'] || null,
        // "email": this.auth.user['email'] || null,
        "parkingInfo": [{
          "lat": position.coords.latitude,
          "lng": position.coords.longitude,
          "date-time": new Date(),
          "isEmpty": true
        }]
      };

    });

  }

}
