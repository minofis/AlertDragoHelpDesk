import React, { useState } from 'react'
import styles from './CreateTicketForm.module.css'

interface CreateTicketFormProps {
  onSuccess: () => void
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess }) => {
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{roomNumber?: boolean, description?: boolean}>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!roomNumber.trim() || !description.trim()) {
      setValidationErrors({
        roomNumber: !roomNumber.trim() || undefined,
        description: !description.trim() || undefined,
      })
      return
    }

    setValidationErrors({})

    const ticketData = {
      roomNumber: roomNumber,
      authorName: 'Unknown',
      description: description,
    }

    setIsLoading(true)

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
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
        onSuccess()
        console.log('Ticket created successfully', await response.json())
      } else {
        console.error('Failed to create ticket', response.status)
        throw new Error(`Server error: ${response.status}`)
      }
    } catch (error) {
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 3000)
      console.error('Error sending request:', error)
    } finally {
      setIsLoading(false)
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
          <div className={styles.fieldWrapper}>
            <input
              className={`${styles.input} ${validationErrors.roomNumber ? styles.inputError : ''}`}
              id="roomNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={roomNumber}
              onChange={(e) => {
                setRoomNumber(e.target.value)
                setValidationErrors((prev) => ({ ...prev, roomNumber: false }))
              }}
            />
            {validationErrors.roomNumber && <span className={styles.errorText}>Required field</span>}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <div className={styles.fieldWrapper}>
            <input
              className={`${styles.input} ${validationErrors.description ? styles.inputError : ''}`}
              id="description"
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setValidationErrors((prev) => ({ ...prev, description: false }))
              }}
            />
            {validationErrors.description && <span className={styles.errorText}>Required field</span>}
          </div>
        </div>
        <button className={styles.submitButton} type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </form>
      {showSuccessToast && (
        <div className={`${styles.toastBase} ${styles.toastSuccess}`}>Ticket successfully sent!</div>
      )}
      {showErrorToast && (
        <div className={`${styles.toastBase} ${styles.toastError}`}>Failed to create ticket. Please try again.</div>
      )}
    </div>
  )
}

export default CreateTicketForm