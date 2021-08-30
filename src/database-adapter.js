class SqljsAdapter {
  constructor (database: any) {
    this.db = database
  }

  storeToDb (tableDefinition: any, data: Array<any>) {
    const schema = tableDefinition.fields.map((field: any) => `@${field.key}`).join(', ')

    console.log('data: ', data)

    for (const row of data) {
      const formattedRow = Object.values(row).map(row => `"${row}"`).join(', ')
      const insert = `INSERT INTO ${tableDefinition.name} VALUES (${formattedRow})`
      console.log(insert)
      this.db.run(insert)
    }
  }

  createTable (tableDefinition: any, schemas: any) {
    const query = `CREATE TABLE ${tableDefinition.name} (${tableDefinition.fields.map(f => f.key).join(', ')})`

    console.log('tableDefinition:', tableDefinition)
    console.log('query:', query)
    console.log('schemas:', schemas)

    this.db.run(query)
  }

  runQuery (sql: string, parameters: Array<any>) {
    return this.db.exec(sql)
  }
}

export default SqljsAdapter
