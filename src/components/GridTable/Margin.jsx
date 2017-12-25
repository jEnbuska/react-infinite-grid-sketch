import React from 'react';
import {number} from 'prop-types';

export default function Margin({height}) {
    return <div style={{height: height + 'px'}}/>;
}

Margin.propTypes = {
    height: number
};