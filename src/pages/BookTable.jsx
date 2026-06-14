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
notes: '',
})

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
})
}

const handleSubmit = async (e) => {
e.preventDefault()

```
console.log('Booking Request:', formData)

alert(
  'Thank you. Your booking request has been received. We will contact you shortly.'
)

setFormData({
  fullName: '',
  organization: '',
  email: '',
  phone: '',
  eventName: '',
  tableCount: 1,
  notes: '',
})
```

}

return ( <div className="book-table-page"> <div className="book-table-container"> <h1>Book a Table</h1>

```
    <p>
      Reserve a table for upcoming Poll Arena International events,
      forums, conferences, debates, exhibitions, and strategic
      networking opportunities.
    </p>

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
        placeholder="Event Name"
        value={formData.eventName}
        onChange={handleChange}
      />

      <input
        type="number"
        name="tableCount"
        min="1"
        placeholder="Tables Required"
        value={formData.tableCount}
        onChange={handleChange}
      />

      <textarea
        name="notes"
        placeholder="Additional Notes"
        rows="5"
        value={formData.notes}
        onChange={handleChange}
      />

      <button type="submit">
        Submit Reservation
      </button>
    </form>
  </div>
</div>


)
};