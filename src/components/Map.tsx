import React, { useEffect } from 'react';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, Polygon } from 'react-leaflet';
import { GeoJsonObject } from 'geojson';

import cities from '../data/cities.json';
import initialVoteData from '../data/votedata.json';

import polygonClipping from 'polygon-clipping';
import { Ring, MultiPolygon } from 'polygon-clipping';


const divideCity = (city: GeoJsonObject, weights: number[]): MultiPolygon[] => {
    const coords = (city as any)?.geometry?.coordinates[0] as Ring;
    const leftMost = coords.reduce((acc, coord) => Math.min(acc, coord[0]), Infinity);
    const rightMost = coords.reduce((acc, coord) => Math.max(acc, coord[0]), -Infinity);
    const topMost = coords.reduce((acc, coord) => Math.max(acc, coord[1]), -Infinity);
    const bottomMost = coords.reduce((acc, coord) => Math.min(acc, coord[1]), Infinity);
    // create n-1 points between leftMost and rightMost points based on weights
    console.log(leftMost, rightMost, topMost, bottomMost);
    const accumulatedWeights = weights.reduce((acc, weight) => [...acc, acc[acc.length - 1] + weight], [0]).slice(1);
    console.log(weights);
    console.log(accumulatedWeights);
    const points = accumulatedWeights.map((weight) => leftMost + (rightMost - leftMost) * weight);
    console.log(points);
    return points.map((point, index) => {
        console.log("point", point);
        console.log("index", index);
        const left = points[index - 1] || leftMost;
        const right = points[index + 1] || rightMost;
        console.log(left, point, right);
        const clipPolygon = [[left, bottomMost], [point, bottomMost], [point, topMost], [left, topMost]];
        console.log("leftright", left, right)
        // @ts-ignore
        var dividedCity = polygonClipping.intersection([clipPolygon], [city.geometry.coordinates]);
        console.log(dividedCity);
        return dividedCity;
    });
}


type CityVoteData = {
    // city
    cityName: string;
    // votes
    totalNumberOfVotes: number;
    countedVotes: number;
    votesForKK: number;
    votesForRTE: number;
    invalidVotes: number;
    // ballot boxes
    totalNumberOfBallotBoxes: number;
    numberOfOpenedBallotBoxes: number;
    votesForKKPercentage: number;
    votesForRTEPercentage: number;
    invalidVotesPercentage: number;
};

type VoteData = {
    data: Record<string, CityVoteData>;
};

const indexToColor = (index: number): string => {
    const colors = [
        'red',
        'yellow',
        'white',
    ];
    return colors[index % colors.length];
}

const Map: React.FC = () => {
    const [useBallotBoxes, setUseBallotBoxes] = React.useState<boolean>(false);
    const [usePercentage, setUsePercentage] = React.useState<boolean>(false);
    const [voteData, setVoteData] = React.useState<VoteData>(initialVoteData);

    const cityParts = divideCity(cities.features[0] as GeoJsonObject, [0.25, 0.5, 0.25]);
    

    const dividedCity = {
        type: 'FeatureCollection',
        features: cityParts.map((part, index) => ({
            type: 'Feature',
            geometry: {
                type: 'MultiPolygon',
                coordinates: part,
            },
            properties: {
                color: indexToColor(index),
            },
        })),
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
                data={cities as GeoJsonObject}
                style={() => ({
                    color: 'black',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9,
                    fillColor: 'red',
                })}
            />
            <GeoJSON
                data={cities.features[0] as GeoJsonObject}
                style={() => ({
                    color: 'black',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9,
                    fillColor: 'blue',
                })}
            />

            <GeoJSON
                data={dividedCity as GeoJsonObject}
                style={(feature) => ({
                    color: feature?.properties.color,
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 1,
                    fillColor: feature?.properties.color,
                })}
            />
        </MapContainer>
    )
};

export default Map;
