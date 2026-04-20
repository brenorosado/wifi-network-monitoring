import {
    GOOD_COST_DEFAULT_PARAMETER,
    GOOD_RSSI_DEFAULT_PARAMETER,
    REGULAR_COST_DEFAULT_PARAMETER,
    REGULAR_RSSI_DEFAULT_PARAMETER
} from "../../configs/pages/config/config.page";
import { Measure } from "./generateMockedMeasures";

export type GatheredMockedMeasures = {
    id: number;
    averageLatitude: number;
    averageLongitude: number;
    averageCost: number;
    averageRssi: number;
    measures: Measure[]
}

export type ClassifiedGatheredMeasures = {
    goodCoordinates: number[][][],
    regularCoordinates: number[][][],
    badCoordinates: number[][][]
}


export const buildMatrixAndAggregate = (
    measures: Measure[],
    precision: number,
    dataType: "custo" | "rssi",
    extent: [number, number, number, number]
): ClassifiedGatheredMeasures => {
    const [minLon, minLat, maxLon, maxLat] = extent;
    const cellMap = new Map<string, Measure[]>();

    // Assign each measure to its absolute grid cell (anchored to 0,0 — not the viewport)
    measures.forEach((measure) => {
        const col = Math.floor(measure.longitude / precision);
        const row = Math.floor(measure.latitude / precision);
        const key = `${col},${row}`;
        const existing = cellMap.get(key) ?? [];
        cellMap.set(key, [...existing, measure]);
    });

    const gatheredMeasures: GatheredMockedMeasures[] = [];
    let id = 1;

    cellMap.forEach((cellMeasures, key) => {
        const [col, row] = key.split(',').map(Number);
        const cellMinLon = col * precision;
        const cellMinLat = row * precision;
        const cellCenterLon = cellMinLon + precision / 2;
        const cellCenterLat = cellMinLat + precision / 2;

        // Skip cells outside the viewport
        if (cellCenterLon < minLon || cellCenterLon > maxLon ||
            cellCenterLat < minLat || cellCenterLat > maxLat) return;

        let accCost = 0;
        let accRssi = 0;
        cellMeasures.forEach(({ cost, rssi }) => {
            accCost += cost;
            accRssi += rssi;
        });

        gatheredMeasures.push({
            id: id++,
            averageLongitude: cellCenterLon,
            averageLatitude: cellCenterLat,
            averageCost: dataType === "custo"
                ? Math.min(...cellMeasures.map(({ cost }) => cost))
                : accCost / cellMeasures.length,
            averageRssi: accRssi / cellMeasures.length,
            measures: cellMeasures
        });
    });

    return classifyGatheredMeasures(gatheredMeasures, precision, dataType);
}

export const getPoligonsPointsCoordinates = (
    longitude: number,
    latitude: number,
    precision: number
): number[][] => {
    return [
        [longitude - (precision / 2), latitude + (precision / 2), 0],
        [longitude - (precision / 2), latitude - (precision / 2), 0],
        [longitude + (precision / 2), latitude - (precision / 2), 0],
        [longitude + (precision / 2), latitude + (precision / 2), 0]
    ];
}

export const classifyGatheredMeasures = (
    gatheredMeasures: GatheredMockedMeasures[],
    precision: number,
    dataType: "custo" | "rssi"
): ClassifiedGatheredMeasures => {
    const goodCoordinates: number[][][] = [];
    const regularCoordinates: number[][][] = [];
    const badCoordinates: number[][][] = [];

    gatheredMeasures.forEach(({
        averageLatitude,
        averageLongitude,
        averageCost,
        averageRssi
    }) => {
        const poligonsPointsCoodinates = getPoligonsPointsCoordinates(
            averageLongitude,
            averageLatitude,
            precision
        );

        const costProps = {
            averageValue: averageCost,
            goodParameter: Number(
                localStorage.getItem("config-cost-good") ??
                GOOD_COST_DEFAULT_PARAMETER
            ),
            regularParameter: Number(
                localStorage.getItem("config-cost-regular") ??
                REGULAR_COST_DEFAULT_PARAMETER
            )
        }

        const classifyCost = () => {
            // menor = melhor
            if (costProps.averageValue < costProps.goodParameter) {
                goodCoordinates.push(poligonsPointsCoodinates);
                return;
            }

            if (costProps.averageValue < costProps.regularParameter) {
                regularCoordinates.push(poligonsPointsCoodinates);
                return;
            }

            badCoordinates.push(poligonsPointsCoodinates);
        }

        const rssiProps = {
            averageValue: averageRssi,
            goodParameter: Number(
                localStorage.getItem("config-rssi-good") ??
                GOOD_RSSI_DEFAULT_PARAMETER
            ),
            regularParameter: Number(
                localStorage.getItem("config-rssi-regular") ??
                REGULAR_RSSI_DEFAULT_PARAMETER
            )
        }

        const classifyRssi = () => {
            // maior = melhor
            if (rssiProps.averageValue > rssiProps.goodParameter) {
                goodCoordinates.push(poligonsPointsCoodinates);
                return;
            }

            if (rssiProps.averageValue > rssiProps.regularParameter) {
                regularCoordinates.push(poligonsPointsCoodinates);
                return;
            }

            badCoordinates.push(poligonsPointsCoodinates);
        }

        (dataType === "custo" ? classifyCost : classifyRssi)()
    });

    return {
        goodCoordinates,
        regularCoordinates,
        badCoordinates
    }
}