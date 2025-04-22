const mongoose = require('mongoose')

const DeliveryRequestSchema = new mongoose.Schema({
  request_id: { type: String, required: true, unique: true },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickup_lat: Number,
  pickup_lng: Number,
  pickup_address_text: String,
  dropoff_lat: Number,
  dropoff_lng: Number,
  dropoff_address_text: String,
  item_description: String,
  notes: String,
  mandoob_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  fare: Number,
  estimated_time: Number,
  distance_km: Number,
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'on_the_way',
      'picked_up',
      'delivered',
      'cancelled',
      'failed'
    ],
    default: 'pending'
  },
  request_channel: {
    type: String,
    enum: [
      'customer_app',
      'business_app',
      'web_portal',
      'api',
      'whatsapp_bot',
      'manual_entry'
    ]
  },
  scheduled_at: Date,
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'wallet']
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  transaction_id: String,
  proof_photo_url_picked: String,
  proof_photo_url_delivered: String,
  recipient_signature: String,
  recipient_name: String,
  recipient_phone: String,
  priority_level: {
    type: String,
    enum: ['standard', 'express', 'bulk'],
    default: 'standard'
  },
  is_urgent: { type: Boolean, default: false },
  attempt_count: { type: Number, default: 0 },
  cancellation_reason: {
    type: String,
    enum: [
      'customer_cancelled',
      'mandoob_cancelled',
      'timeout',
      'admin_cancelled'
    ]
  },
  cancelled_by: {
    type: String,
    enum: ['customer', 'mandoob', 'admin']
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('DeliveryRequest', DeliveryRequestSchema)
