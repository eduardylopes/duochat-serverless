import mongoose from mongoose;

const roomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
        lobby: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lobby' }],
        adminId: { type: String, required: true, unique: true },
        maxUsers: { type: Number, required: true },
        isPrivate: { type: Boolean, required: true },
        password: { type: String },
    },
    {
        timestamps: true,
    },
);

export const Room = mongoose.model('Room', roomSchema);
