import { useState } from 'react'

function App() {
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ 
      roomNumber, 
      description 
    })
  }

  return (
    <div>
      <h1>Create a new Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="roomNumber">Room number</label>
          <input
            id="roomNumber"
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

export default App
