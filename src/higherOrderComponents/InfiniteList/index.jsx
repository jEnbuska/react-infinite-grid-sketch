import React from 'react';
import {number} from 'prop-types';

const {min, max, trunc} = Math;


//Does not work
function createInfiniteList({items, rowHeight, Component}) {
    return class InfiniteList extends React.Component {
        static propTypes = {
            rowHeight: number
        };

        static defaultProps = {
            rowHeight
        };

        list = {scrollTop: 0};
        state = {
            fromY: 0,
            toY: 30
        };

        render() {
            const {rowHeight, ...props} = this.props;
            const {list: {scrollTop, offsetHeight}, state} = this;

            const {fromY, toY} = state;
            let paddingTop;
            if (fromY > 0) {
                paddingTop = <div key='top-placeholder' style={{height: `${fromY * props.rowHeight}px`}}/>;
            }
            const itemList = props[items];
            const {length} = itemList;
            for (let i = max(fromY, 0); i < min(toY, length); i++) {
                itemList.push(itemList[i]);
            }
            let paddingBottom;
            if (toY < length) {
                paddingBottom = <div key='bottom-placeholder' style={{height: ((length - toY) * props.rowHeight) + 'px'}}/>;
            }
            return (<Component {...props} paddingTop={paddingTop} paddingBottom={paddingBottom} setListReference={this.setListReference} listMeta={{scrollTop, rowHeight, offsetHeight}}/>);
        }
        setListReference = ref => {
            this.list = ref;
        };

        componentDidMount() {
            let prevScrollTop;
            this.offsetHeight = this.list.offsetHeight;
            this.list.addEventListener('scroll', () => {
                const {scrollTop, offsetHeight} = this.list;
                if (scrollTop !== prevScrollTop) {
                    this.setState(function () {
                        const fromY = trunc(scrollTop / this.props.rowHeight) - 1;
                        const toY = fromY + trunc(offsetHeight / this.props.rowHeight) + 2;
                        return {fromY, toY };
                    });
                }
                prevScrollTop = scrollTop;
            });
        }

        componentDidUpdate() {
            const {props, list: {offsetHeight, scrollTop}} = this;
            if (offsetHeight !== this.offsetHeight) {
                const toY = trunc((scrollTop / props.rowHeight) + (offsetHeight / props.rowHeight)) + 1;
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({toY});
            }
            this.offsetHeight = offsetHeight;
        }
    };
}

export default function infiniteList({items, rowHeight}) {
    if (!items || typeof items !=='string') {
        throw new Error('infiniteList expected to receive string property name for items');
    }
    return Component => createInfiniteList({items, rowHeight, Component});
}

