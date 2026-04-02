import React, { useEffect, useState } from 'react'
import { Button, Tag, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import ReusableTable from '../../../../components/reusableTable/reusableaTable'
import {
  getRequest,
  deleteRequest,
  postRequest,
  putRequest,
  patchRequest,
} from '../../../../Helpers/index'
import toast from 'react-hot-toast'

const { Option } = Select

const ROLES = ['Admin', 'Doctor', 'Staff']

const ROLE_COLORS = {
  Admin: 'purple',
  Doctor: 'blue',
  Staff: 'cyan',
}

const UsersPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [roleFilter, setRoleFilter] = useState(null)
  const [form] = Form.useForm()

  // ── Fetch users ──────────────────────────────────────
  const fetchUsers = (role = roleFilter) => {
    setLoading(true)
    const params = new URLSearchParams({ page: 1, limit: 100 })
    if (role) params.append('role', role)
    getRequest(`users?${params.toString()}`)
      .then((res) => setData(res?.data?.users || res?.data?.data || res?.data || []))
      .catch(() => toast.error('Failed to fetch users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const openAddModal = () => {
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
    })
    setModalOpen(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete ${record.name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteRequest(`users/${record._id}`)
          .then(() => { toast.success('User deleted successfully'); fetchUsers() })
          .catch(() => toast.error('Failed to delete user'))
      },
    })
  }

  const handleToggle = (checked, record) => {
    patchRequest({ url: `users/block/${record._id}` , cred: { isBlocked: !checked } })
      .then(() => {
        toast.success(`User ${!checked ? 'blocked' : 'unblocked'} successfully`)
        fetchUsers()
      })
      .catch(() => toast.error('Failed to update status'))
  }

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        setSubmitLoading(true)

        const request = editRecord
          ? putRequest({ url: `users/${editRecord._id}`, cred: {
              name: values.name,
              email: values.email,
              role: values.role,
            }})
          : postRequest({
              url: 'users',
              cred: values, 
            })

        request
          .then(() => {
            toast.success(editRecord ? 'User updated successfully' : 'User created successfully')
            setModalOpen(false)
            form.resetFields()
            setEditRecord(null)
            fetchUsers()
          })
          .catch((err) => toast.error(err?.response?.data?.message || 'Something went wrong'))
          .finally(() => setSubmitLoading(false))
      })
      .catch(() => {})
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditRecord(null)
    form.resetFields()
  }

  const handleRoleFilter = (val) => {
    setRoleFilter(val || null)
    fetchUsers(val || null)
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 55,
      render: (_, __, index) => (
        <span style={{ color: '#aaa', fontSize: 13 }}>{index + 1}</span>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            backgroundColor: '#042954', color: '#fabf22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            {record.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#042954', fontSize: 14 }}>
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (val) => (
        <Tag
          color={ROLE_COLORS[val] || 'default'}
          style={{ fontWeight: 600, fontSize: 12 }}
        >
          {val || '—'}
        </Tag>
      ),
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
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : '—',
    },
  ]

  return (
    <>
      <ReusableTable
        title="User Management"
        columns={columns}
        data={data}
        loading={loading}
        rowKey="_id"
        searchKeys={['name', 'email', 'role']}
        searchPlaceholder="Search by name, email or role..."
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        toggleKey="isBlocked"
        toggleInvert={true}
        headerExtra={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Select
              allowClear
              placeholder="Filter by role"
              style={{ width: 160, borderRadius: 8 }}
              onChange={handleRoleFilter}
              value={roleFilter}
            >
              {ROLES.map((r) => (
                <Option key={r} value={r}>{r}</Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
              style={{
                backgroundColor: '#042954',
                borderColor: '#042954',
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Add User
            </Button>
          </div>
        }
      />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserOutlined style={{ color: '#fabf22' }} />
            <span style={{ color: '#042954', fontWeight: 700 }}>
              {editRecord ? 'Edit User' : 'Add New User'}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={handleModalClose}
        onOk={handleSubmit}
        okText={editRecord ? 'Update User' : 'Create User'}
        cancelText="Cancel"
        confirmLoading={submitLoading}
        okButtonProps={{
          style: { backgroundColor: '#042954', borderColor: '#042954', borderRadius: 8 },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        destroyOnClose
        width={460}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input
              placeholder="e.g. John Doe"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              placeholder="e.g. john@hospital.com"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select
              placeholder="Select role"
              size="large"
              style={{ borderRadius: 8 }}
            >
              {ROLES.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={ROLE_COLORS[r]} style={{ marginRight: 6 }}>{r}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {!editRecord && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                placeholder="e.g. John#123"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}

export default UsersPage