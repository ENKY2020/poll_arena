
import { useState } from 'react'
import '../styles/bookTable.css'

export default function BookTable() {
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    eventName: '',
    tableCount: 1,
    guestCount: '',
    notes: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const message = `
POLL ARENA INTERNATIONAL

EVENT TABLE RESERVATION

Name: ${formData.fullName}

Organization: ${formData.organization}

Email: ${formData.email}

Phone: ${formData.phone}

Event: ${formData.eventName}

Tables Required: ${formData.tableCount}

Expected Guests: ${formData.guestCount}

Additional Notes:
${formData.notes}
`

    const whatsappUrl =
      `https://wa.me/254736933308?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="book-table-page">
      <div className="book-table-container">

        <div className="book-table-hero">

          <span className="event-badge">
            🎟 EVENT RESERVATIONS OPEN
          </span>

          <h1>
            Reserve Your Seat at Poll Arena International Events
          </h1>

          <p className="hero-description">
            Join influential leaders, policymakers, researchers,
            entrepreneurs and changemakers at our upcoming events.
          </p>

          <div className="event-types">

            <div className="event-type">
              🏆 Awards Gala
            </div>

            <div className="event-type">
              🎤 Public Forums
            </div>

            <div className="event-type">
              🤝 Networking Events
            </div>

            <div className="event-type">
              📊 Research Conferences
            </div>

          </div>

          <div className="contact-card">

            <h3>Need Immediate Assistance?</h3>

            <p>
              Speak directly with our Events Team for table
              reservations, sponsorship opportunities and
              attendance information.
            </p>

            <div className="contact-phone">
              📞 +254 736 933 308
            </div>

            <a
              href="https://wa.me/254736933308"
              target="_blank"
              rel="noreferrer"
              className="whatsapp-button"
            >
              💬 WhatsApp Events Team →
            </a>

          </div>

        </div>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="organization"
            placeholder="Organization / Company"
            value={formData.organization}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="eventName"
            placeholder="Which Event Are You Interested In?"
            value={formData.eventName}
            onChange={handleChange}
          />

          <label className="form-label">
            Tables Required
          </label>

          <input
            type="number"
            name="tableCount"
            min="1"
            placeholder="How Many Tables Would You Like To Reserve?"
            value={formData.tableCount}
            onChange={handleChange}
          />

          <label className="form-label">
            Expected Guests
          </label>

          <input
            type="number"
            name="guestCount"
            min="1"
            placeholder="How Many People Will Attend?"
            value={formData.guestCount}
            onChange={handleChange}
          />

          <textarea
            name="notes"
            rows="5"
            placeholder="Special seating requests, VIP guests, sponsorship enquiries or other requirements..."
            value={formData.notes}
            onChange={handleChange}
          />

          <button type="submit">
            Submit Reservation
          </button>

        </form>

      </div>
    </div>
  )};
