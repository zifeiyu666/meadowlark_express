let express = require('express');
let app = new express()
let expressHandlebars = require('express3-handlebars')

app.set('port', process.env.PORT || '3000')

app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port'))
})

// 添加模版引擎
let handlebars = expressHandlebars.create({defaultLayout: 'main'})

app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

// 中间件
app.use(express.static(__dirname + '/public'))


// 路由
app.get('/', function(req, res) {
  res.render('home')
})

app.get('/about', function(req, res) {
  // res.type('text/plain')
  // res.status(200)
  // res.send('About Meadowlark Travel')
  res.render('about')
})

// 404
app.use(function(req,res) {
  res.status(404)
  // res.send('404 - Not Found')
  res.render('404')
})

// 500
app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500)
  // res.send('500 - Server Error')
  res.render('500')
})