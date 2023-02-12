import mongoose from mongoose;

const messageSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    },
    {
        timestamps: true,
    },
);

export const Message = mongoose.model('Message', messageSchema);
