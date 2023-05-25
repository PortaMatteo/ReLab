import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

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
      center: [45.46416695923506, 9.190647364021228],
      zoom: 16,
    });

    this.map.pm.addControls({
      drawCircle: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
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

    this.map.on('click', (e) => {
      this.map.panTo(e.latlng);
    });

    this.map.on('pm:create', ({ layer }: any) => {
      layer.on('pm:edit', (e: any) => {});

      layer.on('pm:remove', (e: any) => {
        var radius = layer._mRadius;
        var lat = layer._latlng.lat;
        var lng = layer._latlng.lng;
        console.log(lng, lat, radius);

        this.http
          .get<Ci_vettore[]>(
            `http://127.0.0.1:5000/geogeom/${lng}/${lat}/${radius}`
          )
          .subscribe(this.prepareCiVettData);
      });
    });
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
    this.markerList.forEach((marker) => this.map.removeLayer(marker));
    this.markerList = []; //NB: markers va dichiarata tra le proprietà markers : Marker[]
    for (const iterator of data) {
      //Per ogni oggetto del vettore creo un Marker
      const marker = new L.Marker([iterator.WGS84_X, iterator.WGS84_Y])
        .setIcon(this.findImage(iterator.CI_VETTORE))
        .bindPopup(iterator.INDIRIZZO);
      // .setIcon(this.findImage(iterator.CI_VETTORE));
      marker.addTo(this.map);
      this.markerList.push(marker);

      this.map.panTo(this.LatLngMedia(data));
    }
  };

  findImage(label: string): L.Icon {
    var iconOptions = {
      iconSize: [64, 64],
      iconUrl: './assets/img/questionMark.webp',
    };

    if (label.includes('Gas')) {
      iconOptions.iconUrl = './assets/img/gas.png';
    }
    if (label.includes('elettrica')) {
      iconOptions.iconUrl = './assets/img/bolt.png';
    }

    return L.icon(iconOptions as any);
  }

  cambiaFoglio(foglio: any): boolean {
    this.http
      .get<Ci_vettore[]>(`http://127.0.0.1:5000/ci_vettore/${foglio}`)
      .subscribe(this.prepareCiVettData); //Commenta qui
    return false;
  }

  LatLngMedia(data: Ci_vettore[]): L.LatLng {
    let X =
      data
        .map((m) => m.WGS84_X)
        .reduce((sum, marker) => {
          return sum + marker;
        }, 0) / data.length;
    let Y =
      data
        .map((m) => m.WGS84_Y)
        .reduce((sum, marker) => {
          return sum + marker;
        }, 0) / data.length;

    return new L.LatLng(X, Y);
  }
}
