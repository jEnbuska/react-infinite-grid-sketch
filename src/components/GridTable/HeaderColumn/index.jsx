import React from 'react';
import Draggable from 'react-draggable';
import {func, string, number} from 'prop-types';
import './styles.scss';

export default class HeaderColumn extends React.PureComponent {
    static propTypes = {
        onResize: func,
        width: number,
        title: string,
    }

    componentWillMount() {
        this.initialWidth = this.props.width;
    }

    render() {
        const {state, props: {width, title}} = this;
        return (
            <span className='grid-header-column' style={{width: (width) + 'px'}}>
                {title}
                <span onMouseDown={e => e.stopPropagation()}>
                    <Draggable
                         axis='x'
                         position={{x: width - this.initialWidth}}
                         onDrag={this.handleResize}>
                        <span className='column-handle'style={{transform: 'translate(0px, 0px)'}} />
                    </Draggable>
                </span>
            </span>);
    }

    handleResize = e => {
        console.log(e);
        console.log('TODO handle resize');
        const {width, onResize} = this.props;
        onResize(width + e.movementX);
    }
}