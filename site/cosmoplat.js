let express = require('express');
let app = new express()
let expressHandlebars = require('express-handlebars')
let multer = require('multer')
let upload = multer({dest: 'uploads/'})
let jqupload = require('jquery-file-upload-middleware')
let cookieParser = require('cookie-parser')
let credentials = require('./credentials.js')
let session = require('express-session')
let connect = require('connect')
let compression = require('compression')
let nodemailer = require('nodemailer')

// let mailTransport = nodemailer.createTransport({
//   service: 'qq',
//   secureConnection: true,
//   auth: {
//     user: credentials.gmail.user,
//     pass: credentials.gmail.password
//   }
// })

// mailTransport.sendMail({
//   from: '"zifeiyu"<1039354317@qq.com>',
//   to: 'yxpbruce@163.com',
//   subject: 'Your Meadowlark Travel Tour',
//   text: 'Thank you for booking your trip with Meadowlark Travel.'
// }, function(err) {
//   if(err) console.error('Unable to send:' + err)
// })

function getWeatherData(){
  return {
     locations: [
        {
              name: 'Portland',
              forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
              iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
              weather: 'Overcast',
              temp: '54.1 F (12.3 C)',
         },
         {
              name: 'Bend',
              forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
              iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
              weather: 'Partly Cloudy',
              temp: '55.0 F (12.8 C)',
         },
         {
              name: 'Manzanita',
              forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
              iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
              weather: 'Light Rain',
              temp: '55.0 F (12.8 C)',
         },
    ],
  }
}

// 幸运饼干
let fortune = require('./public/lib/fortune.js')

app.set('views', __dirname + "/views")
app.set('port', process.env.PORT || '3001')
app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port'))
})

// 添加模版引擎
let handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  helpers: {
    section: function(name, options) {
      if(!this._sections) this._sections = {};
      this._sections[name] = options.fn(this)
      return null
    }
  }
})

app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')


// 中间件
app.use(compression())
app.use(express.static(__dirname + '/public'))
app.use(function(req, res, next){
  if(!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weatherContext = getWeatherData();
  next();
});
// bodyParser
// let bodyParser = require('body-parser')
var bodyParser = require('body-parser')
app.use(bodyParser())
app.use('/upload', function(req, res, next) {
  let now = Date.now()
  jqupload.fileHandler({
    uploadDir: function() {
      return __dirname + '/public/uploads/' + now
    },
    uploadUrl: function() {
      return '/uploads/' + now
    }
  })(req,res,next)
})
app.use(cookieParser(credentials.cookieSecret))
app.use('/', function(req,res,next) {
  res.cookie('id', '111111', {path: '/about', maxAge: 2000})
  res.cookie('signed_id', '111111', {signed: true})
  next()
})
app.use(session({
  name: 'session_sid'
}))
app.use('/', function(req,res,next) {
  // 如果又即显消息，把它传到上下文中，然后清除它
  res.locals.flash = req.session.flash
  // delete req.session.flash
  next()
})
var cartValidation = require('./public/lib/cartValidation.js');

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

// 开启测试
app.use(function(req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' &&
                          req.query.test === '1'
  next()
})

// 路由 
app.get('/', function(req, res) {
  res.render('home')
})

app.get('/about', function(req, res) {
  // res.type('text/plain')
  // res.status(200)
  // res.send('About Meadowlark Travel')
  console.log('cookies:', req.cookies.id)
  console.log('signed_cookies:', req.signedCookies.signed_id)
  res.render('about', {
    pageTestScript: '/qa/tests-about.js',
    fortune: fortune.getFortune()
  })
})

app.get('/tours/hood-river', function(req, res){
  res.render('tours/hood-river'); 
});
app.get('/tours/request-group-rate', function(req, res){
  res.render('tours/request-group-rate');
});

app.get('/custom', function(req, res){
  res.clearCookie('id')
  console.log('cookies:', req.cookies.id)
  console.log('signed_cookies:', req.signedCookies.signed_id)
  res.render('custom', {
    layout: 'custom',
    currency: {
      name: 'United States dollars',
       abbrev: 'USD',
    },
    tours: [
          { name: 'Hood River', price: '$99.95' },
          { name: 'Oregon Coast', price: '$159.95' }
    ],
    specialsUrl: '/january-specials',
    currencies: [ 'USD', 'GBP', 'BTC' ]
  })
})

app.get('/jquery-test', function(req, res){
	res.render('jquerytest');
});

app.get('/nursery-rhyme', function(req, res) {
  res.render('nursery-rhyme')
})
app.get('/newsletter', function(req, res) {
  res.render('newsletter', {csrf: 'CSRF token goes here'})
})
app.get('/thankyou', function(req, res) {
  res.render('thankyou')
})
app.get('/contest/vacation-photo', function(req, res) {
  let now = new Date()
  res.render('contest/vacation-photo', {
    year: now.getFullYear(), month: now.getMonth()
  })
})
app.get('/newsletter/archive', function(req,res){
  console.log(res.locals.flash)
  if(res.locals.flash) {
    res.render('newsletter/archive')
  } else {
    res.redirect(303, '/')
  }
  
})

// api
app.get('/data/nursery-rhyme', function(req,res) {
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
  })
})

app.post('/process', function(req, res){
  console.log(req.body)

  // req.accepts('json,html')询问浏览器最佳返回格式是JSON还是HTML
  if(req.xhr || req.accepts('json,html') === 'json') {
    res.send({success: true})
  } else {
    // 不能使用301重定向，因为301重定向是永久的，浏览器会缓存这个重定向，下次访问process会直接重定向。
  res.redirect(303, '/thankyou');
  }
})

app.get('/test', function(req,res) {
  console.log(req.query)
  res.send({success: true})
})

app.post('/contest/vacation-photo/:year/:month', upload.single('photo'), function(req, res) {
  console.log(req.file)
  console.log(req.body)
  res.redirect(303, '/thankyou')
})

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};
let VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
app.post('/newsletter', function(req, res){
  console.log(req.body.email)
  var name = req.body.name || '', email = req.body.email || ''; 
  // 输入验证
  if(!email.match(VALID_EMAIL_REGEX)) {
    if(req.xhr) return res.json({ error: 'Invalid name email address.' });
    req.session.flash = {
                    type: 'danger',
                    intro: 'Validation error!',
                    message: 'The email address you entered was not valid.',
    };
    return res.redirect(303, '/newsletter/archive');
  }
  new NewsletterSignup({ name: name, email: email }).save(function(err){
    if(err) {
      if(req.xhr) return res.json({ error: 'Database error.' });
      req.session.flash = {
                          type: 'danger',
                          intro: 'Database error!',
                          message: 'There was a database error; please try again later.',
      }
      return res.redirect(303, '/newsletter/archive'); 
    }
    if(req.xhr) return res.json({ success: true }); 
    req.session.flash = {
                    type: 'success',
                    intro: 'Thank you!',
                    message: 'You have now been signed up for the newsletter.',
    };
    return res.redirect(303, '/newsletter/archive'); 
  });
});


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