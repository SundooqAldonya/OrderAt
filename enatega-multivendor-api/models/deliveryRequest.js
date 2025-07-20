const mongoose = require('mongoose')

const DeliveryRequestSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pickup_lat: Number,
    pickup_lng: Number,
    pickup_address_text: String,
    pickup_address_free_text: String,
    pickup_label: String,
    dropoff_lat: Number,
    dropoff_lng: Number,
    dropoff_address_text: String,
    dropoff_address_free_text: String,
    dropoff_label: String,
    item_description: String,
    notes: String,
    mandoob_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
    fare: Number,
    estimated_time: Number,
    distance_km: Number,
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'PICKED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    },
    request_channel: {
      type: String,
      enum: [
        'customer_app',
        'business_app',
        'web_portal',
        'api',
        'admin',
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
    requestId: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('DeliveryRequest', DeliveryRequestSchema)
