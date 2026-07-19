import React from 'react'
import styles from './TicketsTable.module.css'

const TicketsTable: React.FC = () => {
  return (
<table className={styles.table}>
  <thead>
    <tr>
      <th className={styles.headerCell}>ID</th>
      <th className={styles.headerCell}>Room number</th>
      <th className={styles.headerCell}>Author</th>
      <th className={styles.headerCell}>Description</th>
      <th className={styles.headerCell}>Date</th>
      <th className={styles.headerCell}>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className={styles.cell}></td>
      <td className={styles.cell}></td>
      <td className={styles.cell}></td>
      <td className={styles.cell}></td>
      <td className={styles.cell}></td>
      <td className={styles.cell}></td>
    </tr>
  </tbody>
</table>
  )
}
  export default TicketsTable