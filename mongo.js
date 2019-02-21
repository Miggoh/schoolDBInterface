MongoClient.connect('mongodb://localhost:27017/schoolDB', function (err, client) {
  if (err) throw err

  var db = client.db('schoolDB')
  
  db.collection('studentData').find().toArray(function (err, result) {
    if (err) throw err

    console.log(result)
  })
})