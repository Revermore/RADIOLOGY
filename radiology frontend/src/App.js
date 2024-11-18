import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./Screens/LandingPage";
import Login from "./Screens/Login";
import OHIFViewer from "./Screens/OHIFViewer";
import Dcmvi from "./Screens/dcmViewer";
import SignUp from "./Screens/signUp";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/MammoPred" element={<OHIFViewer />} />
          <Route path="/DcmViewer" element={<Dcmvi />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
