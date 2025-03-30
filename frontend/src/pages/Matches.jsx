import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from "@mui/material";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(""); // State to hold the filter text
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!auth.token) {
        return setError("No authentication token found.");
      }

      try {
        const response = await fetch("https://course-matcher-backend.onrender.com/api/courses/matches/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setMatches(data.matches);
        } else {
          setError(data.message || "Failed to fetch matches");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        console.error("Error fetching matches:", err);
      }
    };

    fetchMatches();
  }, [auth.token]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredMatches = matches.filter((match) => {
    return (
      match.name.toLowerCase().includes(filter.toLowerCase()) ||
      match.email.toLowerCase().includes(filter.toLowerCase()) ||
      match.commonCourses.some((course) =>
        course.title.toLowerCase().includes(filter.toLowerCase()) ||
        course.crn.includes(filter)
      )
    );
  });

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Matched Students</Typography>

      {/* Filter input */}
      <TextField
        label="Search by student name, email, or course title"
        variant="outlined"
        fullWidth
        value={filter}
        onChange={handleFilterChange}
        sx={{ mb: 3 }}
      />

      {filteredMatches.length === 0 ? (
        <Typography>No students are matched with your courses.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Matched Courses</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.email}>
                  <TableCell>{match.name}</TableCell>
                  <TableCell>{match.email}</TableCell>
                  <TableCell>
                    {match.commonCourses.map((course, index) => (
                      <div key={course._id}>
                        <strong>Course:</strong> {course.title}<br />
                        <strong>CRN:</strong> {course.crn}<br />
                        <strong>Instructor:</strong> {course.instructor}<br />
                        <strong>Schedule:</strong> {course.schedule}<br />
                        <strong>Campus:</strong> {course.campus}
                        {index !== match.commonCourses.length - 1 && <hr />} {/* Only add <hr> if it's not the last course */}
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default Matches;
