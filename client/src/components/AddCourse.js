import {Button, Card, Form} from "react-bootstrap";
import DateTimePicker from "react-datetime-picker";
import React, {useEffect, useRef, useState} from "react";
import {database} from "../firebase";
import AppNavbar from "./AppNavbar";
import {useUsers} from "../contexts/UsersContext";

export default function AddCourse() {
    const nameRef = useRef();
    const pointsRef = useRef();
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const {isAdmin} = useUsers();

    useEffect(() => {
        if (startTime) {
            const numberOfHours = 2;
            const endTime = new Date();
            endTime.setTime(startTime.getTime() + numberOfHours * 60 * 60 * 1000);
            setEndTime(endTime);
        }
    }, [startTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await database.ref('/courses').push({
            name: nameRef.current?.value,
            points: pointsRef.current?.value,
            startTime: startTime.toString(),
            endTime: endTime.toString()
        });
        document.getElementById('addCourseForm').reset();
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <AppNavbar/>
            <Card className='auth-inner'>
                <Card.Body>
                    <h3 className="text-center mb-4">Add Course</h3>
                    <Form id='addCourseForm' onSubmit={handleSubmit}>
                        <Form.Group className='mb-3' id="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" ref={nameRef} required/>
                        </Form.Group>
                        <Form.Group className='mb-3' id="points">
                            <Form.Label>Points</Form.Label>
                            <Form.Control type="number" ref={pointsRef} required/>
                        </Form.Group>
                        <Form.Group className='mb-3' id="startTime">
                            <Form.Label className='form-label'>Start time</Form.Label>
                            <DateTimePicker className='form-control' value={startTime} onChange={setStartTime}
                                            required/>
                        </Form.Group>
                        <Form.Group className='mb-3' id="endTime">
                            <Form.Label className='form-label'>End time</Form.Label>
                            <DateTimePicker className='form-control' value={endTime} onChange={setEndTime} required/>
                        </Form.Group>
                        <Button className="w-100 mt-2" type="submit">Add Course</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}