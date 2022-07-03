import React, {useEffect, useState} from "react";
import {Card} from "react-bootstrap";
import {useCourses} from "../contexts/CoursesContext";

export default function UserPoints(props) {
    const [transactions, setTransactions] = useState([]);
    const {coursesList, getCourseGivenId} = useCourses();

    useEffect(() => {
        fetch(`${document.location.origin}/api/transactions/${props.userId}`)
            .then(response => {
                response.json().then(json => {
                    setTransactions(json);
                });
            });
    }, []);

    return (
        <>
            {
                transactions && transactions.length > 0 ? transactions?.map((transaction, index) =>
                        <Card key={index} className='m-5'>
                            <Card.Body>
                                <Card.Title>
                                    Received {transaction.points} Points
                                </Card.Title>
                                <Card.Subtitle>
                                    {(() => {
                                        if (transaction.courseId && coursesList) {
                                            const course = getCourseGivenId(transaction.courseId);
                                            if (course) {
                                                return `Course: ${course.name}
                                                (${new Date(course.startTime).toLocaleString()} - ${new Date(course.endTime).toLocaleString()})`;
                                            } else {
                                                return `As bonus awarded by teacher`;
                                            }
                                        }
                                    })()}
                                </Card.Subtitle>
                                <Card.Text>
                                    On {new Date(transaction.timestamp).toLocaleString()}
                                </Card.Text>
                            </Card.Body>
                        </Card>) :
                    <h4 className="text-center">No points yet!</h4>
            }
        </>);
}