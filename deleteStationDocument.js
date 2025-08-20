import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig.js"; // <- Đảm bảo đúng đường dẫn config

async function deleteStationDocument() {
  try {
    const querySnapshot = await getDocs(collection(db, "stations"));

    if (querySnapshot.empty) {
      console.log("✅ Không có document nào trong collection 'stations'.");
      return;
    }

    // Lấy ID document đầu tiên
    const firstDocId = querySnapshot.docs[0].id;
    console.log(`⏩ Giữ lại: ${firstDocId}`);

    let count = 0;

    for (const document of querySnapshot.docs) {
      if (document.id === firstDocId) continue; // Bỏ qua doc đầu tiên
      await deleteDoc(doc(db, "stations", document.id));
      console.log(`🗑️ Đã xóa: ${document.id}`);
      count++;
    }

    console.log(`✅ Đã xóa ${count} documents, giữ lại document ID: ${firstDocId}.`);
  } catch (error) {
    console.error("❌ Lỗi khi xóa documents:", error);
  }
}

deleteStationDocument();

