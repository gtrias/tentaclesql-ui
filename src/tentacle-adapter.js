// Required to let webpack 4 know it needs to copy the wasm file
// to our assets
import initSqlJs from "sql.js";
import sqlWasm from "!!file-loader?name=sql-wasm.wasm!sql.js/dist/sql-wasm.wasm";

const initAdapter = async () => {
  const SQL = await initSqlJs({ locateFile: () => sqlWasm })
  console.log('SQL', SQL)
  const instance = SQL.Database()
  console.log('instance', instance)

  return instance
}

export default initAdapter
