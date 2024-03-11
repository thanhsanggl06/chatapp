import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Messenger from "./components/Messenger";
import Call from "./components/Call";
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/" element={<Messenger />}></Route>
          <Route path="/call" element={Call}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
