import { collection, addDoc, GeoPoint } from "firebase/firestore";
import { db } from "./firebaseConfig.js"; // <- Import đúng file config

// src/importStations.js
// Tập hợp các trạm viễn thông với thông tin chi tiết
// Mỗi trạm có tên, tọa độ (vĩ độ, kinh độ) và mô tả ngắn gọn
const fiber_segments = [
  {
    from: "VTH",
    to: "PHI",
    connection_id: "conn-VTH-VTY",
    coordinates: [
      new GeoPoint(9.784567, 105.450123),
      new GeoPoint(9.680456, 105.550987)
    ],
    fiber_lines: [
      { id: "fiber1", name: "48FO", description: "Cáp chính" },
      { id: "fiber2", name: "12FO", description: "Dự phòng" },
    ],
  },
  {
    from: "PHI",
    to: "VTY",
    connection_id: "conn-VTH-VTY",
    coordinates: [
      new GeoPoint(9.680456, 105.550987),
      new GeoPoint(9.700123, 105.520321)
    ],
    fiber_lines: [
      { id: "fiber3", name: "24FO", description: "Cáp nhánh" }
    ],
  },
  {
    from: "VTY",
    to: "LMY",
    connection_id: "conn-VTY-LMY",
    coordinates: [
      new GeoPoint(9.700123, 105.520321),
      new GeoPoint(9.628901, 105.450234)
    ],
    fiber_lines: [
      { id: "fiber4", name: "12FO", description: "Tuyến phụ" }
    ],
  },
  {
    from: "VTY",
    to: "NBA",
    connection_id: "conn-VTY-NBA-CTA",
    coordinates: [
      new GeoPoint(9.700123, 105.520321),
      new GeoPoint(9.820111, 105.765432)
    ],
    fiber_lines: [
      { id: "fiber5", name: "24FO", description: "Đường chính đi Ngã Bảy" }
    ],
  },
  {
    from: "NBA",
    to: "CTA",
    connection_id: "conn-VTY-NBA-CTA",
    coordinates: [
      new GeoPoint(9.820111, 105.765432),
      new GeoPoint(9.869876, 105.650321)
    ],
    fiber_lines: [
      { id: "fiber6", name: "12FO", description: "Tuyến cuối" }
    ],
  },
];

async function uploadSegments() {
  for (const fiber_segment of fiber_segments ) {
    try {
      await addDoc(collection(db, "fiber_segments"), fiber_segment);
      console.log(`✅ Đã thêm: ${fiber_segment.connection_id}`);
    } catch (error) {
      console.error(`❌ Lỗi khi thêm ${fiber_segment.connection_id}:`, error);
    }
  }
}

uploadSegments();
