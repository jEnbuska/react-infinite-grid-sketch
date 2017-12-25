export function createMockData() {
    const rows = [];
    const headers = [];
    for (let i = 0; i < 20; i++) {
        rows.push({id: i, columns: []});
    }
    for (let i = 0; i < 5; i++) {
        headers.push({title: i, width: 100});
        rows.forEach((e, j) => e.columns.push(i + '-' + j));
    }
    return {rows, headers};
}

const {entries} = Object;
export function hasDiffs(...params) {
    return params.some(([a, b]) => entries({...a, ...b}).some(([k, v]) => a[k]!==v || b[k]!==v));
}