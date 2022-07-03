import React, {useContext, useEffect, useState} from "react";
import {database} from "../firebase";

const CoursesContext = React.createContext({});

export function useCourses() {
    return useContext(CoursesContext);
}

export function CoursesProvider({children}) {
    const [coursesList, setCoursesList] = useState([]);

    useEffect(() => {
        const coursesRef = database.ref('/courses');
        coursesRef.on('value', (snapshot) => {
            const courses = snapshot.val();
            const coursesList = [];
            for (let id in courses) {
                coursesList.push({id, ...courses[id]});
            }
            const currentDate = new Date();
            // sort courses by the modulo of the difference between the current time and start time of the course
            coursesList.sort((a, b) => Math.abs(currentDate - new Date(a.startTime)) - Math.abs(currentDate - new Date(b.startTime)))
            setCoursesList(coursesList);
        })
    }, []);

    const getCourseGivenId = (courseId) => {
        return coursesList.find(course => course.id === courseId);
    }

    const value = {
        coursesList,
        getCourseGivenId
    }

    return (
        <CoursesContext.Provider value={value}>
            {children}
        </CoursesContext.Provider>
    );
}