const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const ejs=require('ejs');
const multer=require('multer');
var fs = require('fs');
var path = require('path')
const qr=require('qrcode');
mongoose.connect('mongodb://localhost:27017/rubixdb');
var search="";

const rSchema={
	pincode:String,
	blood:String,
	quan:String,
}
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
const slotSchema={
	hospital:String,
	timing:String,
}
const slot_bookingSchema={
patient_name:String,
patient_time:String,
}
const userSchema={

	name:String,
	password:String,
}
const Rp=mongoose.model('Rp',rSchema);
const slot_book=mongoose.model('slot_book',slotSchema);
const slot_booking=mongoose.model('slot_booking',slot_bookingSchema);
const User=mongoose.model('User',userSchema);

const image=mongoose.model('image',imageSchema);


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
res.render("home");
})
app.post("/det",(req,res)=>{
var post=new Rp({
		pincode:req.body.pincode,
		blood:req.body.blood,
		quan:req.body.quan,
	})
	post.save();
})
app.get("/detail/:id",(req,res)=>{
	const id=req.params.id;
image.findById(id,(err,post)=>{
		if(err) console.log(err);
		else{
			qr.toDataURL(post.img.dat ,(er,src)=>{
				if(er) console.log(er);
				else res.render("qr",{src:src});
			})
		}
	})
})
app.post("/se",(req,res)=>{
	const pincode=req.body.pin;
	Rp.find({pincode:pincode},(err,cd)=>{
		if(err) console.log(err)
		else{
			res.render("s1",{cd1:cd});
		}
	})
})
app.get("/upd",(req,res)=>{
	Rp.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("upd",{user:cd})
		}
	})
	// res.render("upd");
})
var storage=multer.diskStorage({
	destination:(req,file,cb)=>{
		cb(null,'uploads')
	},
	filename:(req,file,cb)=>{
cb(null,file.fieldname+"-"+Date.now())
	}
});
var upload=multer({storage: storage})
app.get("/up",(req,res)=>{
	image.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("up",{item:cd})
		}
	})
})
app.post("/pic",upload.single('image'),(req,res,next)=>{
	var pbj=new image({
		name:req.body.name,
		desc:req.body.desc,
		img:{
			data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
		contentType:'image/png'
		}
	})
	// pbj.save();
	pbj.save();
	res.redirect("/up");
})
app.post("/up",(req,res)=>{

	var ui=req.body.ui;
	var qua=req.body.quan;
	

	// User.findOneAndUpdate({_id:ui},(er,cd)=>{
	//     if(er){
	//         console.log(er);
	//     }else{
		
	//     }

	// })
	Rp.findOneAndUpdate({_id: ui}, {$set: { quan:qua}}, {new: true}, (err, doc) => {
		if (err) {
			console.log("Something wrong when updating data!");
		}
		res.redirect("/upd");
	});
})
app.get("/create",(req,res)=>{
	res.render("create");
})
app.post("/book_slot",(req,res)=>{
	var hospital_name=req.body.hname;
	var time=req.body.timing;
	var post=new slot_book({
		hospital:hospital_name,
		timing:time,
	})
	post.save();

})
app.get('/book',(req,res)=>{
	slot_book.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("book",{book:cd})
		}
	})
})
app.post('/delete',(req,res)=>{
	var id=req.body.ui;
	var time1="";
slot_book.findById(id,(er,cd)=>{
	if(er) console.log(er);
	else {
		var post=new slot_booking({
			patient_name:search,
			patient_time:cd.timing,
			
				})
				post.save();
	}
})

	console.log(id);
	slot_book.findByIdAndRemove(id,(er,cd)=>{
		if(er) console.log(er)
		else{
			res.redirect("/book");
		}
	})
})
app.get('/login',(req,res)=>{
	res.render("login");
})
app.post('/logi',(req,res)=>{
	search=req.body.username;
	var post=new User({
		name:req.body.username,
		password:req.body.password,
	})
post.save();
res.redirect('/book')
})
app.listen(80,(req,res)=>{
	console.log("chalu hgya");
})