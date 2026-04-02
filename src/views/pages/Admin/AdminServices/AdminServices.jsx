import React, { useEffect, useState } from 'react'
import { Button, Tag, Modal, Form, Input, InputNumber } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReusableTable from '../../../../components/reusableTable/reusableaTable'
import { getRequest, deleteRequest, postRequest, putRequest } from '../../../../Helpers/index'
import toast from 'react-hot-toast'

const ServicesPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()

  // ── Fetch all services ───────────────────────────────
  const fetchServices = () => {
    setLoading(true)
    getRequest('services?page=1&limit=100')
      .then((res) => setData(res?.data?.data || []))
      .catch(() => toast.error('Failed to fetch services'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchServices()
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
      serviceName: record.serviceName,
      rate: record.rate,
    })
    setModalOpen(true)
  }

  // ── Delete ───────────────────────────────────────────
  const handleDelete = (record) => {
    deleteRequest(`services/${record._id}`)
      .then(() => {
        toast.success('Service deleted successfully')
        fetchServices()
      })
      .catch(() => toast.error('Failed to delete service'))
  }

  // ── Submit (Add or Edit) ─────────────────────────────
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        setSubmitLoading(true)

        const request = editRecord
          ? putRequest(`services/${editRecord._id}`, values)
          : postRequest({ url: 'services', cred: values })

        request
          .then(() => {
            toast.success(editRecord ? 'Service updated successfully' : 'Service added successfully')
            setModalOpen(false)
            form.resetFields()
            setEditRecord(null)
            fetchServices()
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong')
          })
          .finally(() => setSubmitLoading(false))
      })
      .catch(() => {})
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditRecord(null)
    form.resetFields()
  }

  // ── Table columns ────────────────────────────────────
  const serviceColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
      sorter: (a, b) => a.serviceName.localeCompare(b.serviceName),
    },
    {
      title: 'Rate (₹)',
      dataIndex: 'rate',
      key: 'rate',
      sorter: (a, b) => a.rate - b.rate,
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0b3f76' }}>
          ₹{Number(val).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Added On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '—',
    },
  ]

  return (
    <>
      <ReusableTable
        title="Services"
        columns={serviceColumns}
        data={data}
        loading={loading}
        rowKey="_id"
        searchKeys={['serviceName']}
        searchPlaceholder="Search by service name..."
        onEdit={handleEdit}
        onDelete={handleDelete}
        headerExtra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
            style={{ backgroundColor: '#0b3f76', borderColor: '#0b3f76' }}
          >
            Add Service
          </Button>
        }
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={
          <span style={{ color: '#0b3f76', fontWeight: 600 }}>
            {editRecord ? 'Edit Service' : 'Add New Service'}
          </span>
        }
        open={modalOpen}
        onCancel={handleModalClose}
        onOk={handleSubmit}
        okText={editRecord ? 'Update' : 'Add Service'}
        cancelText="Cancel"
        confirmLoading={submitLoading}
        okButtonProps={{ style: { backgroundColor: '#0b3f76', borderColor: '#0b3f76' } }}
        destroyOnClose
        width={440}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label="Service Name"
            name="serviceName"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="e.g. X-Ray, MRI Scan, Blood Test" />
          </Form.Item>

          <Form.Item
            label="Rate (₹)"
            name="rate"
            rules={[
              { required: true, message: 'Please enter rate' },
              { type: 'number', min: 1, message: 'Rate must be greater than 0' },
            ]}
          >
            <InputNumber
              placeholder="e.g. 500"
              min={1}
              style={{ width: '100%' }}
              prefix="₹"
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/,/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ServicesPage