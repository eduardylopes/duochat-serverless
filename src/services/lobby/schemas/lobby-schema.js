import mongoose from mongoose;

const lobbySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    },
    {
        timestamps: true,
    },
);

export const Lobby = mongoose.model('Lobby', lobbySchema);
