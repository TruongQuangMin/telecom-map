import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js"; // <- Import đúng file config

// src/importStations.js
// Tập hợp các trạm viễn thông với thông tin chi tiết
// Mỗi trạm có tên, tọa độ (vĩ độ, kinh độ) và mô tả ngắn gọn
const stations = [
  { id: "CTA008M_HUG", name: "CTA008M_HUG", lat: 9.88591, lng: 105.58485, description: "Trạm CTA008M_HUG", type: "sub" },
  { id: "CTA011M_HUG", name: "CTA011M_HUG", lat: 9.96642, lng: 105.59875, description: "Trạm CTA011M_HUG", type: "sub" },
  { id: "CTA033M_HUG", name: "CTA033M_HUG", lat: 9.96942, lng: 105.64742, description: "Trạm CTA033M_HUG", type: "sub" },
  { id: "CTA020M_HUG", name: "CTA020M_HUG", lat: 9.91640, lng: 105.63784, description: "Trạm CTA020M_HUG", type: "sub" },
  { id: "PHI054M_HUG", name: "PHI054M_HUG", lat: 9.88013, lng: 105.65441, description: "Trạm PHI054M_HUG", type: "sub" },
  { id: "CTA009M_HUG", name: "CTA009M_HUG", lat: 9.89700, lng: 105.66646, description: "Trạm CTA009M_HUG", type: "sub" },
  { id: "PHI044M_HUG", name: "PHI044M_HUG", lat: 9.90345, lng: 105.68049, description: "Trạm PHI044M_HUG", type: "sub" },
  { id: "PHI026M_HUG", name: "PHI026M_HUG", lat: 9.92100, lng: 105.71871, description: "Trạm PHI026M_HUG", type: "sub" },
  { id: "CTA019M_HUG", name: "CTA019M_HUG", lat: 9.91525, lng: 105.73990, description: "Trạm CTA019M_HUG", type: "sub" },
  { id: "CTA005M_HUG", name: "CTA005M_HUG", lat: 9.92425, lng: 105.72535, description: "Trạm CTA005M_HUG", type: "sub" },
  { id: "CTA017M_HUG", name: "CTA017M_HUG", lat: 9.95675, lng: 105.73748, description: "Trạm CTA017M_HUG", type: "sub" },
  { id: "CTA013M_HUG", name: "CTA013M_HUG", lat: 9.93212, lng: 105.67994, description: "Trạm CTA013M_HUG", type: "sub" },
  { id: "CTH022M_HUG", name: "CTH022M_HUG", lat: 9.94244, lng: 105.76694, description: "Trạm CTH022M_HUG", type: "sub" },
  { id: "CTH014M_HUG", name: "CTH014M_HUG", lat: 9.89744, lng: 105.81063, description: "Trạm CTH014M_HUG", type: "sub" },
  { id: "CTH024M_HUG", name: "CTH024M_HUG", lat: 9.93408, lng: 105.87749, description: "Trạm CTH024M_HUG", type: "sub" },
  { id: "CTH006M_HUG", name: "CTH006M_HUG", lat: 9.94789, lng: 105.87186, description: "Trạm CTH006M_HUG", type: "sub" },
  { id: "CTH015M_HUG", name: "CTH015M_HUG", lat: 9.96266, lng: 105.84258, description: "Trạm CTH015M_HUG", type: "sub" },
  { id: "CTH012M_HUG", name: "CTH012M_HUG", lat: 9.96701, lng: 105.83285, description: "Trạm CTH012M_HUG", type: "sub" },
  { id: "CTH007M_HUG", name: "CTH007M_HUG", lat: 9.94686, lng: 105.83612, description: "Trạm CTH007M_HUG", type: "sub" },
  { id: "NBA002M_HUG", name: "NBA002M_HUG", lat: 9.81125, lng: 105.82054, description: "Trạm NBA002M_HUG", type: "sub" },
  { id: "NBA001M_HUG", name: "NBA001M_HUG", lat: 9.84436, lng: 105.83065, description: "Trạm NBA001M_HUG", type: "sub" },
  { id: "NBA003M_HUG", name: "NBA003M_HUG", lat: 9.85944, lng: 105.83441, description: "Trạm NBA003M_HUG", type: "sub" },
  { id: "NBA018M_HUG", name: "NBA018M_HUG", lat: 9.80705, lng: 105.83358, description: "Trạm NBA018M_HUG", type: "sub" },
  { id: "NBA005M_HUG", name: "NBA005M_HUG", lat: 9.78353, lng: 105.84035, description: "Trạm NBA005M_HUG", type: "sub" },
  { id: "NBA004M_HUG", name: "NBA004M_HUG", lat: 9.84680, lng: 105.79186, description: "Trạm NBA004M_HUG", type: "sub" },
  { id: "PHI040M_HUG", name: "PHI040M_HUG", lat: 9.86773, lng: 105.73343, description: "Trạm PHI040M_HUG", type: "sub" },
  { id: "PHI041M_HUG", name: "PHI041M_HUG", lat: 9.88850, lng: 105.76284, description: "Trạm PHI041M_HUG", type: "sub" },
  { id: "PHI049M_HUG", name: "PHI049M_HUG", lat: 9.91091, lng: 105.75287, description: "Trạm PHI049M_HUG", type: "sub" },
];

async function uploadStations() {
  for (const station of stations) {
    try {
      await addDoc(collection(db, "stations"), station);
      console.log(`✅ Đã thêm: ${station.name}`);
    } catch (error) {
      console.error(`❌ Lỗi khi thêm ${station.name}:`, error);
    }
  }
}

uploadStations();
