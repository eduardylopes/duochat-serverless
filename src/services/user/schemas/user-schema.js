import mongoose from mongoose;

const userSchema = new mongoose.Schema(
    {
        userName: { type: String, required: true, unique: true },
        connectionId: { type: String, required: true, unique: true },
        avatar: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

export const User = mongoose.model('User', userSchema);
