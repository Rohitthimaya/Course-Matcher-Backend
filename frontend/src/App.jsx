import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses"; 
import Matches from "./pages/Matches"; 
import AddCourse from "./pages/AddCourse"; 
import PrivateRoute from "./components/ProtectedRoute";
import {RecoilRoot} from "recoil"
 
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
        <RecoilRoot>
          <Routes>
              <Route path="/" element={<PrivateRoute><Courses /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
              <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
              <Route path="/add-course" element={<PrivateRoute><AddCourse /></PrivateRoute>} />
          </Routes>
          </RecoilRoot>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
