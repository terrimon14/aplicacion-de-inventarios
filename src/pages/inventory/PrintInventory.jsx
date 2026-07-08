import { useNavigate } from 'react-router-dom'
import PrintInventoryModal from '../../components/inventory/PrintInventoryModal'

export default function PrintInventory() {
  const navigate = useNavigate()

  return (
    <PrintInventoryModal
      isOpen
      onClose={() => navigate('/inventory/stock')}
    />
  )
}
