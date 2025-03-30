import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppBar, Toolbar, Button, Container, Typography } from "@mui/material";

function Navbar() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, token: null });
    navigate("/login");
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Course Matcher</Typography>
          <div>
            {auth.isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/courses">Courses</Button>
                <Button color="inherit" component={Link} to="/matches">Matches</Button>
                <Button color="inherit" component={Link} to="/add-course">Add Course</Button>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </>
            )}
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
