import { Measure } from "../../features/geomap/utils/generateMockedMeasures";

const API_BASE_URL = "http://localhost:4011/mapeamento";
const MEASURES_ENDPOINT = "/buscar-peers/";
const RSSI_MEASURES_ENDPOINT = "/rssi-peers"

type DateRange = { startAt?: string | null; endAt?: string | null };

export const fetchMeasures = {
    list: async (range: DateRange = {}) => {
        const response = await fetch(
            API_BASE_URL + MEASURES_ENDPOINT,
            {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(range)
            }
        );

        const fetchedMeasures = await response.json() as Measure[];

        return fetchedMeasures;
    },

    listPeersForRssi: async (range: DateRange = {}) => {
        const response = await fetch(
            API_BASE_URL + RSSI_MEASURES_ENDPOINT,
            {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(range)
            }
        );

        const fetchedMeasures = await response.json() as Measure[];

        return fetchedMeasures;
    },
}