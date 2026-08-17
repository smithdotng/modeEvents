import mongoose from 'mongoose';

// One answer to a host-designed custom question.
// The label and type are snapshotted at submission time so the host's
// attendee list still reads correctly if the form is edited afterwards.
const ResponseSchema = new mongoose.Schema(
  {
    fieldKey: { type: String, required: true },
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const AttendeeSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },

    // Answers to the host's custom questions (everything beyond name/email/phone)
    responses: { type: [ResponseSchema], default: [] },

    // Photo uploaded by attendee (base64)
    photo: { type: String, default: '' },

    // Final composited image (base64) — attendee photo placed on frame
    compositeImage: { type: String, default: '' },

    // Unique ticket code for this attendee e.g. "TKT-8F3K2A"
    ticketCode: {
      type: String,
      unique: true,
      default: () => 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },

    checkedIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One RSVP per email per event
AttendeeSchema.index({ eventId: 1, email: 1 }, { unique: true });

export default mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
