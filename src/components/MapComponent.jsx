/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import * as turf from "@turf/turf";

const ORS_API_KEY = "5b3ce3597851110001cf6248b325eccab80b40b19afa714f5f325aff"; // 🔑 Thay bằng key từ https://openrouteservice.org

const MapComponent = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [popup, setPopup] = useState(null);
  const [polygonData, setPolygonData] = useState(null);

  const iconMap = {
    Cell: "/icons/cable.ico",
    Serve: "/icons/server.png",
    C: "/icons/satellite.png",
  };

  // Tải dữ liệu GeoJSON từ file
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const res = await fetch("/phuong_v.geojson");
        const data = await res.json();
        setPolygonData(data); // Gán dữ liệu vào state
      } catch (error) {
        console.error("Lỗi khi load GeoJSON:", error);
      }
    };

    loadGeoJSON();
  }, []);

  // Thêm polygon vào bản đồ khi dữ liệu đã sẵn sàng
  // useEffect(() => {
  //   if (!mapRef.current || !polygonData) return;

  //   console.log(polygonData);
  //   const handleMapLoad = () => {
  //     if (mapRef.current.getSource("phuong-v")) return;

  //     mapRef.current.addSource("phuong-v", {
  //       type: "geojson",
  //       data: polygonData,
  //     });

  //     mapRef.current.addLayer({
  //       id: "phuong-v-fill",
  //       type: "fill",
  //       source: "phuong-v",
  //       paint: {
  //         "fill-color": "#3b82f6",
  //         "fill-opacity": 0.4,
  //       },
  //     });

  //     mapRef.current.addLayer({
  //       id: "phuong-v-outline",
  //       type: "line",
  //       source: "phuong-v",
  //       paint: {
  //         "line-color": "#1d4ed8",
  //         "line-width": 2,
  //       },
  //     });
  //   };

  //   mapRef.current.on("load", handleMapLoad);

  //   return () => {
  //     mapRef.current.off("load", handleMapLoad);
  //   };
  // }, [polygonData]); // chạy lại khi polygonData đã có

  useEffect(() => {
    if (!polygonData) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://api.maptiler.com/maps/streets/style.json?key=MbqXwGIitn8E6AmNEDTz", //https://cloud.maptiler.com/account/keys/
      center: [105.85, 21.03],
      zoom: 5,
    });

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [105.520321, 9.700123],
        zoom: 10,
        speed: 1.5,
        curve: 1,
      });
    }

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      if (mapRef.current.getSource("phuong-v")) return;

      mapRef.current.addSource("phuong-v", {
        type: "geojson",
        data: polygonData,
      });

      // mapRef.current.addLayer({
      //   id: "phuong-v-fill",
      //   type: "fill",
      //   source: "phuong-v",
      //   paint: {
      //     "fill-color": "#3b82f6",
      //     "fill-opacity": 0.4,
      //   },
      // });

      mapRef.current.addLayer({
        id: "phuong-v-fill",
        type: "fill",
        source: "phuong-v",
        paint: {
          "fill-color": [
            "match",
            ["get", "NAME_2"],
            "ChâuThành",
            "#ff6200ff",
            "ChâuThànhA",
            "#0073ffff",
            "LongMỹ",
            "#ff0000ff",
            "LongMỹ(Thịxã)",
            "#e0fe4bff",
            "NgãBảy",
            "#91ff00ff",
            "PhụngHiệp",
            "#00ffa2ff",
            "VịThanh",
            "#8903ffff",
            "VịThuỷ",
            "#2fff00ff",
            "#d1d5db", // màu mặc định nếu không khớp
          ],
          "fill-opacity": 0.4,
        },
      });

      mapRef.current.addLayer({
        id: "phuong-v-outline",
        type: "line",
        source: "phuong-v",
        paint: {
          "line-color": [
            "match",
            ["get", "NAME_2"],
            "ChâuThành",
            "#fb9251ff",
            "ChâuThànhA",
            "#0073ffff",
            "LongMỹ",
            "#ff0000ff",
            "LongMỹ(Thịxã)",
            "#e0fe4bff",
            "NgãBảy",
            "#91ff00ff",
            "PhụngHiệp",
            "#00ffa2ff",
            "VịThanh",
            "#8903ffff",
            "VịThuỷ",
            "#2fff00ff",
            "#d1d5db", // màu mặc định nếu không khớp
          ],
        },
      });

      loadStations();
      // addPolygon(); // Thêm polygon vào bản đồ
      //loadConnections(); // kết nối theo đường phố
      // loadStraightLineConnections(); // kết nối theo đường thẳng
    });

    mapRef.current.on("contextmenu", (e) => {
      e.preventDefault();
      const { lng, lat } = e.lngLat;

      const popupNode = document.createElement("div");
      popupNode.innerHTML = `
        <style>
          .marker-button {
            display: block;
            width: 100%;
            padding: 6px 12px;
            margin-bottom: 6px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .btn-bts { background-color: #1976d2; }
          .btn-bts:hover { box-shadow: 0 0 10px #1976d2; }
          .btn-cell { background-color: #43a047; }
          .btn-cell:hover { box-shadow: 0 0 10px #43a047; }
          .btn-sat { background-color: #f57c00; }
          .btn-sat:hover { box-shadow: 0 0 10px #f57c00; }
        </style>
        <div style="min-width: 200px;">
          <strong>🗼 Chọn loại trạm:</strong><br/>
          <button id="optionA" class="marker-button btn-bts">📶 Trạm BTS</button>
          <button id="optionB" class="marker-button btn-cell">📡 Cell</button>
          <button id="optionC" class="marker-button btn-sat">🛰️ Vệ tinh</button>
        </div>
      `;

      const newPopup = new maplibregl.Popup()
        .setLngLat([lng, lat])
        .setDOMContent(popupNode)
        .addTo(mapRef.current);

      const openForm = (label) => {
        popupNode.innerHTML = `
      <div>
        <strong>📝 Nhập thông tin trạm ${label}</strong><br/>
        <input id="stationName" placeholder="Tên trạm" style="width:100%;margin:4px 0;padding:4px;" />
        <input id="stationDesc" placeholder="Mô tả" style="width:100%;margin-bottom:8px;padding:4px;" />
        <div style="text-align:right;">
          <button id="cancelBtn" style="margin-right:6px;">❌ Hủy</button>
          <button id="confirmBtn">✅ OK</button>
        </div>
        
      </div>
    `;
        setTimeout(() => {
          document.getElementById("cancelBtn").onclick = () => {
            newPopup.remove();
          };

          document.getElementById("confirmBtn").onclick = async () => {
            const name = document.getElementById("stationName").value.trim();
            const description = document
              .getElementById("stationDesc")
              .value.trim();

            if (!name || !description) {
              alert("Vui lòng nhập đầy đủ thông tin!");
              return;
            }

            //Kiểm tra điểm có nằm trong vùng polygon hay không bằng turf
            let isInside = isPointInsidePolygon(lng, lat);

            // ✅ Lưu vào Firebase
            await addDoc(collection(db, "stations"), {
              name,
              description,
              type: label,
              lat,
              lng,
              isInside,
            });

            const start = [105.48616624889729, 9.792540318265864]; // lng, lat
            const end = [lng, lat]; // lng, lat
            // ✅ Hiển thị marker ngay lập tức
            createMarker(lng, lat, label, name, description, isInside);
            const geojson = await getStreetRoute(start, end);
            console.log(geojson);
            // checkPointInPolygon(lng, lat);
            newPopup.remove();
          };
        }, 0);
      };

      setTimeout(() => {
        document.getElementById("optionA").onclick = () => openForm("BTS");
        document.getElementById("optionB").onclick = () => openForm("Cell");
        document.getElementById("optionC").onclick = () => openForm("Vệ tinh");
      }, 0);
    });

    // ---------------------------- Các hàm dùng cho hiển thị tuyến đường từ điểm đến điểm ------------------------------------------//
    // 📍 Hiển thị marker nhà trạm
    // const loadStations = async () => {
    //   const snapshot = await getDocs(collection(db, "stations"));
    //   snapshot.forEach((doc) => {
    //     const data = doc.data();
    //     new maplibregl.Marker()
    //       .setLngLat([data.lng, data.lat])
    //       .setPopup(
    //         new maplibregl.Popup().setHTML(
    //           // `<b>${data.name}</b><br/>${data.description}`
    //           `
    //             <strong>Loại:</strong> ${data.label}<br/>
    //             <strong>Tên:</strong> ${data.name || "Không rõ"}<br/>
    //             <strong>Mô tả:</strong> ${data.description || "Không có"}<br/>
    //             <strong>Vị trí:</strong> ${data.lng.toFixed(
    //               5
    //             )}, ${data.lat.toFixed(5)}<br/>
    //           `
    //         )
    //       )
    //       .addTo(mapRef.current);
    //   });
    // };
    const loadStations = async () => {
      const snapshot = await getDocs(collection(db, "stations"));
      snapshot.forEach((doc) => {
        const data = doc.data();

        // 👉 Tạo element marker tùy biến
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";

        // Tạo label (tên trạm)
        const label = document.createElement("span");
        label.textContent = data.name;
        label.style.fontSize = "11px";
        label.style.fontWeight = "bold";
        label.style.color = "#000";
        label.style.background = "white";
        label.style.padding = "2px 4px";
        label.style.border = "1px solid #333";
        label.style.borderRadius = "4px";
        label.style.marginBottom = "2px"; // cách marker icon một chút

        // Tạo icon marker
        const markerIcon = document.createElement("div");
        markerIcon.style.width = "14px";
        markerIcon.style.height = "14px";
        markerIcon.style.borderRadius = "50%";
        markerIcon.style.backgroundColor = "red";
        markerIcon.style.border = "2px solid white";

        // Gắn label + icon vào element
        el.appendChild(label);
        el.appendChild(markerIcon);

        // 👉 Truyền element này vào Marker
        new maplibregl.Marker({ element: el })
          .setLngLat([data.lng, data.lat])
          .setPopup(
            new maplibregl.Popup().setHTML(`
          <strong>Loại:</strong> ${data.label}<br/>
          <strong>Tên:</strong> ${data.name || "Không rõ"}<br/>
          <strong>Mô tả:</strong> ${data.description || "Không có"}<br/>
          <strong>Vị trí:</strong> ${data.lng.toFixed(5)}, ${data.lat.toFixed(
              5
            )}<br/>              
        `)
          )
          .addTo(mapRef.current);
      });
    };

    // 📦 Hàm gọi OpenRouteService để lấy tuyến đường
    const getStreetRoute = async (from, to) => {
      try {
        const res = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/json",
          {
            method: "POST",
            headers: {
              Authorization: ORS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coordinates: [from, to],
            }),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();

        const distance = data?.routes?.[0]?.summary?.distance ?? null; // mét
        const duration = data?.routes?.[0]?.summary?.duration ?? null; // giây

        if (distance == null) {
          throw new Error("Không tìm thấy distance trong phản hồi ORS");
        }

        return { distance, duration };
      } catch (error) {
        console.error("❌ Lỗi khi tính khoảng cách ORS:", error);
        return null;
      }
    };

    // 📶 Hiển thị tuyến kết nối theo đường phố
    const loadConnections = async () => {
      const snapshot = await getDocs(collection(db, "connections"));
      snapshot.forEach(async (doc) => {
        const data = doc.data();

        // ✅ Kiểm tra dữ liệu
        if (!data.coordinates || !Array.isArray(data.coordinates)) {
          console.warn(`⚠️ Bỏ qua kết nối không hợp lệ (ID: ${doc.id})`);
          return;
        }

        const from = [
          data.coordinates[0].longitude,
          data.coordinates[0].latitude,
        ];
        const to = [
          data.coordinates[1].longitude,
          data.coordinates[1].latitude,
        ];

        const geojson = await getStreetRoute(from, to);
        if (!geojson) return;

        const sourceId = `conn-${doc.id}`;
        const layerId = `conn-line-${doc.id}`;

        if (!mapRef.current.getSource(sourceId)) {
          mapRef.current.addSource(sourceId, {
            type: "geojson",
            data: geojson,
          });

          mapRef.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1e88e5",
              "line-width": 4,
            },
          });
        }
      });
    };

    const loadStraightLineConnections = async () => {
      try {
        const connSnap = await getDocs(collection(db, "connections"));
        const connections = [];

        for (const doc of connSnap.docs) {
          const connData = doc.data();
          const connId = doc.id;

          const segQuery = query(
            collection(db, "fiber_segments"),
            where("connection_id", "==", connId)
          );
          const segSnap = await getDocs(segQuery);
          const segments = segSnap.docs.map((s) => s.data());

          connections.push({
            id: connId,
            station_path: connData.station_path,
            description: connData.description || "",
            segments,
          });
        }

        return connections;
      } catch (err) {
        console.error("❌ Lỗi khi load connections:", err);
        return [];
      }
    };
    // ------------------------------------------------------------------------------------------------------------------------------//

    // 🗺️ Hàm tạo marker tùy chỉnh
    // const createMarker = (lng, lat, label, name, description) => {
    //   const iconSrc = iconMap[label] || label || "/icons/tower-cell.png"; // fallback nếu label không hợp lệ

    //   checkPointInPolygon(lng, lat);

    //   const el = document.createElement("img");
    //   el.src = iconSrc;
    //   el.style.width = "42px";
    //   el.style.height = "42px";

    //   new maplibregl.Marker({ element: el })
    //     .setLngLat([lng, lat])
    //     .setPopup(
    //       new maplibregl.Popup().setHTML(`
    //     <strong>Loại:</strong> ${label}<br/>
    //     <strong>Vị trí:</strong> ${lng.toFixed(5)}, ${lat.toFixed(5)}
    //   `)
    //     )
    //     .addTo(mapRef.current);
    // };
    const createMarker = (lng, lat, label, name, description, isInside) => {
      const iconSrc = iconMap[label] || label || "/icons/tower-cell.png"; // fallback

      //Kiểm tra điểm có nằm trong vùng polygon hay không bằng turf

      // Tạo icon
      const el = document.createElement("img");
      el.src = iconSrc;
      el.style.width = "42px";
      el.style.height = "42px";
      el.title = isInside ? "Bên trong vùng" : "Ngoài vùng";
      // if (!polygonData) {
      //   console.log("Chưa có dữ liệu polygon.");
      // }

      // Tạo marker
      new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup().setHTML(`
        <strong>Loại:</strong> ${label}<br/>
        <strong>Tên:</strong> ${name || "Không rõ"}<br/>
        <strong>Mô tả:</strong> ${description || "Không có"}<br/>
        <strong>Vị trí:</strong> ${lng.toFixed(5)}, ${lat.toFixed(5)}<br/>
        <strong>Trạng thái:</strong> <span style="color:${
          isInside ? "green" : "red"
        }">${isInside ? "✔ Trong vùng" : "✖ Ngoài vùng"}</span>
      `)
        )
        .addTo(mapRef.current);

      // Nếu ngoài vùng, có thể thêm popup cảnh báo (nếu muốn)
      if (!isInside) {
        new maplibregl.Popup()
          .setLngLat([lng, lat])
          .setHTML("<b>⚠️ Marker này nằm ngoài phạm vi Phường V!</b>")
          .addTo(mapRef.current);
      }
    };

    function isPointInsidePolygon(lng, lat) {
      if (polygonData && polygonData.features && polygonData.features.length) {
        const point = turf.point([lng, lat]);

        // Nếu muốn kiểm tra tất cả polygon trong danh sách:
        for (const feature of polygonData.features) {
          if (turf.booleanPointInPolygon(point, feature)) {
            return true;
          }
        }
      }

      return false;
    }

    function distanceBetweenPoints(lng2, lat2) {
      const point1 = turf.point([105.48403549431862, 9.790994225924578]);
      const point2 = turf.point([lng2, lat2]);

      const distance = turf.distance(point1, point2, { units: "kilometers" });

      return Number(distance.toFixed(2));
    }

    // const checkPointInPolygon = (lng, lat) => {
    //   if (!polygonData) {
    //     console.warn("Chưa có dữ liệu polygon.");
    //     return false;
    //   }

    //   const point = turf.point([lng, lat]);
    //   const polygon = turf.featureCollection(polygonData.features);

    //   // Duyệt qua từng polygon (nếu có nhiều phường)
    //   for (const feature of polygon.features) {
    //     if (turf.booleanPointInPolygon(point, feature)) {
    //       return true; // Điểm nằm trong 1 polygon
    //     }
    //   }

    //   return false; // Không nằm trong polygon nào
    // };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygonData]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapComponent;
