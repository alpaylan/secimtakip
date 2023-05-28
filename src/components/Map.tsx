import React, { useEffect } from 'react';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, Polygon } from 'react-leaflet';
import { GeoJsonObject } from 'geojson';

import cities from '../data/cities.json';

import polygonClipping from 'polygon-clipping';
import { Ring, MultiPolygon } from 'polygon-clipping';


const divideCityMultiPolygon = (city: GeoJsonObject, weights: number[]): MultiPolygon[] => {
    console.log(city);
    const polygons = (city as any)?.geometry?.coordinates;
    console.log(polygons);
    const coords = polygons.flat().flat() as Ring;
    console.log(coords);
    const leftMost = coords.reduce((acc, coord) => Math.min(acc, coord[0]), Infinity);
    const rightMost = coords.reduce((acc, coord) => Math.max(acc, coord[0]), -Infinity);
    const topMost = coords.reduce((acc, coord) => Math.max(acc, coord[1]), -Infinity);
    const bottomMost = coords.reduce((acc, coord) => Math.min(acc, coord[1]), Infinity);
    // create n-1 points between leftMost and rightMost points based on weights
    const accumulatedWeights = weights.reduce((acc, weight) => [...acc, acc[acc.length - 1] + weight], [0]).slice(1);
    const points = accumulatedWeights.map((weight) => leftMost + (rightMost - leftMost) * weight);
    return points.map((point, index) => {
        const left = points[index - 1] || leftMost;
        const clipPolygon = [[left, bottomMost], [point, bottomMost], [point, topMost], [left, topMost]];
        // @ts-ignore
        var dividedCity = polygonClipping.intersection([clipPolygon], [coords]);
        return dividedCity;
    });
}

const divideCity = (city: GeoJsonObject, weights: number[]): MultiPolygon[] => {
    // @ts-ignore
    if (city.geometry.type !== 'Polygon') {
        return divideCityMultiPolygon(city, weights);
    }
    const coords = (city as any)?.geometry?.coordinates[0] as Ring;
    const leftMost = coords.reduce((acc, coord) => Math.min(acc, coord[0]), Infinity);
    const rightMost = coords.reduce((acc, coord) => Math.max(acc, coord[0]), -Infinity);
    const topMost = coords.reduce((acc, coord) => Math.max(acc, coord[1]), -Infinity);
    const bottomMost = coords.reduce((acc, coord) => Math.min(acc, coord[1]), Infinity);
    // create n-1 points between leftMost and rightMost points based on weights
    const accumulatedWeights = weights.reduce((acc, weight) => [...acc, acc[acc.length - 1] + weight], [0]).slice(1);
    const points = accumulatedWeights.map((weight) => leftMost + (rightMost - leftMost) * weight);
    return points.map((point, index) => {
        const left = points[index - 1] || leftMost;
        const clipPolygon = [[left, bottomMost], [point, bottomMost], [point, topMost], [left, topMost]];
        // @ts-ignore
        var dividedCity = polygonClipping.intersection([clipPolygon], [city.geometry.coordinates]);
        return dividedCity;
    });
}




const indexToColor = (index: number): string => {
    const colors = [
        'red',
        'orange',
        'white',
    ];
    return colors[index % colors.length];
}

const Map: React.FC = () => {
    const cityPartsMapped = cities.features.map((city) => {
        let w1 = Math.random();
        let w2 = Math.random();
        let w3 = Math.random();
        let sum = w1 + w2 + w3;
        return divideCity(city as GeoJsonObject, [w1/sum, w2/sum, w3/sum]);
    }).filter((cityParts) => cityParts.length > 0).flat();

    const dividedCity = {
        type: 'FeatureCollection',
        features: cityPartsMapped.map((part, index) => ({
            type: 'Feature',
            geometry: {
                type: 'MultiPolygon',
                coordinates: part,
            },
            properties: {
                color: indexToColor(index),
            },
        }))
    }

    console.log(dividedCity);
    // divideCity(cities.features[0] as GeoJsonObject, [0.25, 0.5, 0.25]);

    return (
        <MapContainer
            center={[40.505, 36.09]}
            zoom={6}
            scrollWheelZoom={false}
            style={{ height: '100vh' }}
            maxBounds={[
                [23, 30],
                [45, 45],
            ]}
            dragging={false}
            minZoom={6}
            maxZoom={6}
            doubleClickZoom={false}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />
            <Polygon
                color='white'
                fillColor='white'
                fillOpacity={1}
                opacity={1}
                positions={[
                    [-90, -360],
                    [-90, 360],
                    [90, 360],
                    [90, -360],
                ]}
            />

            <GeoJSON
                data={dividedCity as GeoJsonObject}
                style={(feature) => ({
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 1,
                    fillColor: feature?.properties.color,
                })}
            />
            <GeoJSON
                data={cities as GeoJsonObject}
                style={() => ({
                    color: 'black',
                    weight: 3,
                    opacity: 0.9,
                    fillOpacity: 0,
                })}
            />
        </MapContainer>
    )
};

export default Map;
