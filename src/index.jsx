import React from 'react';
import ReactDOM from 'react-dom';
import 'react-resizable/css/styles';
import 'react-grid-layout/css/styles';
import GridLayout from 'react-grid-layout';
import Toggle from 'material-ui/Toggle';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import GridTable from './components/GridTable';

import {createMockData} from './utils';
import './styles';

const {headers, rows} = createMockData();

const ROW_HEIGHT = 20;
class Root extends React.Component {
    state = {
        underCustomization: false,
        layout: ['a', 'b', 'c'].map((i) => ({i, x: 5, y: 5, w: 5, h: 4, minW: 5, minH: 4})),
        headers,
        rows
    };
    toggle = false;

    render() {
        console.log('render root');
        const {headers, rows, layout, underCustomization} = this.state;
        console.log({layout: layout.map(it => it.i)});
        return (
            <MuiThemeProvider>
                <div>
                    <Toggle
                        label='Toggle'
                        onToggle={this.onToggle}
                        labelPosition='left'
                        style={{maxWidth: 70}}
                        defaultToggled={false} />
                    <GridLayout
                        layout={layout}
                        className={underCustomization ? '': 'hide-resize'}
                        cols={12}
                        rows={12}
                        rowHeight={ROW_HEIGHT}
                        width={1200}
                        height={500}
                        onResize={this.handleResize}
                        useCSSTransforms={false}
                        onDragStart={this.onDragStart}
                    >

                        {layout.map(({i, w, h}) => (
                            <GridTable
                                key={i}
                                id={i}
                                headers={headers}
                                rows={rows}
                                preventInteraction={underCustomization}
                                width={w*30}
                                handleColumnResize={this.handleColumnResize}
                                height={h*30} />
                        ))}
                    </GridLayout>
                </div>
            </MuiThemeProvider>
        );
    }

    onToggle = () => {
        this.toggle = !this.toggle;
        setTimeout(() => this.setState({underCustomization: this.toggle}), 245);
    };

    handleResize = (layout) => {
        this.setState(() => ({layout}));
    };

    handleColumnResize = ({column, width}) => {
        const headers = [...this.state.headers];
        const header = {...headers[column]};
        header.width = width;
        headers[column] = header;
        this.setState({headers});
    };

    shouldComponentUpdate(_, nextState) {
        return Object.entries(this.state).some(([k, v]) => (nextState[k]!==v));
    }
}

ReactDOM.render(<Root />, document.getElementById('app'));