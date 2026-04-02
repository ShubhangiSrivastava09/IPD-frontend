// src/components/common/ReusableTable.jsx
import React, { useState, useMemo } from 'react'
import { Table, Input, Button, Popconfirm, Switch, Tooltip, Space, Tag } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

/**
 * ReusableTable — Plug-and-play Ant Design table
 *
 * Props:
 * ─────────────────────────────────────────────────────
 * @param {Array}   columns        - Ant Design column definitions (do NOT include actions column here)
 * @param {Array}   data           - Array of row objects
 * @param {boolean} loading        - Show loading skeleton
 * @param {string}  rowKey         - Unique key field name (default: "_id")
 * @param {string}  searchPlaceholder - Placeholder for search input
 * @param {Array}   searchKeys     - Array of object keys to search across e.g. ['name','email']
 *
 * Action column props (all optional — only shown if at least one is provided):
 * @param {Function} onEdit        - (record) => void   — shows Edit button
 * @param {Function} onDelete      - (record) => void   — shows Delete button with confirm
 * @param {Function} onToggle      - (checked, record) => void — shows Toggle switch
 * @param {Function} toggleKey     - key in record that holds boolean toggle value e.g. "isBlocked"
 * @param {boolean}  toggleInvert  - if true, active = false (e.g. isBlocked: false = Active)
 *
 * Pagination props:
 * @param {number}  pageSize       - Rows per page (default: 10)
 * @param {boolean} showPagination - Show/hide pagination (default: true)
 *
 * Extra:
 * @param {React.ReactNode} headerExtra - Extra content rendered right of search (e.g. Add button)
 * @param {string}  title          - Table heading text
 * ─────────────────────────────────────────────────────
 *
 * Usage example:
 * ─────────────────────────────────────────────────────
 * <ReusableTable
 *   title="Staff List"
 *   columns={staffColumns}
 *   data={staffList}
 *   loading={loading}
 *   searchKeys={['name', 'email', 'role']}
 *   onEdit={(record) => openEditModal(record)}
 *   onDelete={(record) => handleDelete(record._id)}
 *   onToggle={(checked, record) => handleBlock(record._id, checked)}
 *   toggleKey="isBlocked"
 *   toggleInvert={true}
 *   headerExtra={<Button type="primary" onClick={openAddModal}>Add Staff</Button>}
 * />
 * ─────────────────────────────────────────────────────
 */

const ReusableTable = ({
  columns = [],
  data = [],
  loading = false,
  rowKey = '_id',
  searchPlaceholder = 'Search...',
  searchKeys = [],
  onEdit,
  onDelete,
  onToggle,
  toggleKey = 'isActive',
  toggleInvert = false,
  pageSize = 10,
  showPagination = true,
  headerExtra,
  title,
}) => {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // ── Filtered data based on search ──────────────────
  const filteredData = useMemo(() => {
    if (!searchText.trim() || searchKeys.length === 0) return data

    const lower = searchText.toLowerCase()
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key]
        return val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
      }),
    )
  }, [data, searchText, searchKeys])

  // ── Action column (only if at least one action is passed) ──
  const hasActions = onEdit || onDelete || onToggle

  const actionColumn = hasActions
    ? {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: onToggle && onEdit && onDelete ? 180 : onToggle ? 100 : 120,
        render: (_, record) => (
          <Space size="small">
            {onEdit && (
              <Tooltip title="Edit">
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                  style={{ borderColor: '#0b3f76', color: '#0b3f76' }}
                />
              </Tooltip>
            )}

            {onDelete && (
              <Popconfirm
                title="Are you sure you want to delete?"
                onConfirm={() => onDelete(record)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete">
                  <Button
                    type="default"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            )}

            {onToggle && (
              <Tooltip
                title={
                  toggleInvert
                    ? record[toggleKey]
                      ? 'Blocked — click to unblock'
                      : 'Active — click to block'
                    : record[toggleKey]
                      ? 'Active — click to deactivate'
                      : 'Inactive — click to activate'
                }
              >
                <Switch
                  size="small"
                  checked={toggleInvert ? !record[toggleKey] : record[toggleKey]}
                  onChange={(checked) => onToggle(checked, record)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      }
    : null

  const finalColumns = actionColumn ? [...columns, actionColumn] : columns

  // ── Pagination config ──────────────────────────────
  const paginationConfig = showPagination
    ? {
        current: currentPage,
        pageSize,
        total: filteredData.length,
        onChange: (page) => setCurrentPage(page),
        showSizeChanger: false,
        showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} records`,
        style: { marginTop: '16px' },
      }
    : false

  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>

      {/* ── Table header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          {title && (
            <h6 style={{ margin: 0, fontWeight: 600, color: '#0b3f76', fontSize: '1rem' }}>
              {title}
            </h6>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {searchKeys.length > 0 && (
            <Input
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentPage(1) // reset to page 1 on search
              }}
              allowClear
              style={{ width: 240, borderRadius: '7px' }}
            />
          )}
          {headerExtra && <div>{headerExtra}</div>}
        </div>
      </div>

      {/* ── Table ── */}
      <Table
        columns={finalColumns}
        dataSource={filteredData}
        rowKey={rowKey}
        loading={loading}
        pagination={paginationConfig}
        scroll={{ x: 'max-content' }}
        size="middle"
        bordered={false}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
        }
        style={{ fontSize: '0.9rem' }}
      />

      {/* ── Zebra stripe styles ── */}
      <style>{`
        .table-row-light td { background-color: #ffffff !important; }
        .table-row-dark  td { background-color: #f7f9fc !important; }
        .ant-table-thead > tr > th {
          background-color: #0b3f76 !important;
          color: #ffffff !important;
          font-weight: 600;
          font-size: 0.82rem;
          letter-spacing: 0.03em;
        }
        .ant-table-thead > tr > th::before { display: none !important; }
        .ant-pagination-item-active {
          border-color: #0b3f76 !important;
        }
        .ant-pagination-item-active a {
          color: #0b3f76 !important;
        }
        .ant-switch-checked {
          background-color: #0b3f76 !important;
        }
      `}</style>
    </div>
  )
}

export default ReusableTable