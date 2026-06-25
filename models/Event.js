import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date },
    venue: { type: String, default: '' },
    address: { type: String, default: '' },
    capacity: { type: Number, default: 0 }, // 0 = unlimited
    coverImage: { type: String, default: '' }, // base64 data URL

    // Unique shareable code e.g. "EVT-A3X9KP"
    uniqueCode: {
      type: String,
      unique: true,
      default: () => 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },

    // Avatar / photo-composite feature
    avatarsEnabled: { type: Boolean, default: false }, // host opt-in
    frameImage: { type: String, default: '' },   // base64 template image
    frameZone: {
      x: { type: Number, default: 10 },   // % from left
      y: { type: Number, default: 10 },   // % from top
      w: { type: Number, default: 30 },   // % width
      h: { type: Number, default: 30 },   // % height
      shape: { type: String, enum: ['rect', 'circle'], default: 'rect' },
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'published',
    },

    // Admin-curated featured flag — shown on the public landing page
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
