import mongoose from 'mongoose';
import { normalizePhone } from '@/lib/formFields';

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

    // Email is optional: some events collect a phone number instead. Identity
    // is "name + at least one contact method", enforced in the RSVP route.
    email: { type: String, default: '', lowercase: true, trim: true },
    phone: { type: String, default: '' },

    // Digits-only form of `phone`, used as the duplicate-RSVP key so that
    // 0803 123 4567, +2348031234567 and 08031234567 count as one person.
    // Derived automatically on save — never set this by hand.
    phoneKey: { type: String, default: '' },

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

// Keep phoneKey in step with phone on every write path.
AttendeeSchema.pre('validate', function next_(next) {
  this.phoneKey = normalizePhone(this.phone);
  next();
});

/*
 * Duplicate-RSVP protection.
 *
 * These are PARTIAL unique indexes: the `$gt: ''` filter means blank values
 * are not indexed at all. A plain unique index would treat every attendee
 * without an email as the same person and reject all but the first — which is
 * exactly what would break once email became optional. A `sparse` index is not
 * enough either, since it skips only missing/null values, not empty strings.
 *
 * Phone is the primary key for identity; email still blocks duplicates when
 * given. Someone supplying both is checked against both.
 *
 * NOTE: Mongoose creates new indexes but never drops old ones. The previous
 * non-partial unique index on { eventId, email } must be dropped explicitly —
 * run scripts/migrate-attendee-indexes.mjs once.
 */
AttendeeSchema.index(
  { eventId: 1, phoneKey: 1 },
  { unique: true, partialFilterExpression: { phoneKey: { $gt: '' } } }
);
AttendeeSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $gt: '' } } }
);

export default mongoose.models.Attendee || mongoose.model('Attendee', AttendeeSchema);
