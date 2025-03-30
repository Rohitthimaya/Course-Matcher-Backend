const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const router = express.Router();
const authenticateToken = require("../middlewares/auth");

// Add Course to User
router.post("/add", authenticateToken, async (req, res) => {
    try {
        const { id } = req.user;  
        const userId = id;
        const {courseId } = req.body;
  
      // Debug logs
      console.log("Request Body:", req.body);
  
      // Validate inputs
      if (!userId || !courseId) {
        return res.status(400).json({ message: "Missing userId or courseId" });
      }
  
      // Fetch user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Convert courseId to ObjectId
      const ObjectId = require('mongoose').Types.ObjectId;
      const courseObjectId = new ObjectId(courseId);  // Convert string to ObjectId
  
      // Check if course exists (pre-added by admin)
      const course = await Course.findById(courseObjectId);  // Use findById to search by ObjectId
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      // Check if course already added
      if (user.courses.includes(courseId)) {
        return res.status(400).json({ message: "Course already added" });
      }
  
      // Add course to user's list
      user.courses.push(courseId);
      await user.save();
  
      return res.status(200).json({
        message: "Course added successfully",
        updatedUser: user,
      });
    } catch (err) {
      console.error("Error adding course:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
});



// View All Courses for a Student
router.get("/courses", authenticateToken, async (req, res) => {
    try {
        const { id } = req.user;  
        const userId = id;
        console.log(req.user)
      
        const user = await User.findById(userId).populate('courses');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Courses fetched successfully",
            courses: user.courses,
        });
    } catch (err) {
        console.error("Error fetching courses:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Delete a Course for a Student
router.delete("/courses/delete/:courseId", authenticateToken, async (req, res) => {
    try {
        const { id } = req.user;
        const userId = id;
        const { courseId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.courses.includes(courseId)) {
            return res.status(400).json({ message: "Course not found in user's enrolled courses" });
        }

        user.courses.pull(courseId);
        await user.save();

        return res.status(200).json({
            message: "Course deleted successfully",
            updatedUser: user,
        });
    } catch (err) {
        console.error("Error deleting course:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


// Add Course for Admin
router.post("/admin/add", authenticateToken, async (req, res) => {
    try {
        // Check if the logged-in user is an admin
        const { email } = req.user; // Extract user info from the decoded token
        if (email !== "t00696731@mytru.ca") {
            return res.status(403).json({ message: "Access denied. Only admin can add courses." });
        }

        // Extract course data from request body
        const { crn, subject, courseNumber, title, section, instructor, schedule, campus } = req.body;

        // Validate course data
        if (!crn || !subject || !courseNumber || !title || !section) {
            return res.status(400).json({ message: "Missing required course fields." });
        }

        // Check if the course already exists (unique CRN)
        const existingCourse = await Course.findOne({ crn });
        if (existingCourse) {
            return res.status(400).json({ message: "Course already exists with this CRN." });
        }

        // Create a new course
        const newCourse = new Course({
            crn,
            subject,
            courseNumber,
            title,
            section,
            instructor,
            schedule,
            campus
        });

        // Save the new course to the database
        await newCourse.save();

        return res.status(201).json({
            message: "Course added successfully",
            course: newCourse
        });
    } catch (err) {
        console.error("Error adding course:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Admin Delete Course
router.delete("/admin/delete/:courseId", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        if (email !== "t00696731@mytru.ca") {
            return res.status(403).json({ message: "Access denied. Only admin can delete courses." });
        }

        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Remove course from all users who are enrolled in this course
        await User.updateMany({ courses: courseId }, { $pull: { courses: courseId } });

        // Use findByIdAndDelete instead of course.remove
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error("Error deleting course:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


// Admin Update Course
router.put("/admin/update/:courseId", authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        if (email !== "t00696731@mytru.ca") {
            return res.status(403).json({ message: "Access denied. Only admin can update courses." });
        }

        const { courseId } = req.params;
        const { crn, subject, courseNumber, title, section, instructor, schedule, campus } = req.body;

        if (!crn || !subject || !courseNumber || !title || !section) {
            return res.status(400).json({ message: "Missing required course fields." });
        }

        // Find the course to update
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Update the course details
        course.crn = crn;
        course.subject = subject;
        course.courseNumber = courseNumber;
        course.title = title;
        course.section = section;
        course.instructor = instructor;
        course.schedule = schedule;
        course.campus = campus;

        // Save the updated course
        await course.save();

        return res.status(200).json({ message: "Course updated successfully", course });
    } catch (err) {
        console.error("Error updating course:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get All Available Courses
router.get("/all", authenticateToken, async (req, res) => {
    try {
        // Fetch all courses
        const courses = await Course.find();

        // Check if courses exist
        if (!courses.length) {
            return res.status(404).json({ message: "No courses found" });
        }

        // Return the list of courses
        return res.status(200).json({
            message: "Courses fetched successfully",
            courses: courses,
        });
    } catch (err) {
        console.error("Error fetching courses:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get Matches with Only Common Courses
router.get('/matches/', authenticateToken, async (req, res) => {
    const { id } = req.user;
    const userId = id;

    try {
        // Fetch the current user with populated course details
        const user = await User.findById(userId).populate('courses');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get the current user's courses
        const userCourses = user.courses.map(course => course._id.toString());

        // Find users who have **at least one** common course, excluding the current user
        const matches = await User.find({
            _id: { $ne: userId },  // Exclude the current user
            courses: { $in: userCourses }  // Match courses
        })
        .populate('courses')
        .select('name email courses'); 

        // Filter out only the common courses for each matched user
        const formattedMatches = matches.map(match => ({
            name: match.name,
            email: match.email,
            commonCourses: match.courses.filter(course => userCourses.includes(course._id.toString()))
        })).filter(match => match.commonCourses.length > 0); // Ensure there's at least one common course

        res.status(200).json({ matches: formattedMatches });
    } catch (err) {
        console.error("Error fetching matches:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// // Get Matches
// // Get Matches with Course Details
// router.get('/matches/', authenticateToken, async (req, res) => {
//     const { id } = req.user;
//     const userId = id;
  
//     try {
//       // Fetch the current user with populated course details
//       const user = await User.findById(userId).populate('courses');
//       if (!user) return res.status(404).json({ error: 'User not found' });
  
//       // Find users with matching courses, excluding the current user
//       const matches = await User.find({
//         _id: { $ne: userId },  // Ensure current user is excluded
//         courses: { $in: user.courses },  // Match courses with the current user's courses
//       })
//         .populate('courses')  // Populate courses for each matching user
//         .select('name email courses');  // Select name, email, and courses (now with full course details)
  
//       res.status(200).json({ matches });
//     } catch (err) {
//       console.error("Error fetching matches:", err.message);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
  
  

module.exports = router;
