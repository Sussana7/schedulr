import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Schedule from "./components/Schedule";
import Progress from "./components/Progress";
import Login from "./components/Login";
import Generator from "./components/Generator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/generator" element={<Generator />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
