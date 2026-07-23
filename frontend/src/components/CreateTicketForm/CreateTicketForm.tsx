import React, { useState, useEffect, useRef } from 'react'
import styles from './CreateTicketForm.module.css'

const VALID_ROOMS = ['101', '102', '103', '201', '202']

interface CreateTicketFormProps {
  onSuccess: (ticketId: number) => void
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess }) => {
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{roomNumber?: string, description?: string}>({})
  const [isExiting, setIsExiting] = useState(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isExiting) {
      exitTimerRef.current = setTimeout(() => {
        setShowSuccessToast(false)
        setShowErrorToast(false)
        setIsExiting(false)
      }, 300)
      return () => {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current)
        }
      }
    }
  }, [isExiting])

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const roomEmpty = !roomNumber.trim()
    const descEmpty = !description.trim()
    const roomInvalid = !roomEmpty && !VALID_ROOMS.includes(roomNumber.trim())

    if (roomEmpty || descEmpty || roomInvalid) {
      setValidationErrors({
        roomNumber: roomEmpty ? 'Required field' : roomInvalid ? 'Please select a valid room from the list' : undefined,
        description: descEmpty ? 'Required field' : undefined,
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
        setTimeout(() => setIsExiting(true), 3000)
        const newTicket = await response.json()
        console.log('Ticket created successfully', newTicket)
        onSuccess(Number(newTicket.id))
      } else {
        console.error('Failed to create ticket', response.status)
        throw new Error(`Server error: ${response.status}`)
      }
    } catch (error) {
      setShowErrorToast(true)
      setTimeout(() => setIsExiting(true), 3000)
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
              list="room-options"
              value={roomNumber}
              onChange={(e) => {
                setRoomNumber(e.target.value)
                setValidationErrors((prev) => ({ ...prev, roomNumber: undefined }))
              }}
            />
            {validationErrors.roomNumber && <span className={styles.errorText}>{validationErrors.roomNumber}</span>}
          </div>
          <datalist id="room-options">
            {VALID_ROOMS.map((room) => (
              <option key={room} value={room} />
            ))}
          </datalist>
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
                setValidationErrors((prev) => ({ ...prev, description: undefined }))
              }}
            />
            {validationErrors.description && <span className={styles.errorText}>{validationErrors.description}</span>}
          </div>
        </div>
        <button className={styles.submitButton} type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </form>
      {showSuccessToast && (
        <div className={`${styles.toastBase} ${styles.toastSuccess} ${isExiting ? styles.toastExit : ''}`}>Ticket successfully sent!</div>
      )}
      {showErrorToast && (
        <div className={`${styles.toastBase} ${styles.toastError} ${isExiting ? styles.toastExit : ''}`}>Failed to create ticket. Please try again.</div>
      )}
    </div>
  )
}

export default CreateTicketForm