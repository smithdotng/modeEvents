import mongoose from 'mongoose';
import { FIELD_TYPE_VALUES, defaultFormFields } from '@/lib/formFields';

// One question on the host-designed RSVP form.
const FormFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },      // stable id — also the answer key
    type: { type: String, enum: FIELD_TYPE_VALUES, default: 'text' },
    label: { type: String, required: true, trim: true },
    placeholder: { type: String, default: '' },
    helpText: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },   // select / radio / checkbox choices
    core: { type: Boolean, default: false },    // answer maps to a real Attendee column
    locked: { type: Boolean, default: false },  // cannot be removed or retyped
  },
  { _id: false }
);

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

    // Host-designed RSVP form. An empty array means "use the default
    // name / email / phone form" — that's what events created before this
    // feature was added will have.
    formFields: { type: [FormFieldSchema], default: defaultFormFields },

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
