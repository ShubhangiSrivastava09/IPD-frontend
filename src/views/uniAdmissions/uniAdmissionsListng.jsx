import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../components/reusableTable/reusableaTable";
import { getRequest, postRequest, deleteRequest } from "../../Helpers/index";
import toast from "react-hot-toast";
import { AppContext } from "../../Context/AppContext";
import { useRoles } from "../../Context/AuthContext";

const { Option } = Select;

const AdmissionsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const { role } = useRoles();

  const isAdmin = role === "Admin";
  const isStaff = role === "Staff";
  const isDoctor = role === "Doctor";
  const canCreate = isAdmin || isStaff;
  const canDelete = isAdmin;

  const fetchAdmissions = () => {
    setLoading(true);
    getRequest("admissions")
      .then((res) => setData(res?.data?.data || res?.data || []))
      .catch(() => toast.error("Failed to fetch admissions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleCreate = (values) => {
    setCreateLoading(true);
    const payload = {
      ...values,
      admissionDate: values.admissionDate
        ? values.admissionDate.format("YYYY-MM-DD")
        : undefined,
    };
    postRequest({ url: "admissions", cred: payload })
      .then(() => {
        toast.success("Admission created successfully");
        setCreateModal(false);
        form.resetFields();
        fetchAdmissions();
      })
      .catch(() => toast.error("Failed to create admission"))
      .finally(() => setCreateLoading(false));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Admission",
      content: `Are you sure you want to delete the admission for ${record.patientName}?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        deleteRequest(`admissions/${record._id}`)
          .then(() => {
            toast.success("Admission deleted");
            fetchAdmissions();
          })
          .catch(() => toast.error("Delete failed"));
      },
    });
  };

  const handleView = (record) => {
    navigate(`/admin/admissions/${record._id}`, {
      state: { admission: record },
    });
  };

  const statusColors = {
    pending: "orange",
    approved: "blue",
    admitted: "green",
    discharged: "default",
    rejected: "red",
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#042954",
              color: "#fabf22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {val?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <span style={{ fontWeight: 500 }}>{val}</span>
        </div>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 80,
      render: (val) => <span>{val} yrs</span>,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (val) => (
        <span style={{ textTransform: "capitalize" }}>{val || "—"}</span>
      ),
    },
    {
      title: "Admission Date",
      dataIndex: "admissionDate",
      key: "admissionDate",
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
  
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{
                borderColor: "#042954",
                color: "#042954",
                borderRadius: 6,
              }}
            />
          </Tooltip>
          {canDelete && (
            <Tooltip title="Delete">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                style={{ borderRadius: 6 }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#042954",
            }}
          >
            <MedicineBoxOutlined
              style={{ marginRight: 10, color: "#fabf22" }}
            />
            Admissions
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            {isAdmin && "Full access — manage all admissions and services"}
            {isDoctor && "View admissions and manage patient services"}
            {isStaff && "Create and view admissions"}
          </p>
        </div>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModal(true)}
            style={{
              backgroundColor: "#042954",
              borderColor: "#042954",
              borderRadius: 8,
              height: 40,
              fontWeight: 600,
              paddingInline: 20,
            }}
          >
            New Admission
          </Button>
        )}
      </div>


      {/* Table */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          border: "1px solid #f0f0f0",
          overflow: "hidden",
        }}
      >
        <ReusableTable
          title=""
          columns={columns}
          data={data}
          loading={loading}
          searchKeys={["patientName", "gender", "status"]}
        />
      </div>

      {/* Create Admission Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserOutlined style={{ color: "#fabf22" }} />
            <span style={{ color: "#042954", fontWeight: 700 }}>
              New Admission
            </span>
          </div>
        }
        open={createModal}
        onCancel={() => {
          setCreateModal(false);
          form.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Patient Name"
            name="patientName"
            rules={[{ required: true, message: "Please enter patient name" }]}
          >
            <Input
              placeholder="e.g. John Doe"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <Form.Item
              label="Age"
              name="age"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                placeholder="25"
                min={1}
                max={120}
                size="large"
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select size="large" placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Admission Date"
            name="admissionDate"
            rules={[
              { required: true, message: "Please select admission date" },
            ]}
          >
            <DatePicker
              size="large"
              style={{ width: "100%", borderRadius: 8 }}
              format="DD-MM-YYYY"
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 8,
            }}
          >
            <Button
              onClick={() => {
                setCreateModal(false);
                form.resetFields();
              }}
              style={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading}
              style={{
                backgroundColor: "#042954",
                borderColor: "#042954",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Create Admission
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdmissionsPage;
