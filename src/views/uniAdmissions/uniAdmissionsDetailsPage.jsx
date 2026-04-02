import React, { useEffect, useState, useContext, useRef, use } from "react";
import {
  Button,
  Tag,
  Spin,
  InputNumber,
  Select,
  Empty,
  Tooltip,
  Badge,
  Drawer,
  Form,
  Modal,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
} from "../../Helpers/index";
import toast from "react-hot-toast";
import { useRoles } from "../../Context/AuthContext";
import axios from "axios";
import Cookies from "js-cookie";
import { log } from "three";

const { Option } = Select;

const STATUS_COLORS = {
  pending: { bg: "#fff7e6", text: "#d46b08", border: "#ffd591" },
  approved: { bg: "#e6f4ff", text: "#0958d9", border: "#91caff" },
  admitted: { bg: "#f6ffed", text: "#389e0d", border: "#b7eb8f" },
  discharged: { bg: "#f5f5f5", text: "#595959", border: "#d9d9d9" },
  rejected: { bg: "#fff2f0", text: "#cf1322", border: "#ffa39e" },
};

const getStatusStyle = (status) =>
  STATUS_COLORS[status] || STATUS_COLORS.pending;

const InfoCard = ({ icon, label, value, accent }) => (
  <div
    style={{
      backgroundColor: "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: 10,
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: accent || "#f0f4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          color: "#042954",
          fontSize: 14,
          marginTop: 2,
        }}
      >
        {value || "—"}
      </div>
    </div>
  </div>
);

const ServiceCartItem = ({ item, canManage, onRemove }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid #f5f5f5",
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "transparent")
    }
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: "#042954", fontSize: 14 }}>
        {item.serviceName || item.name}
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
        Qty: <strong style={{ color: "#fabf22" }}>{item.quantity}</strong>
        {item.rate && (
          <> &nbsp;·&nbsp; ₹{(item.rate * item.quantity).toLocaleString()}</>
        )}
      </div>
    </div>
    {canManage && (
      <Tooltip title="Remove service">
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(item)}
          style={{ borderRadius: 6 }}
        />
      </Tooltip>
    )}
  </div>
);

// ─── Bill Modal ───────────────────────────────────────────────────────────────

const BillModal = ({ open, onClose, admissionId, patientName }) => {
  const [tax, setTax] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [billData, setBillData] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const fetchBill = () => {
    setBillLoading(true);
    setBillData(null);
    getRequest(`billing/${admissionId}?tax=${tax}&discount=${discount}`)
      .then((res) => setBillData(res?.data?.data || res?.data || null))
      .catch(() => toast.error("Failed to fetch bill"))
      .finally(() => setBillLoading(false));
  };

  useEffect(() => {
    if (open) fetchBill();
  }, [open]);

  const handleDownloadPdf = async () => {
    setDownloadLoading(true);
    try {
      // Read token — tries cookie first, falls back to localStorage
      const token = Cookies.get("IPD") || localStorage.getItem("IPD");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      // Log the exact URL being hit so you can verify it in the network tab
      const url = `${import.meta.env.VITE_API_BASE_URL}billing/pdf/${admissionId}?tax=${tax}&discount=${discount}`;
      console.log("PDF URL:", url);

      const response = await axios({
        method: "GET",
        url,
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      // Check what came back
      const contentType = response.headers["content-type"] || "";
      console.log("Response content-type:", contentType);
      console.log("Response status:", response.status);

      if (!contentType.includes("application/pdf")) {
        // Server sent back an error as JSON — decode and show it
        const errorText = await response.data.text();
        console.error("Server error response:", errorText);
        try {
          const json = JSON.parse(errorText);
          toast.error(json?.message || "Server error generating PDF");
        } catch {
          toast.error("Unexpected server response. Check console.");
        }
        return;
      }

      // Valid PDF — trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `invoice-${admissionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Invoice downloaded");
    } catch (err) {
      console.error("PDF download error:", err);
      // Axios throws on non-2xx — decode the blob error body
      if (err.response?.data instanceof Blob) {
        const errorText = await err.response.data.text();
        console.error("Error body:", errorText);
        try {
          const json = JSON.parse(errorText);
          toast.error(json?.message || "Failed to download PDF");
        } catch {
          toast.error(`Server error ${err.response?.status || ""}`);
        }
      } else {
        toast.error(err?.message || "Failed to download invoice");
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  // ── Pull values from correct nested paths ──────────────────────────────────
  const services = billData?.services || [];
  const summary = billData?.summary || {};

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileTextOutlined style={{ color: "#fabf22", fontSize: 18 }} />
          <span style={{ color: "#042954", fontWeight: 700, fontSize: 16 }}>
            Bill Summary
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
    >
      {/* Tax & Discount controls */}
      {/* <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#042954",
              display: "block",
              marginBottom: 6,
            }}
          >
            Tax (%)
          </label>
          <InputNumber
            min={0}
            max={100}
            value={tax}
            onChange={setTax}
            style={{ width: "100%", borderRadius: 8 }}
            size="large"
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#042954",
              display: "block",
              marginBottom: 6,
            }}
          >
            Discount (%)
          </label>
          <InputNumber
            min={0}
            max={100}
            value={discount}
            onChange={setDiscount}
            style={{ width: "100%", borderRadius: 8 }}
            size="large"
          />
        </div>
      </div>

      <Button
        block
        onClick={fetchBill}
        loading={billLoading}
        style={{
          borderColor: "#042954",
          color: "#042954",
          borderRadius: 8,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        Recalculate
      </Button> */}

      {/* Bill content */}
      {billLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : billData ? (
        <div
          style={{
            backgroundColor: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Bill header */}
          <div
            style={{
              backgroundColor: "#042954",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ color: "#fabf22", fontWeight: 700, fontSize: 15 }}>
                {billData.patientName || patientName}
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                Admission ID: {billData.admissionId || admissionId}
              </div>
            </div>
            <div style={{ color: "#fabf22", fontSize: 12, fontWeight: 600 }}>
              INVOICE
            </div>
          </div>

          {/* Services breakdown — uses billData.services[] with .rate .qty .total */}
          <div style={{ padding: "0 20px" }}>
            {services.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <div
                    style={{ fontWeight: 500, color: "#042954", fontSize: 13 }}
                  >
                    {item.serviceName}
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                    ₹{item.rate?.toLocaleString("en-IN")} × {item.qty}
                  </div>
                </div>
                <div
                  style={{ fontWeight: 600, color: "#042954", fontSize: 13 }}
                >
                  ₹{item.total?.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          {/* Summary — uses billData.summary.* */}
          <div style={{ padding: "12px 20px 20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span style={{ fontSize: 13, color: "#888" }}>Subtotal</span>
              <span style={{ fontSize: 13, color: "#595959", fontWeight: 500 }}>
                ₹{summary.subTotal?.toLocaleString("en-IN") || 0}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span style={{ fontSize: 13, color: "#888" }}>
                Tax ({summary.taxPercent ?? tax}%)
              </span>
              <span style={{ fontSize: 13, color: "#d46b08", fontWeight: 500 }}>
                +₹{summary.taxAmount?.toLocaleString("en-IN") || 0}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <span style={{ fontSize: 13, color: "#888" }}>
                Discount ({summary.discountPercent ?? discount}%)
              </span>
              <span style={{ fontSize: 13, color: "#389e0d", fontWeight: 500 }}>
                −₹{summary.discountAmount?.toLocaleString("en-IN") || 0}
              </span>
            </div>

            <Divider style={{ margin: "10px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#042954" }}>
                Grand Total
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#042954" }}>
                ₹{summary.finalAmount?.toLocaleString("en-IN") || 0}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Button block onClick={onClose} style={{ borderRadius: 8, height: 42 }}>
          Close
        </Button>
        <Button
          type="primary"
          block
          icon={<DownloadOutlined />}
          loading={downloadLoading}
          onClick={handleDownloadPdf}
          style={{
            backgroundColor: "#042954",
            borderColor: "#042954",
            borderRadius: 8,
            fontWeight: 700,
            height: 42,
          }}
        >
          Download PDF
        </Button>
      </div>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdmissionDetailPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { role } = useRoles();

  const isAdmin = role === "Admin";
  const isDoctor = role === "Doctor";
  const canManageServices = isAdmin || isDoctor;
  const canEditStatus = isAdmin;

  const [admission, setAdmission] = useState(state?.admission || null);
  const [admissionLoading, setAdmissionLoading] = useState(!state?.admission);
  const [services, setServices] = useState([]);
  const [cartServices, setCartServices] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false); // ← new

  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchAdmission = () => {
    setAdmissionLoading(true);
    getRequest(`admissions/${id}`)
      .then((res) => setAdmission(res?.data?.data || res?.data || null))
      .catch(() => toast.error("Failed to fetch admission details"))
      .finally(() => setAdmissionLoading(false));
  };

  const fetchServices = () => {
    getRequest("services?isPagination=false")
      .then((res) => {
        console.log("Services API response:", res?.data);

        const list =
          res?.data?.data || 
          res?.data?.services || 
          res?.data || 
          [];

        setServices(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Services fetch error:", err);
        toast.error("Failed to fetch services");
      });
  };

  const fetchCartServices = () => {
    getRequest(`admissions-services/${id}`)
      .then((res) => setCartServices(res?.data?.data || res?.data || []))
      .catch(() => setCartServices(admission?.services || []));
  };

  useEffect(() => {
    if (!state?.admission) fetchAdmission();
    fetchCartServices();
    if (canManageServices) fetchServices();
  }, [id]);

  useEffect(() => { fetchServices() }, [drawerOpen]);

  useEffect(() => {
    if (admission?.services) setCartServices(admission.services);
  }, [admission]);

  const handleAddService = () => {
    if (!selectedService) return toast.error("Please select a service");
    if (!quantity || quantity < 1)
      return toast.error("Quantity must be at least 1");

    const serviceObj = services.find((s) => s._id === selectedService);
    setAddLoading(true);
    postRequest({
      url: `admissions-services`,
      cred: {
        admissionId: id,
        services: [{ serviceId: selectedService, qty: quantity }],
      },
    })
      .then(() => {
        toast.success(`${serviceObj?.serviceName} added to admission`);
        setSelectedService(null);
        setQuantity(1);
        setDrawerOpen(false);
        fetchCartServices();
        fetchAdmission();
      })
      .catch(() => toast.error("Failed to add service"))
      .finally(() => setAddLoading(false));
  };

  const handleRemoveService = (item) => {
    Modal.confirm({
      title: "Remove Service",
      content: `Remove ${item.serviceName || item.name} from this admission?`,
      okText: "Remove",
      okType: "danger",
      onOk: () => {
        deleteRequest(`admissions/${id}/services/${item._id || item.serviceId}`)
          .then(() => {
            toast.success("Service removed");
            fetchCartServices();
            fetchAdmission();
          })
          .catch(() => toast.error("Failed to remove service"));
      },
    });
  };

  const handleStatusChange = (newStatus) => {
    setStatusLoading(true);
    patchRequest(`admissions/${id}`, { status: newStatus })
      .then(() => {
        toast.success("Status updated");
        setAdmission((prev) => ({ ...prev, status: newStatus }));
      })
      .catch(() => toast.error("Failed to update status"))
      .finally(() => setStatusLoading(false));
  };

  const totalCost = cartServices.reduce(
    (sum, item) => sum + (item.rate || 0) * (item.quantity || 1),
    0,
  );

  if (admissionLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!admission) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Empty description="Admission not found" />
        <Button onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </div>
    );
  }

  const statusStyle = getStatusStyle(admission.status);

  return (
    <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 8, borderColor: "#d9d9d9" }}
          />
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "#042954",
              }}
            >
              Admission Details
            </h2>
            <span style={{ fontSize: 12, color: "#aaa" }}>ID: {id}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Generate Bill button */}
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setBillModalOpen(true)}
            style={{
              borderColor: "#fabf22",
              color: "#042954",
              borderRadius: 8,
              fontWeight: 600,
              backgroundColor: "#fffbe6",
            }}
          >
            Generate Bill
          </Button>

          {/* Add services button */}
          {canManageServices && (
            <Badge
              count={cartServices.length}
              style={{ backgroundColor: "#fabf22", color: "#042954" }}
            >
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => setDrawerOpen(true)}
                style={{
                  backgroundColor: "#042954",
                  borderColor: "#042954",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Add Services
              </Button>
            </Badge>
          )}
        </div>
      </div>

      {/* ── Patient info cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <InfoCard
          icon={<UserOutlined style={{ color: "#042954" }} />}
          label="Patient Name"
          value={admission.patientName}
          accent="#e8eeff"
        />
        <InfoCard
          icon={
            <span style={{ fontWeight: 700, color: "#fabf22", fontSize: 15 }}>
              A
            </span>
          }
          label="Age"
          value={`${admission.age} years`}
          accent="#fffbe6"
        />
        <InfoCard
          icon={<CalendarOutlined style={{ color: "#d46b08" }} />}
          label="Admitted On"
          value={
            admission.createdAt
              ? new Date(admission.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"
          }
          accent="#fff7e6"
        />
      </div>

      {/* ── Services section ── */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #f0f0f0",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MedicineBoxOutlined style={{ color: "#fabf22", fontSize: 18 }} />
            <span style={{ fontWeight: 700, color: "#042954", fontSize: 16 }}>
              Services &amp; Treatments
            </span>
            <span
              style={{
                backgroundColor: "#042954",
                color: "#fabf22",
                borderRadius: 20,
                padding: "1px 10px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {cartServices.length}
            </span>
          </div>
          {totalCost > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#aaa" }}>Total Cost</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#042954" }}>
                ₹{totalCost.toLocaleString("en-IN")}
              </div>
            </div>
          )}
        </div>

        {cartServices.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: "#aaa", fontSize: 14 }}>
                  {canManageServices
                    ? 'No services added yet. Click "Add Services" to get started.'
                    : "No services added to this admission yet."}
                </span>
              }
            />
            {canManageServices && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setDrawerOpen(true)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#042954",
                  borderColor: "#042954",
                  borderRadius: 8,
                }}
              >
                Add First Service
              </Button>
            )}
          </div>
        ) : (
          <div>
            {cartServices.map((item, idx) => (
              <ServiceCartItem
                key={item._id || idx}
                item={item}
                canManage={canManageServices}
                onRemove={handleRemoveService}
              />
            ))}
            {totalCost > 0 && (
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "2px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#fafafa",
                }}
              >
                <span style={{ color: "#888", fontSize: 14 }}>
                  Grand Total:
                </span>
                <span
                  style={{ fontSize: 22, fontWeight: 800, color: "#042954" }}
                >
                  ₹{totalCost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bill Modal ── */}
      <BillModal
        open={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        admissionId={id}
        patientName={admission.patientName}
      />

      {/* ── Add Service Drawer ── */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingCartOutlined style={{ color: "#fabf22", fontSize: 18 }} />
            <span style={{ color: "#042954", fontWeight: 700, fontSize: 16 }}>
              Add Service
            </span>
          </div>
        }
        placement="right"
        width={400}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedService(null);
          setQuantity(1);
        }}
        bodyStyle={{ padding: 0 }}
        extra={
          <Button
            type="primary"
            loading={addLoading}
            onClick={handleAddService}
            disabled={!selectedService}
            style={{
              backgroundColor: "#042954",
              borderColor: "#042954",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Add to Admission
          </Button>
        }
      >
        {/* Patient context strip */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "#042954",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#fabf22",
              color: "#042954",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {admission.patientName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
              {admission.patientName}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {admission.gender} · {admission.age} yrs
            </div>
          </div>
        </div>

        {/* Already added services */}
        {cartServices.length > 0 && (
          <div
            style={{
              padding: "14px 20px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#aaa",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              Already Added ({cartServices.length})
            </div>
            {cartServices.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #fafafa",
                }}
              >
                <span
                  style={{ fontSize: 13, color: "#042954", fontWeight: 500 }}
                >
                  {item.serviceName || item.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>
                    ×{item.quantity}
                  </Tag>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveService(item)}
                    style={{ padding: 0 }}
                  />
                </div>
              </div>
            ))}
            <div style={{ height: 14 }} />
          </div>
        )}

        {/* Service selector */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#042954",
                marginBottom: 8,
              }}
            >
              Select Service
            </label>
            <Select
              showSearch
              placeholder="Search and select a service..."
              value={selectedService}
              onChange={setSelectedService}
              style={{ width: "100%" }}
              size="large"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={services
                .filter(
                  (s) =>
                    !cartServices.find((c) => (c.serviceId || c._id) === s._id),
                )
                .map((s) => ({
                  value: s._id,
                  label: s.serviceName,
                  rate: s.rate,
                }))}
              optionRender={(option) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{option.label}</span>
                  {option.data.rate && (
                    <span style={{ fontSize: 12, color: "#888" }}>
                      ₹{option.data.rate}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#042954",
                marginBottom: 8,
              }}
            >
              Quantity
            </label>
            <InputNumber
              min={1}
              max={999}
              value={quantity}
              onChange={setQuantity}
              size="large"
              style={{ width: "100%", borderRadius: 8 }}
            />
          </div>

          {/* Preview card */}
          {selectedService &&
            (() => {
              const svc = services.find((s) => s._id === selectedService);
              return svc ? (
                <div
                  style={{
                    backgroundColor: "#f6f9ff",
                    border: "1px solid #d0e0ff",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Preview
                  </div>
                  <div
                    style={{ fontWeight: 700, color: "#042954", fontSize: 15 }}
                  >
                    {svc.serviceName}
                  </div>
                  {svc.description && (
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {svc.description}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#888" }}>
                      Qty: {quantity}
                    </span>
                    {svc.rate && (
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#042954",
                        }}
                      >
                        ₹{(svc.rate * quantity).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              ) : null;
            })()}

          <Button
            type="primary"
            block
            size="large"
            loading={addLoading}
            onClick={handleAddService}
            disabled={!selectedService}
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "#042954",
              borderColor: "#042954",
              borderRadius: 10,
              fontWeight: 700,
              height: 48,
              fontSize: 15,
            }}
          >
            Add to Admission
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default AdmissionDetailPage;
