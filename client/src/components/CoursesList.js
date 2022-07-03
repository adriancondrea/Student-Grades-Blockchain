import React, {useState} from "react";
import {Button, Card, Form, Modal} from "react-bootstrap";
import AppNavbar from "./AppNavbar";
import {useAuth} from "../contexts/AuthContext";
import AddAttendance from "./AddAttendance";
import {useCourses} from "../contexts/CoursesContext";
import {useUsers} from "../contexts/UsersContext";


export default function CoursesList() {
    const {currentUser} = useAuth();
    const {coursesList} = useCourses();
    const {usersList, isAdmin} = useUsers();
    const [selectedCourse, setSelectedCourse] = useState();
    const [selectedUserId, setSelectedUserId] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleAddAttendance = (course) => {
        setSelectedCourse(course);
        handleShow();
    }

    const updateRecipient = event => {
        setSelectedUserId(event.target.value);
    }

    return (
        <>
            <AppNavbar/>
            <Card className='mx-3'>
                <Card.Body>
                    <h3 className="text-center mb-4">Courses</h3>
                    {coursesList && coursesList.length > 0 ? coursesList?.map((course, index) =>
                            <Card key={index} className='m-5'>
                                <Card.Body>
                                    <Card.Title>
                                        {course.name}
                                    </Card.Title>
                                    <Card.Subtitle>
                                        Points: {course.points}
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <>{new Date(course.startTime).toLocaleString()} - {new Date(course.endTime).toLocaleString()}</>
                                        <br/>
                                        {(() => {
                                            const currentDate = new Date();
                                            if (isAdmin) {
                                                return (<Button className='btn btn-secondary'
                                                                onClick={() => handleAddAttendance(course)}>Add student's
                                                    attendance</Button>);
                                            } else if (currentDate >= Date.parse(course.startTime) && currentDate <= Date.parse(course.endTime)) {
                                                return (<AddAttendance course={course} userId={currentUser.uid}/>);
                                            } else {
                                                return ('');
                                            }
                                        })()}

                                    </Card.Text>
                                </Card.Body>
                            </Card>) :
                        <h4 className="text-center">No courses added yet!</h4>}
                </Card.Body>
            </Card>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header className='leaderboard-modal' closeButton>
                    <Modal.Title>{selectedCourse?.name} - Add Attendance</Modal.Title>
                </Modal.Header>
                <Modal.Body className='leaderboard-modal'>
                    <Form.Group>
                        <Form.Label>Student</Form.Label>
                        <Form.Select onChange={updateRecipient}>
                            <option>Select student to add attendance to</option>
                            {usersList && usersList.length > 0 ?
                                usersList
                                    .filter(user => !user.isAdmin)
                                    .map((user, index) =>
                                        <option key={index}
                                                value={user.id}>{user.email}</option>) :
                                <option>No users!</option>}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className='leaderboard-modal'>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <AddAttendance course={selectedCourse} userId={selectedUserId}/>
                </Modal.Footer>
            </Modal>
        </>
    );
}