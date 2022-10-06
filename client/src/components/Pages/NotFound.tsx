import React from 'react';
import InternalLink from '../Links/InternalLink';

const NotFound = () => {
    return (
        <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center' }}>
            <h1>Not Found</h1>
            <p>The page you are looking for doesn't exist.</p>
            <InternalLink href="/">Home</InternalLink>
        </div>
    );
};

export default NotFound;
