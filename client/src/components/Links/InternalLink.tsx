import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Links.css';
import '../../helpers/SpotifyAuthHelpers';

export interface InternalLinkProps {
    href: string;
    children: ReactNode;
}

const InternalLink = (props: InternalLinkProps) => {
    const { href, children } = props;

    return (
        <Link to={href} style={{ color: 'inherit', textDecoration: 'inherit' }}>
            <button className="internalLink">{children}</button>
        </Link>
    );
};

export default InternalLink;
