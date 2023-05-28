import React from 'react';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, Polygon } from 'react-leaflet';
import { GeoJsonObject } from 'geojson';

import cities from '../data/cities.json';

import polygonClipping from 'polygon-clipping';
import { Ring, MultiPolygon } from 'polygon-clipping';
import generateVoteData from '../utils/genVoteData';
import { CityVoteData, VoteData } from '../utils/types';


const divideCityMultiPolygon = (city: GeoJsonObject, weights: number[]): MultiPolygon[] => {
    const polygons = (city as any)?.geometry?.coordinates;
    const coords = polygons.flat().flat() as Ring;
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




const indexToColor = (index: number, splitScheme: SplitScheme): string => {
    const colors =
        splitScheme === "leftStack" ? 
        ['red', 'orange', 'white']
        : splitScheme === "rightStack" ?
        ['white', 'orange', 'red']
        : ['red', 'white', 'orange'];

    return colors[index % colors.length];
}

type MonoChromeScheme = "greyScale" | "redScale" | "orangeScale";
type SplitScheme = "leftStack" | "rightStack" | "separate";
interface MapProps {
    mode: "split" | "monochrome"
    monoChromeScheme?: MonoChromeScheme
    splitScheme?: SplitScheme
}

const mockCityData: VoteData = cities.features.map((city) => ({
    name: city.properties.name,
    data: generateVoteData(city.properties.name),
}));

const computerMonochromeColor = (monoChromeScheme: MonoChromeScheme, name: string): string => {
    const city = mockCityData.find((cityData) => cityData.name === name);
    if (monoChromeScheme === "greyScale") {
        const nominator = city?.data.numberOfOpenedBallotBoxes || 0;
        const denominator = city?.data.totalNumberOfBallotBoxes || 1;
        return `rgba(0, 0, 0, ${nominator / denominator})`;
    } else if (monoChromeScheme === "redScale") {
        const nominator = city?.data.votesForKK || 0;
        const denominator = (nominator + (city?.data.votesForRTE || 0)) || 1;
        return `rgba(255, 0, 0, ${nominator / denominator})`;
    } else if (monoChromeScheme === "orangeScale") {
        const nominator = city?.data.votesForKK || 0;
        const denominator = (nominator + (city?.data.votesForRTE || 0)) || 1;
        return `rgba(255, 165, 0, ${nominator / denominator})`;
    }

    return "blue";
}

const Map: React.FC<MapProps> = (
    { mode, monoChromeScheme, splitScheme }: MapProps
) => {

    const cityPartsMapped = cities.features.map((city) => {
        const data = mockCityData.find((cityData) => cityData.name === city.properties.name)?.data || {
            votesForKK: 1,
            votesForRTE: 1,
            totalNumberOfVotes: 2,
        };

        let w1 = data.votesForKK;
        let w2 = data.votesForRTE;
        let w3 = data.totalNumberOfVotes - w1 - w2;
        let sum = w1 + w2 + w3;
        const normalizedWeights =
            splitScheme === "leftStack" ?
                [w1 / sum, w2 / sum, w3 / sum]
                : splitScheme === "rightStack" ?
                    [w3 / sum, w2 / sum, w1 / sum]
                    : [w1 / sum, w3 / sum, w2 / sum];
        return divideCity(city as GeoJsonObject, normalizedWeights);
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
                color: indexToColor(index, splitScheme || "leftStack"),
            },
        }))
    }

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
            {mode === "split" && (
                <>
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
                </>)}
            {mode === "monochrome" && (
                <GeoJSON
                    data={cities as GeoJsonObject}
                    style={(feature) => ({
                        fillColor: computerMonochromeColor(monoChromeScheme as MonoChromeScheme, feature?.properties.name),
                        color: 'black',
                        weight: 3,
                        opacity: 0.9,
                        fillOpacity: 1,
                    })
                    } />)}
        </MapContainer>
    )
};

export default Map;
