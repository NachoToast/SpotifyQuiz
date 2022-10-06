import React, { ReactNode } from 'react';
import '../../helpers/SpotifyAuthHelpers';
import './Links.css';

export interface ExternalLinkProps {
    href: string;
    target?: React.HTMLAttributeAnchorTarget;
    children: ReactNode;
}

const ExternalLink = (props: ExternalLinkProps) => {
    const { href, target, children } = props;

    return (
        <a
            href={href}
            rel="noreferrer"
            target={target ?? '_self'}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
        >
            <button className="internalLink">{children}</button>
        </a>
    );
};

export default ExternalLink;
