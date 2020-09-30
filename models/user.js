const		mongoose 	= require('mongoose'),
			passportLocalMongoose = require('passport-local-mongoose');


let userSchema = new mongoose.Schema({
	firstName: String,
	middleName: String,
	lastName: String,
	dateOfBirth: String,
	email: String,
	avatarUrl: String,
	role: {
		name: String,
		value: Number
	}
},{
	timestamps: {
		createdAt: 'created',
		updatedAt: 'modified'
	}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema); 