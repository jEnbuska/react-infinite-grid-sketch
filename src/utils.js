export function createMockData(){
    const rows = [];
    const headers = [];
    for (let i = 0; i < 500; i++) {
        rows.push({id: i, columns: []});
    }
    for (let i = 0; i < 40; i++) {
        headers.push({title: i, width: 100});
        rows.forEach(e => e.columns.push(i));
    }
    return {rows, headers}
}