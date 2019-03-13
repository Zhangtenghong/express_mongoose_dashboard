const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('express-flash');
var session = require('express-session');

app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/basic_mongoose');
var MongooseSchema = new mongoose.Schema({
  name:  { type: String, required: true},
  gender: { type: String, required: true},
  age: { type: Number, required: true, max: 4},
}, {timestamps:true});
mongoose.model('Mongoose', MongooseSchema);
var Mongoose = mongoose.model('Mongoose') 


app.get('/mongooses/new', function(req, res) {
  res.render('add');
})

app.post('/mongooses', function(req, res) {
    console.log("POST DATA", req.body);
    var mongoose = new Mongoose({name: req.body.name, gender: req.body.gender, age: req.body.age});
    mongoose.save(function(err) {
    if(err) {
      console.log('something went wrong', err);
      for(var key in err.errors){
        req.flash('quote', err.errors[key].message);
      }
      return res.redirect('/mongooses/new')
    } else { 
      console.log('successfully added a mongoose!');
    }
    return res.redirect('/');
    })
})

app.get('/', function(req,res){
  Mongoose.find({}, function(err, dataFromDatabase){
    if(err){
      console.log(err);
    }
    console.log(dataFromDatabase);
    return res.render('index', {all_mongooses:dataFromDatabase});
  });
})

app.get('/mongooses/edit/:id', function(req, res){
  Mongoose.findOne({_id:req.params.id}, function(err, mongoose){
    if(err){
      console.log(err);
    }
    return res.render('edit', {selected_mongoose:mongoose});
  })
})

app.post('/mongooses/:id', function(req, res) {
  console.log("POST DATA", req.body);
  Mongoose.update({_id:req.params.id},{name:req.body.name, gender:req.body.gender, age:req.body.age}, function(err){
    if (err){
      console.log("something went wrong")
      return res.redirect(`/mongooses/edit/${req.params.id}`)
    } else {
      console.log("successfully changed a mongoose")
      return res.redirect('/')
    }
  })
})

app.get('/mongooses/:id', function(req, res){
  Mongoose.findOne({_id:req.params.id}, function(err, mongoose){
    if(err){
      console.log(err);
    }
    return res.render('show', {show_mongoose:mongoose});
  })
})

app.get('/mongooses/destroy/:id', function(req,res){
  Mongoose.remove({_id:req.params.id},function(err){
    console.log("Record deleted")
    res.redirect('/')
  })
})

app.listen(8000, function() {
    console.log("listening on port 8000");
})