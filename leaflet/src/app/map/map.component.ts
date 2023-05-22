import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { Ci_vettore } from 'src/models/ci_vett.model';
import { GeoFeatureCollection } from 'src/models/geojson.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  geoJsonObject!: GeoFeatureCollection;
  markerList: Array<L.Marker> = [];

  private initMap(): void {
    this.map = L.map('map', {
      center: [45.8282, 9.5795],
      zoom: 5,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
  }

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.http
      .get<Ci_vettore[]>('http://127.0.0.1:5000/ci_vettore/140')
      .subscribe(this.prepareCiVettData);
  }

  prepareData = (data: GeoFeatureCollection) => {
    this.geoJsonObject = data;
    console.log(this.geoJsonObject);
  };

  prepareCiVettData = (data: Ci_vettore[]) => {
    console.log(data); //Verifica di ricevere i vettori energetici
    this.markerList = []; //NB: markers va dichiarata tra le proprietà markers : Marker[]
    for (const iterator of data) {
      //Per ogni oggetto del vettore creo un Marker
      const marker = new L.Marker([iterator.WGS84_X, iterator.WGS84_Y])
        .setIcon(L.icon({ iconUrl: 'assets/icon.png' , iconSize: [64, 64]}))
        .bindPopup(iterator.INDIRIZZO);
      // .setIcon(this.findImage(iterator.CI_VETTORE));
      marker.addTo(this.map);
      this.markerList.push(marker);
    }
  };
}
