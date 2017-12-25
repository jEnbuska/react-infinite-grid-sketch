import React, {Component} from 'react';
import {array, number, bool, object, func, string} from 'prop-types';
import FocusInput from '../../FocusInput';
import './styles.scss';

const {entries} = Object;

/* eslint-disable jsx-a11y/no-autofocus */
export default class GridRow extends React.PureComponent {
    static propTypes = {
        headers: array,
        rowId: string,
        columns: array,
        cursor: object,
        onFocusChanged: func,
        displayPlaceholder: bool,
        onColumnClick: func
    };

    render() {
        const {rowId, onFocusChanged, headers, columns, cursor, displayPlaceholder, onColumnClick} = this.props;
        if (displayPlaceholder) {
            return <div className='grid-table-row-dummy'/>;
        }
        return (
            <div
                className={cursor ? 'grid-table-row-active' : 'grid-table-row'}>

                {columns.map((value, i) => (
                    <FocusInput
                        focused={rowId === cursor.target.row && i === cursor.target.column}
                        onBlur={() => onFocusChanged}
                        onClick={() => onColumnClick({row: rowId, column: i})}
                        key={'column-' + i}
                        className='grid-table-column'
                        style={{width: headers[i].width}}
                        placeholder={value}
                    />
                ))}</div>
        );
    }

    componentWillReceiveProps({cursor, rowId}) {

    }
}