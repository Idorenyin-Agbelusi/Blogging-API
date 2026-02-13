import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String}
});

UserSchema.pre(
    'save',
    async function(){
        if(!this.isModified('password')) return;

        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
)

UserSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

export default mongoose.model("User", UserSchema);
