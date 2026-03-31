function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/plan" element={<PlanGenerator />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;
