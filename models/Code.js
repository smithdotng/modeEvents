import mongoose from 'mongoose';

const CodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['qr', 'barcode'],
      required: true,
    },
    // For QR: url | text | email | phone | wifi | vcard
    // For barcode: CODE128 | EAN13 | UPC | etc.
    format: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    // Base64 PNG data URL stored for quick preview
    dataURL: {
      type: String,
      required: true,
    },
    // Styling snapshot
    options: {
      fg: { type: String, default: '#000000' },
      bg: { type: String, default: '#ffffff' },
      size: { type: Number, default: 256 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Code || mongoose.model('Code', CodeSchema);
