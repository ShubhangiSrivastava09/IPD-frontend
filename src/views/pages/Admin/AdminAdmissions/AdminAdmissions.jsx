import React, { useEffect, useState } from 'react'
import { Button, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReusableTable from '../../../../components/reusableTable/reusableaTable'
import { getRequest, deleteRequest, patchRequest } from '../../../../Helpers/index'
import toast from 'react-hot-toast'
 
const AdmissionsPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
 
  const fetchStaff = () => {
    setLoading(true)
    getRequest('users')
      .then((res) => setData(res?.data?.data || []))
      .catch(() => toast.error('Failed to fetch staff'))
      .finally(() => setLoading(false))
  }
 
  useEffect(() => { fetchStaff() }, [])
 
  const handleEdit = (record) => {
    console.log('Edit staff:', record)
    // open your edit modal here, e.g. setEditModal({ open: true, data: record })
  }
 
  const handleDelete = (record) => {
    deleteRequest(`users/${record._id}`)
      .then(() => { toast.success('Staff deleted'); fetchStaff() })
      .catch(() => toast.error('Delete failed'))
  }
 
  const handleToggle = (checked, record) => {
    // checked = true means "Active" (isBlocked: false), toggleInvert handles display
    patchRequest(`users/${record._id}/block`, { isBlocked: !checked })
      .then(() => { toast.success('Status updated'); fetchStaff() })
      .catch(() => toast.error('Update failed'))
  }
 
 const admissionColumns = [
  { title: 'Patient Name', dataIndex: 'patientName',    key: 'patientName' },
  { title: 'Ward',         dataIndex: 'ward',           key: 'ward' },
  { title: 'Doctor',       dataIndex: 'doctorName',     key: 'doctorName' },
  {
    title: 'Admitted On',
    dataIndex: 'admittedAt',
    key: 'admittedAt',
    render: (val) => new Date(val).toLocaleDateString(),
  },
  {
    title: 'Discharge Status',
    dataIndex: 'isDischarge',
    key: 'isDischarge',
    render: (val) => <Tag color={val ? 'green' : 'orange'}>{val ? 'Discharged' : 'Admitted'}</Tag>,
  },
]
 
  return (
    <ReusableTable
  title="Admissions"
  columns={admissionColumns}
  data={admissions}
  loading={loading}
  searchKeys={['patientName', 'ward', 'doctorName']}
  onEdit={handleEdit}
  onToggle={handleDischargeToggle}
  toggleKey="isDischarge"
  toggleInvert={false}

    />
  )
}
 
export default AdmissionsPage