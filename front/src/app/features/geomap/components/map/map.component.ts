import { AfterViewInit, OnInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageWMS from 'ol/source/ImageWMS.js';
import VectorSource from "ol/source/Vector";
import Vector from "ol/layer/Vector";
import { Fill, Stroke, Style } from "ol/style";
import Polygon from "ol/geom/Polygon";
import Feature, { FeatureLike } from "ol/Feature";
import OSM from "ol/source/OSM";
import ImageLayer from 'ol/layer/Image';
import { Measure } from '../../utils/generateMockedMeasures';
import { buildMatrixAndAggregate } from '../../utils/handleMeasures';
import { formDefaultValues, FormValuesType } from '../../pages/map/map.page';
import { StyleFunction } from 'ol/style/Style';
import { BAD_COST_DEFAULT_COLOR, BAD_RSSI_DEFAULT_COLOR, GOOD_COST_DEFAULT_COLOR, GOOD_RSSI_DEFAULT_COLOR, REGULAR_COST_DEFAULT_COLOR, REGULAR_RSSI_DEFAULT_COLOR } from '../../../configs/pages/config/config.page';
import { hexToRgb } from '../../utils/colors';

export const polygonStyleFunction: StyleFunction = (feature: FeatureLike) => {
  const qualityClassification = feature.get('qualityClassification');
  const dataType = feature.get('dataType');

  const colors = {
    "custo": {
      "good": localStorage.getItem("config-cost-good-color") ?? GOOD_COST_DEFAULT_COLOR,
      "regular": localStorage.getItem("config-cost-regular-color") ?? REGULAR_COST_DEFAULT_COLOR,
      "bad": localStorage.getItem("config-cost-bad-color") ?? BAD_COST_DEFAULT_COLOR,
    },
    "rssi": {
      "good": localStorage.getItem("config-rssi-good-color") ?? GOOD_RSSI_DEFAULT_COLOR,
      "regular": localStorage.getItem("config-rssi-regular-color") ?? REGULAR_RSSI_DEFAULT_COLOR,
      "bad": localStorage.getItem("config-rssi-bad-color") ?? BAD_RSSI_DEFAULT_COLOR,
    }
  }

  const connectionStyle = new Style({
    fill: new Fill({
      // @ts-ignore
      color: hexToRgb(colors[dataType][qualityClassification]?.replace("#", ""), 0.4),
    }),
    stroke: new Stroke({
      // @ts-ignore
      color: colors[dataType][qualityClassification],
      width: 1
    })
  });

  return connectionStyle;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
  polygonsLayer: Vector<any> | undefined;
  map: Map | undefined;

  @Input() updatePolygonsLayer: undefined | ((m: Vector<any>) => void);
  @Input() measures: Array<Measure> = [];
  @Input() formValues: FormValuesType = formDefaultValues;

  ngOnInit(): void {}

  ngAfterViewInit() {
    let connectionsVectorSource = new VectorSource({features: []});

    this.polygonsLayer = new Vector({
      source: connectionsVectorSource,
      style: polygonStyleFunction
    });

    this.map = new Map({
      target: "map",
      layers: [
        new TileLayer({ source: new OSM() }),
        new ImageLayer({
          extent: [-43.976368616, -20.510904917, -43.824099190, -20.410643808],
          source: new ImageWMS({
            projection: "EPSG:4326",
            url: 'http://localhost:8080/geoserver/wms',
            params: {
              'LAYERS': 'csn_workspace:congonhas_2018_2019',
              'FORMAT': 'image/png'
            },
            ratio: 1,
            serverType: 'geoserver',
          }),
        }),
        this.polygonsLayer,
      ],
      view: new View({
        projection: "EPSG:4326",
        extent: [-43.976368616, -20.510904917, -43.824099190, -20.410643808],
        center: [-43.900233903, -20.9607743625],
        zoom: 13
      })
    });

    this.map.on('moveend', () => this.addPolygons());
    this.addPolygons();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formValues']?.currentValue) {
      this.formValues = {
        ...changes['formValues'].currentValue,
        precision: Number(changes['formValues'].currentValue.precision)
      };
    } else if (changes['measures']?.currentValue) {
      this.measures = [...changes['measures'].currentValue];
    }

    this.addPolygons()
  }

  filterMeasures = ({ timestamp }: Measure) => {
    const { startAt, endAt } = this.formValues;

    if (
      startAt
      && Number(new Date(timestamp)) <= Number(new Date(startAt))
    )
      return false;

    if (
      endAt
      && Number(new Date(timestamp)) >= Number(new Date(endAt))
    )
      return false;

    return true;
  }

  addPolygons() {
    this?.polygonsLayer?.getSource()?.clear();

    const precision = Number(this.formValues.precision);
    const dataType = this.formValues.dataType;

    const DEFAULT_EXTENT: [number, number, number, number] =
      [-43.976368616, -20.510904917, -43.824099190, -20.410643808];
    const extent = (this.map?.getView().calculateExtent(this.map.getSize()) as [number, number, number, number])
      ?? DEFAULT_EXTENT;

    const {
      goodCoordinates,
      regularCoordinates,
      badCoordinates
    } = buildMatrixAndAggregate(this.measures.filter(this.filterMeasures), precision, dataType, extent);

    const qualityGroups = [
      { coords: badCoordinates, quality: 'bad' },
      { coords: regularCoordinates, quality: 'regular' },
      { coords: goodCoordinates, quality: 'good' },
    ];

    qualityGroups.forEach(({ coords, quality }) => {
      coords.forEach((cellCoords) => {
        const measuresGeometry = new Polygon([cellCoords])
          .transform('EPSG:4326', this.map?.getView().getProjection());

        const polygonsFeatures = new Feature(measuresGeometry);

        polygonsFeatures.setProperties({ qualityClassification: quality, dataType });

        this.polygonsLayer?.getSource()?.addFeature(polygonsFeatures);
      });
    });

    if (this.updatePolygonsLayer && this.polygonsLayer)
      this.updatePolygonsLayer(this.polygonsLayer);
  }
}
