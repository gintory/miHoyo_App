var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: '3306',
  database: 'mihoyo'
})

connection.connect()

var sql = 'select * from user'
connection.query(sql, function (err, result) {
  if (err) {
    console.log('error', err.message)
    return
  }
  console.log('--------------------------SELECT----------------------------')
  console.log(result)
})

connection.end()
