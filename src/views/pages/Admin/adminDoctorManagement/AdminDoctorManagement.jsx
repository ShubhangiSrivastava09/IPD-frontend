import React, { useEffect, useState } from 'react'
import { Button, Tag, Modal, Form, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReusableTable from '../../../../components/reusableTable/reusableaTable'
import { getRequest, deleteRequest, postRequest, putRequest } from '../../../../Helpers/index'
import toast from 'react-hot-toast'

const DoctorPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null) // null = Add mode, object = Edit mode
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()

  // ── Fetch all doctors ────────────────────────────────
  const fetchDoctors = () => {
    setLoading(true)
    getRequest('doctors?page=1&limit=100')
      .then((res) => setData(res?.data?.data || []))
      .catch(() => toast.error('Failed to fetch doctors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  // ── Open Add modal ───────────────────────────────────
  const openAddModal = () => {
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  // ── Open Edit modal ──────────────────────────────────
  const handleEdit = (record) => {
    setEditRecord(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      specialization: record.specialization,
    })
    setModalOpen(true)
  }

  // ── Delete ───────────────────────────────────────────
  const handleDelete = (record) => {
    deleteRequest(`doctors/${record._id}`)
      .then(() => {
        toast.success('Doctor deleted successfully')
        fetchDoctors()
      })
      .catch(() => toast.error('Failed to delete doctor'))
  }

  // ── Submit (Add or Edit) ─────────────────────────────
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        setSubmitLoading(true)

        const request = editRecord
          ? putRequest(`doctors/${editRecord._id}`, values)  // PUT for edit
          : postRequest({ url: 'doctors', cred: values })    // POST for add

        request
          .then(() => {
            toast.success(editRecord ? 'Doctor updated successfully' : 'Doctor added successfully')
            setModalOpen(false)
            form.resetFields()
            setEditRecord(null)
            fetchDoctors()
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong')
          })
          .finally(() => setSubmitLoading(false))
      })
      .catch(() => {
        // form validation failed — antd shows inline errors automatically
      })
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditRecord(null)
    form.resetFields()
  }

  // ── Table columns ────────────────────────────────────
  const doctorColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (val) => val || <span style={{ color: '#bbb' }}>—</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
      render: (isBlocked) =>
        isBlocked
          ? <Tag color="red">Blocked</Tag>
          : <Tag color="green">Active</Tag>,
    },
  ]

  return (
    <>
      <ReusableTable
        title="Doctor Management"
        columns={doctorColumns}
        data={data}
        loading={loading}
        searchKeys={['name', 'email', 'specialization']}
        searchPlaceholder="Search by name, email or specialization..."
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="_id"
        headerExtra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
            style={{ backgroundColor: '#0b3f76', borderColor: '#0b3f76' }}
          >
            Add Doctor
          </Button>
        }
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={
          <span style={{ color: '#0b3f76', fontWeight: 600 }}>
            {editRecord ? 'Edit Doctor' : 'Add New Doctor'}
          </span>
        }
        open={modalOpen}
        onCancel={handleModalClose}
        onOk={handleSubmit}
        okText={editRecord ? 'Update' : 'Add Doctor'}
        cancelText="Cancel"
        confirmLoading={submitLoading}
        okButtonProps={{ style: { backgroundColor: '#0b3f76', borderColor: '#0b3f76' } }}
        destroyOnClose
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter doctor name' }]}
          >
            <Input placeholder="e.g. Dr. Shreya Singh" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="e.g. shreya@hospital.com" />
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: 'Please enter specialization' }]}
          >
            <Input placeholder="e.g. Cardiology" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default DoctorPage