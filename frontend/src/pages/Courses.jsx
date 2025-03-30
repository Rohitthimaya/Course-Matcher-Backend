import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert } from "@mui/material";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!auth.token) {
        return setError("No authentication token found.");
      }

      try {
        const response = await fetch("https://course-matcher-backend.onrender.com/api/courses/courses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`, 
          },
        });

        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses);
        } else {
          setError(data.message || "Failed to fetch courses");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [auth.token]);

  const handleDeleteCourse = async (courseId) => {
    if (!auth.token) {
      return alert("You must be logged in to delete a course.");
    }

    try {
      const response = await fetch(`http://localhost:3000/api/courses/courses/delete/${courseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`, 
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCourses(courses.filter(course => course._id !== courseId));
        alert(data.message); 
      } else {
        alert(data.message || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Courses</Typography>
      {courses.length === 0 ? (
        <Typography>No courses found. You are not enrolled in any courses.</Typography>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="course table">
            <TableHead>
              <TableRow>
                <TableCell>Course Number</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Campus</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.subject} {course.courseNumber}</TableCell>
                  <TableCell>{course.subject}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.section}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.schedule}</TableCell>
                  <TableCell>{course.campus}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="error" 
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      Delete
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

export default Courses;
