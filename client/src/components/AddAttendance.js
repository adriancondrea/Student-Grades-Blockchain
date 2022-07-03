import {Button} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useUsers} from "../contexts/UsersContext";

export default function AddAttendance(props) {
    const {getTransactionsGivenUser} = useUsers();
    const navigate = useNavigate();
    const [attendanceRecorded, setAttendanceRecorded] = useState(false);

    useEffect(() => {
        (async () => {
            const hasAttendance = (await getTransactionsGivenUser(props.userId))
                .filter(transaction => transaction.courseId === props.course.id).length !== 0;
            setAttendanceRecorded(hasAttendance);
        })();
    }, [props.userId]);

    const addAttendance = (e, courseId, courseStartTime, courseEndTime, amount) => {
        e.preventDefault();
        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'userId': props.userId, courseId, courseStartTime, courseEndTime, amount})
        }).then(response => response.json())
            .then(json => {
                alert(json.message || json.type);
                navigate('/transaction-pool');
            });
    }

    if (!attendanceRecorded) {
        return (
            <Button className='btn btn-secondary'
                    onClick={(e) => {
                        addAttendance(e, props.course.id, props.course.startTime, props.course.endTime,
                            Number(props.course.points))
                        setAttendanceRecorded(true);
                    }}>Add attendance</Button>
        );
    } else {
        return <Button variant="success">Attendance already added!</Button>
    }
}