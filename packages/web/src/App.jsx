import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-4xl font-semibold tracking-tight">
                ColdMailer
              </h1>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
