import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { GeoFeatureCollection } from 'src/models/geojson.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  geoJsonObject!: GeoFeatureCollection;

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
      .get<GeoFeatureCollection>('http://127.0.0.1:5000/ci_vettore/50')
      .subscribe(this.prepareData);
  }

  prepareData = (data: GeoFeatureCollection) => {
    this.geoJsonObject = data;
    console.log(this.geoJsonObject);
  };
}
