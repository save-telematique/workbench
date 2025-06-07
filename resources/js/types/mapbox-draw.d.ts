declare module '@mapbox/mapbox-gl-draw' {
    interface DrawOptions {
        displayControlsDefault?: boolean;
        controls?: {
            polygon?: boolean;
            trash?: boolean;
            combine_features?: boolean;
            uncombine_features?: boolean;
        };
        styles?: any[];
    }

    interface DrawFeature {
        type: 'Feature';
        geometry: GeoJSON.Geometry;
        properties: any;
    }

    interface DrawFeatureCollection {
        type: 'FeatureCollection';
        features: DrawFeature[];
    }

    export default class MapboxDraw {
        constructor(options?: DrawOptions);
        add(geojson: GeoJSON.Feature): string;
        get(id: string): DrawFeature | undefined;
        getAll(): DrawFeatureCollection;
        delete(id: string): MapboxDraw;
        deleteAll(): MapboxDraw;
        set(featureCollection: GeoJSON.FeatureCollection): string[];
        trash(): MapboxDraw;
        getMode(): string;
        changeMode(mode: string, options?: any): MapboxDraw;
        onAdd(map: any): HTMLElement;
        onRemove(map: any): void;
    }
} 