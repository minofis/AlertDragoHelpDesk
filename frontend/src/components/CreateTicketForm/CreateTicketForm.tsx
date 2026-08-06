import React, { useState } from 'react'
import { createTicket } from '../../api/client'
import styles from './CreateTicketForm.module.css'

const VALID_ROOMS = ['101', '102', '103', '201', '202']

interface CreateTicketFormProps {
  onSuccess: (ticketId: number) => void
  onError: () => void
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess, onError }) => {
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{roomNumber?: string, description?: string}>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const roomEmpty = !roomNumber.trim()
    const descEmpty = !description.trim()
    const roomInvalid = !roomEmpty && !VALID_ROOMS.includes(roomNumber.trim())

    if (roomEmpty || descEmpty || roomInvalid) {
      setValidationErrors({
        roomNumber: roomEmpty ? "Обов'язкове поле" : roomInvalid ? 'Будь ласка, виберіть дійсну аудиторію зі списку' : undefined,
        description: descEmpty ? "Обов'язкове поле" : undefined,
      })
      return
    }

    setValidationErrors({})

    const ticketData = {
      roomNumber: roomNumber,
      description: description,
    }

    setIsLoading(true)

    try {
      const newTicket = await createTicket(ticketData)
      setRoomNumber('')
      setDescription('')
      console.log('Ticket created successfully', newTicket)
      onSuccess(Number(newTicket.id))
    } catch (error) {
      console.error('Error sending request:', error)
      onError()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Створити нову заявку</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="roomNumber">
            Аудиторія
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
            Опис проблеми
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
          {isLoading ? 'Створення...' : 'Створити'}
        </button>
      </form>
    </div>
  )
}

export default CreateTicketForm
