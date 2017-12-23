import React, {Component} from 'react';
import {array, number, bool} from 'prop-types';
import './styles.scss';

const {entries} = Object;

export default class GridRow extends React.PureComponent {
    static propTypes = {
        headers: array,
        columns: array,
        rowFocus: bool,
        inputFocus: number,
    };

    state = {focus: {}};

    render() {
        const {headers, columns, inputFocus, rowFocus} = this.props;
        return (
            <div
                onKeyDown={this.onKeyDown}
                className={rowFocus ? 'grid-table-row-active' : 'grid-table-row'}>{columns.map((value, i) => (
                    <input
                        ref={input => { this['input-'+i] = input; }}
                        onFocus={() => this.setState({focus: {type: 'active', target: i}})}
                        key={'column-'+i}
                        className='grid-table-column'
                        style={{width: headers[i].width}}
                        placeholder={value}/>
                ))}</div>
        );
    }

    onKeyDown = ({key}) => {
        const {type, target} = this.state.focus;
        if (type === 'active') {
            switch (key) {
                case 'Escape': {
                    console.log(target);
                    this['input-'+target].blur();
                } case 'ArrowRight': {

                }
            }
        }
    }

}