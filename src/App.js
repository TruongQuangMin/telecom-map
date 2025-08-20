import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from "./components/MapComponent.jsx";
import MyMap from "./components/MyMap.jsx";
import Login from "./pages/login.jsx";

function App() {
  // return <MapComponent/>;
  // return <MyMap/>;
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
