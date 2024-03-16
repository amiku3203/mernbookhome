import React from 'react';
import { Link } from "react-router-dom";
import { FaHome } from 'react-icons/fa';

const Cancle = () => {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <h1 style={styles.title}>Payment Canceled Successfully! 🙋🏼‍♂️</h1>
                <Link to="/" style={styles.link}>
                    <FaHome style={styles.icon} />
                    Home Page
                </Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
    },
    content: {
        textAlign: 'center',
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        marginBottom: '2rem',
    },
    link: {
        textDecoration: 'none',
        color: '#007bff',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: '0.5rem',
    },
};

export default Cancle;
