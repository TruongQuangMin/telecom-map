import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";

const MyMap = () => {
  const mapContainerRef = useRef(null);
  const [polygonData, setPolygonData] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Load GeoJSON
    fetch("/phuong_v.geojson")
      .then((res) => res.json())
      .then((data) => setPolygonData(data));
  }, []);

  //Hiển thị bản đồ
  useEffect(() => {
    if (!polygonData) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://api.maptiler.com/maps/streets/style.json?key=MbqXwGIitn8E6AmNEDTz",
      center: [105.467, 9.782],
      zoom: 15,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

    mapInstance.on("load", () => {
      // Add polygon
      mapInstance.addSource("phuong-v", {
        type: "geojson",
        data: polygonData,
      });

      mapInstance.addLayer({
        id: "phuong-v-fill",
        type: "fill",
        source: "phuong-v",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.4,
        },
      });

      mapInstance.addLayer({
        id: "phuong-v-outline",
        type: "line",
        source: "phuong-v",
        paint: {
          "line-color": "#1d4ed8",
          "line-width": 2,
        },
      });
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, [polygonData]);

  // Khi click bản đồ → kiểm tra điểm có nằm trong vùng không
  useEffect(() => {
    if (!map || !polygonData) return;

    map.on("click", (e) => {
      const clickedPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);
      const isInside = turf.booleanPointInPolygon(clickedPoint, polygonData.features[0]);

      // Hiển thị marker
      new maplibregl.Marker({ color: isInside ? "green" : "red" })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map);

      // Hiển thị popup cảnh báo nếu ngoài vùng
      if (!isInside) {
        new maplibregl.Popup()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML("<b>⚠️ Điểm nằm ngoài phạm vi Phường V!</b>")
          .addTo(map);
      }
    });
  }, [map, polygonData]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default MyMap;
