import React, { useState } from 'react'
import styles from './CreateTicketForm.module.css'

interface CreateTicketFormProps {
  onSuccess: () => void
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess }) => {
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [showToast, setShowToast] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!roomNumber.trim() || !description.trim()) {
      return
    }

    const ticketData = {
      roomNumber: roomNumber,
      authorName: 'Unknown',
      description: description,
    }

    try {
      const response = await fetch('http://localhost:5220/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      })
      if (response.ok) {
        setRoomNumber('')
        setDescription('')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        onSuccess()
        console.log('Ticket created successfully', await response.json())
      } else {
        console.error('Failed to create ticket', response.status)
      }
    } catch (error) {
      console.error('Error sending request:', error)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create a new Ticket</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="roomNumber">
            Room number
          </label>
          <input
            className={styles.input}
            id="roomNumber"
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <input
            className={styles.input}
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className={styles.submitButton} type="submit">
          Create
        </button>
      </form>
      {showToast && (
        <div className={styles.toast}>Ticket successfully sent!</div>
      )}
    </div>
  )
}

export default CreateTicketForm