import React from 'react';

const Transaction = ({transaction}) => {
    const {input, outputMap} = transaction;
    const recipients = Object.keys(outputMap);

    return (
        <div className='Transaction'>
            <ul>
                <li>Node public address: {input.address.length > 20 ? `${input.address.substring(0, 20)}...` : input.address}</li>
                {input.amount !== undefined ? <li>Node balance: {input.amount}</li> : null}
                {input.courseId !== undefined ? <li>CourseId: {input.courseId}</li> : null}
            </ul>
            {
                recipients.map(recipient => (
                    <ul key={recipient}>
                        <li>To: {recipient.length > 20 ? `${recipient.substring(0, 20)}...` : recipient}</li>
                        <li>Awarded: {outputMap[recipient]} Points</li>
                    </ul>
                ))
            }
        </div>
    );
}

export default Transaction;