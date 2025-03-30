import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { Container, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert } from "@mui/material";

function AddCourse() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext); 

  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.token) {
        return setError("No authentication token found.");
      }

      try {
        const response = await fetch("https://course-matcher-backend.onrender.com/api/courses/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses);
          setFilteredCourses(data.courses); // Initially show all courses
        } else {
          setError(data.message || "Failed to fetch courses");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [auth.token]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // Filter courses based on search text
    const filtered = courses.filter((course) =>
      `${course.subject} ${course.courseNumber} ${course.title}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const handleAddCourse = async (courseId) => {
    if (!auth.token) {
      return alert("You must be logged in to add a course.");
    }

    try {
      const response = await fetch("https://course-matcher-backend.onrender.com/api/courses/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message); // Show success message
      } else {
        alert(data.message || "Failed to add course");
      }
    } catch (err) {
      console.error("Error adding course:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Add Course</Typography>

      {/* Search input */}
      <TextField
        label="Search for courses"
        variant="outlined"
        fullWidth
        value={searchText}
        onChange={handleSearch}
        sx={{ mb: 3 }}
      />

      {filteredCourses.length === 0 ? (
        <Typography>No courses available matching your search.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course Number</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Campus</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.subject} {course.courseNumber}</TableCell>
                  <TableCell>{course.subject}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.schedule}</TableCell>
                  <TableCell>{course.campus}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleAddCourse(course._id)}
                    >
                      Add
                    </Button>
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

export default AddCourse;
