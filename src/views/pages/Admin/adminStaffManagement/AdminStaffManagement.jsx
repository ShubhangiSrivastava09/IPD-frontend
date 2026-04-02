import React, { useEffect, useState } from 'react'
import { Button, Tag, Modal, Form, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReusableTable from '../../../../components/reusableTable/reusableaTable'
import { getRequest, deleteRequest, postRequest, putRequest, patchRequest } from '../../../../Helpers/index'
import toast from 'react-hot-toast'

const StaffPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null) // null = Add mode, object = Edit mode
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()

  // ── Fetch all staff ──────────────────────────────────
  const fetchStaff = () => {
    setLoading(true)
    getRequest('staff?page=1&limit=100')
      .then((res) => setData(res?.data?.data || []))
      .catch(() => toast.error('Failed to fetch staff'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStaff()
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
      department: record.department,
    })
    setModalOpen(true)
  }

  // ── Delete ───────────────────────────────────────────
  const handleDelete = (record) => {
    deleteRequest(`staff/${record._id}`)
      .then(() => {
        toast.success('Staff deleted successfully')
        fetchStaff()
      })
      .catch(() => toast.error('Failed to delete staff'))
  }

  // ── Block / Unblock toggle ───────────────────────────
  const handleToggle = (checked, record) => {
    // checked = true → Active (isBlocked: false)
    // checked = false → Blocked (isBlocked: true)
    patchRequest(`staff/${record._id}/block`, { isBlocked: !checked })
      .then(() => {
        toast.success(`Staff ${checked ? 'unblocked' : 'blocked'} successfully`)
        fetchStaff()
      })
      .catch(() => toast.error('Failed to update status'))
  }

  // ── Submit (Add or Edit) ─────────────────────────────
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        setSubmitLoading(true)

        const request = editRecord
          ? putRequest(`staff/${editRecord._id}`, values)   // PUT for edit
          : postRequest({ url: 'staff', cred: values })     // POST for add

        request
          .then(() => {
            toast.success(editRecord ? 'Staff updated successfully' : 'Staff added successfully')
            setModalOpen(false)
            form.resetFields()
            setEditRecord(null)
            fetchStaff()
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong')
          })
          .finally(() => setSubmitLoading(false))
      })
      .catch(() => {
        // antd shows inline validation errors automatically
      })
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditRecord(null)
    form.resetFields()
  }

  // ── Table columns ────────────────────────────────────
  const staffColumns = [
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
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (val) => val
        ? <Tag color="blue">{val}</Tag>
        : <span style={{ color: '#bbb' }}>—</span>,
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
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
  ]

  return (
    <>
      <ReusableTable
        title="Staff Management"
        columns={staffColumns}
        data={data}
        loading={loading}
        rowKey="_id"
        searchKeys={['name', 'email', 'department']}
        searchPlaceholder="Search by name, email or department..."
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        toggleKey="isBlocked"
        toggleInvert={true}      // isBlocked: false = Active → switch ON
        headerExtra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
            style={{ backgroundColor: '#0b3f76', borderColor: '#0b3f76' }}
          >
            Add Staff
          </Button>
        }
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={
          <span style={{ color: '#0b3f76', fontWeight: 600 }}>
            {editRecord ? 'Edit Staff Member' : 'Add New Staff Member'}
          </span>
        }
        open={modalOpen}
        onCancel={handleModalClose}
        onOk={handleSubmit}
        okText={editRecord ? 'Update' : 'Add Staff'}
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
            rules={[{ required: true, message: 'Please enter staff name' }]}
          >
            <Input placeholder="e.g. Rahul Verma" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="e.g. rahul@hospital.com" />
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input placeholder="e.g. Billing, Operations, Reception" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default StaffPage