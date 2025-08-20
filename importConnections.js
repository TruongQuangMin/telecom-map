// addConnections.js
import { addDoc, collection, GeoPoint } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const connections = [
  {
    id: "conn-VTH-VTY",
    station_path: ["VTH", "PHI", "VTY"],
    description: "Tuyến chính từ Vị Thanh đến Vị Thủy qua Phụng Hiệp",
    note: "Tuyến chính kết nối Vị Thanh và Vị Thủy qua Phụng Hiệp"
  },
  {
    id: "conn-VTY-LMY",
    station_path: ["VTY", "LMY"],
    description: "Tuyến nhánh từ Vị Thủy đến Long Mỹ",
    note: "Tuyến chính kết nối Vị Thanh và Vị Thủy qua Phụng Hiệp"

  },
  {
    id: "conn-VTY-NBA-CTA",
    station_path: ["VTY", "NBA", "CTA"],
    description: "Tuyến từ Vị Thủy đi Ngã Bảy đến Châu Thành A",
    note: "Tuyến kết nối Vị Thủy với Ngã Bảy và Châu Thành A"
  },
];

async function uploadConnections() {
  for (const conn of connections) {
    try {
      await addDoc(collection(db, "connections"), conn);
      console.log(`✅ Đã thêm tuyến từ ${conn.from} đến ${conn.to}`);
    } catch (error) {
      console.error(`❌ Lỗi khi thêm tuyến từ ${conn.from}:`, error);
    }
  }
}

uploadConnections();
