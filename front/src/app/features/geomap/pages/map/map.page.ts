import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component
} from '@angular/core';
import {
    MapComponent,
    polygonStyleFunction
} from '../../components/map/map.component';
import { HeaderComponent } from '../../components/header/header.component';
import KML from 'ol/format/KML.js';
import Vector from "ol/layer/Vector";
import { Feature } from 'ol';
import {
  Measure,
  DEFAULT_MIN_LATITUDE,
  DEFAULT_MAX_LATITUDE,
  DEFAULT_MIN_LONGITUDE,
  DEFAULT_MAX_LONGITUDE,
  generateMockedMeasures
} from "../../utils/generateMockedMeasures";
import { NgToastModule, NgToastService } from "ng-angular-popup";
import { fetchMeasures } from '../../../../core/services/fetchMeasures';

export type FormValuesType = {
  startAt: string | null,
  endAt: string | null,
  dataType: "custo" | "rssi",
  precision: string
}

export const formDefaultValues: FormValuesType = {
  startAt: "2019-01-01T00:00",
  endAt: new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    20,
    59
  ).toISOString().substring(0, 16),
  dataType: "custo",
  precision: "0.001"
}

@Component({
    selector: 'map-page',
    standalone: true,
    imports: [
        NgToastModule,
        MapComponent,
        HeaderComponent,
    ],
    templateUrl: './map.page.html',
    styleUrl: './map.page.css'
})
export class MapPage {
    title = 'QGisProject';
    formValues: FormValuesType = formDefaultValues;
    measures: Measure[] = [];
    polygonsLayer: Vector<any> | undefined;
    loadingMeasures: boolean = false;
  
    constructor(
      private toast: NgToastService,
      public cdr: ChangeDetectorRef,
    ) {}
  
    onSubmitForm = async (data: any) => {
      this.formValues = {...data};
      await this.fetchMeasures(false);
      this.cdr.detectChanges();
    }
  
    onGenerateKMLFile = () => {
      let kmlFormat = new KML({
        extractStyles: true,
        writeStyles: true
      });
  
      const features: Feature[] = this.polygonsLayer?.getSource().getFeatures({
        extractStyles: true
      });
  
      features.forEach(feature => feature.setStyle(polygonStyleFunction));
    
      const kmlString = kmlFormat.writeFeatures(features, {
        featureProjection: 'EPSG:4326',
      });
  
      const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CSN-${this.formValues.dataType}-${Number(new Date())}.kml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  
    updatePolygonsLayer = (newPolygonsLayer: Vector<any>) => {
      this.polygonsLayer = newPolygonsLayer;
    }
  
    fetchMeasures = async (needsToSubmitForm: boolean = true) => {
      try {
        this.loadingMeasures = true;
  
        const range = { startAt: this.formValues.startAt, endAt: this.formValues.endAt };
        const fetchedMeasures = await fetchMeasures[
          this.formValues.dataType === "rssi" ? "listPeersForRssi" : "list"
        ](range);
        
        this.measures = fetchedMeasures.filter(
          ({ latitude, longitude }) => 
            latitude >= DEFAULT_MIN_LATITUDE &&
            latitude <= DEFAULT_MAX_LATITUDE &&
            longitude >= DEFAULT_MIN_LONGITUDE &&
            longitude <= DEFAULT_MAX_LONGITUDE
        );
  
        this.loadingMeasures = false;
        if (needsToSubmitForm) this.onSubmitForm(this.formValues);
      } catch (e) {
        this.toast.error({
          position: "bottomRight",
          detail: "Erro",
          summary: "Ocorreu um erro ao buscar as medidas.",
          duration: 3000
        });
      }
    }
  
    async ngOnInit() {
      await this.fetchMeasures();
    }
}