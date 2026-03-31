import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
// import Schedule from "./pages/Schedule";
// import Progress from "./pages/Progress";
// import PlanGenerator from "./pages/PlanGenerator";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* <Route path="/schedule" element={<Schedule />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/plan" element={<PlanGenerator />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;
