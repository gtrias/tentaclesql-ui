import React, { useState, useEffect } from "react"
import initSqlJs from "sql.js"
import sqlWasm from "!!file-loader?name=sql-wasm.wasm!sql.js/dist/sql-wasm.wasm";
import "./styles.css";
import tentaclesql from '@factorialco/tentaclesql'
import databaseAdapter from './database-adapter'

const tables = [{
  name: 'steam_deals',
  autodiscover: true,
  url: 'https://www.cheapshark.com/api/1.0/deals',
  fields: []
}]

async function exec(
  sql,
  setResults,
  setError
) {
  // sql.js needs to fetch its wasm file, so we cannot immediately instantiate the database
  // without any configuration, initSqlJs will fetch the wasm files directly from the same path as the js
  // see ../craco.config.js
  const dbInst = await initSqlJs({ locateFile: (filename) => sqlWasm })
  console.log('dbInst', dbInst)
  const db = new dbInst.Database()
  console.log('db', db)

  try {
    tentaclesql(
      sql,
      {},
      {},
      {
        schema: tables
      },
      new databaseAdapter(db)
    ).then(data => {
      console.log('results: ', data)
      setResults(data);
      // The sql is executed synchronously on the UI thread.
      // You may want to use a web worker here instead
      // setResults(db.exec(sql)); // an array of objects is returned
      setError(null);
    })
      .catch(err => console.log(err))

  } catch (err) {
    // exec throws an error when the SQL statement is invalid
    setError(err);
    setResults([]);
  }
}


export default function App() {
  return <SQLRepl />;
}

/**
 * A simple SQL read-eval-print-loop
 * @param {{db: import("sql.js").Database}} props
 */
function SQLRepl() {
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  if (error) return <pre>{error.toString()}</pre>;

  return (
    <div className="App">
      <h1>React SQL interpreter</h1>

      <textarea
        onChange={(e) => exec(e.target.value, setResults, setError)}
        placeholder="Enter some SQL. No inspiration ? Try “select sqlite_version()”"
      ></textarea>

      <pre className="error">{(error || "").toString()}</pre>

      <pre>
        {
          // results contains one object per select statement in the query
          results.map(({ columns, values }, i) => (
            <ResultsTable key={i} columns={columns} values={values} />
          ))
        }
      </pre>
    </div>
  );
}

/**
 * Renders a single value of the array returned by db.exec(...) as a table
 * @param {import("sql.js").QueryExecResult} props
 */
function ResultsTable({ columns, values }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((columnName, i) => (
            <td key={i}>{columnName}</td>
          ))}
        </tr>
      </thead>

      <tbody>
        {
          // values is an array of arrays representing the results of the query
          values.map((row, i) => (
            <tr key={i}>
              {row.map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}
