const		mongoose 	= require('mongoose'),
			passportLocalMongoose = require('passport-local-mongoose');


let userSchema = new mongoose.Schema({
	firstName: String,
	middleName: String,
	lastName: String,
	dateOfBirth: String,
	username: String,
	password: String
},{
	timestamps: {
		createdAt: 'created',
		modifiedAt: 'modified'
	}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema); 