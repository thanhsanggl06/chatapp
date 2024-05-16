import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Messenger from "./components/Messenger";
import Call from "./components/Call";
import ProtectRoute from "./components/ProtectRoute";
import VerificationPage from "./components/VerificationPage";
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/verify" element={<VerificationPage />}></Route>
          <Route
            path="/"
            element={
              <ProtectRoute>
                <Messenger />
              </ProtectRoute>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
