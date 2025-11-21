import React, { useState } from "react";

export function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- DUMMY DATA FOR VISUALIZATION ---
  const [users] = useState([
    { id: "1", name: "Alice Smith", email: "alice@example.com" },
    { id: "2", name: "Bob Johnson", email: "bob@example.com" },
  ]);
  const [pets] = useState([
    { id: "a", name: "Bella", species: "Dog", breed: "Labrador", ownerId: "1" },
    {
      id: "b",
      name: "Charlie",
      species: "Cat",
      breed: "Siamese",
      ownerId: "1",
    },
    { id: "c", name: "Daisy", species: "Dog", breed: "Beagle", ownerId: "2" },
    { id: "d", name: "Max", species: "Bird", breed: "Parakeet", ownerId: "2" },
  ]);
  const [services] = useState([
    { id: "s1", name: "General Checkup" },
    { id: "s2", name: "Vaccination" },
  ]);
  // --- /DUMMY DATA ---

  const [totalRevenue] = useState(0);
  const [pendingRevenue] = useState(0);
  const [appointment] = useState([]);
  // const [users] = useState([]);
  // const [pets] = useState([]);
  const [invoices] = useState([]);
  const [todayAppointments] = useState(0);
  const [activeUsers] = useState(0);
  const [totalPets] = useState(0);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    clientId: "",
    petId: "",
    service: "",
    serviceIds: [],
    selectedServiceIds: [],
    date: "",
    time: "",
    amount: "",
    status: "scheduled",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "dashboard-badge-paid";
      case "scheduled":
      case "active":
        return "dashboard-badge-active";
      case "pending":
        return "dashboard-badge-pending";
      case "cancelled":
      case "inactive":
        return "dashboard-badge-inactive";
      default:
        return "dashboard-badge-unknown";
    }
  };

  const [appointments, setAppointments] = useState([]); // Should be at AdminDashboard level
  const [searchTerm, setSearchTerm] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");

  function getFilteredAppointments() {
    return appointments.filter((apt) => {
      const statusMatch =
        appointmentFilter === "all" || apt.status === appointmentFilter;
      const searchMatch =
        searchTerm === "" ||
        [apt.clientName, apt.petName, apt.service, apt.date]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }

  function updateAppointmentStatus(id, status) {
    setAppointments((apps) =>
      apps.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  }

  function getScheduleStatusColor(status) {
    switch (status) {
      case "scheduled":
        return "appointments-status-scheduled";
      case "completed":
        return "appointments-status-completed";
      case "cancelled":
        return "appointments-status-cancelled";
      case "no-show":
        return "appointments-status-noshow";
      default:
        return "";
    }
  }

  // Placeholder editing/deleting
  function handleEditAppointment(apt) {
    window.alert(`TODO: Edit appointment ${apt.id}`);
  }

  function handleDeleteClick(type, id, label) {
    if (window.confirm(`Really delete ${label}?`)) {
      setAppointments((apps) => apps.filter((a) => a.id !== id));
    }
  }

  // Helper: Get active clients (all users for now)
  function getActiveClients() {
    return users;
  }

  // Helper: List pets for a given client
  function getClientPets(clientId) {
    return pets.filter((p) => p.ownerId === clientId);
  }

  function calculateTotalAmount(serviceIds) {
    return serviceIds
      .map((id) => {
        // you can expand dummy data to include prices if you want
        if (id === "s1") return 50;
        if (id === "s2") return 100;
        return 0;
      })
      .reduce((sum, n) => sum + n, 0);
  }

  function handleServiceToggle(serviceId) {
    const currentServices = appointmentForm.selectedServiceIds || [];
    let updatedServices;

    if (currentServices.includes(serviceId)) {
      updatedServices = currentServices.filter((id) => id !== serviceId);
    } else {
      updatedServices = [...currentServices, serviceId];
    }

    // Calculate new total
    const totalAmount = calculateTotalAmount(updatedServices);

    // Update service names for display
    const serviceNames = updatedServices
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    setAppointmentForm({
      ...appointmentForm,
      selectedServiceIds: updatedServices,
      serviceIds: updatedServices,
      service: serviceNames,
      amount: totalAmount.toString(), // or String(totalAmount)
    });
  }

  // Open the dialog (either new or edit)
  function openAppointmentDialog(appointment = null) {
    setEditingAppointment(appointment);
    if (appointment) {
      setAppointmentForm({
        ...appointment,
        amount: appointment.amount.toString(), // Ensure amount is string for input value
        selectedServiceIds: appointment.serviceIds || [],
      });
    } else {
      setAppointmentForm({
        clientId: "",
        clientName: "",
        petId: "",
        petName: "",
        service: "",
        serviceIds: [],
        date: "",
        time: "",
        status: "scheduled",
        amount: "",
      });
    }
    setAppointmentDialogOpen(true);
  }

  // Handler for dialog submit
  function handleAppointmentSubmit(e) {
    e.preventDefault();
    if (
      !appointmentForm.clientId ||
      !appointmentForm.petId ||
      !appointmentForm.date ||
      !appointmentForm.time
    )
      return alert("Please fill out all fields.");

    // Find client and pet details to populate names (since those are in the AdminAppointment type)
    const client = users.find((u) => u.id === appointmentForm.clientId) || {};
    const pet = pets.find((p) => p.id === appointmentForm.petId) || {};

    // Construct new or updated appointment object matching the intended interface
    const newAppointment = {
      id: editingAppointment ? editingAppointment.id : Date.now().toString(),
      clientId: appointmentForm.clientId,
      clientName: client.name || "",
      petId: appointmentForm.petId,
      petName: pet.name || "",
      service: appointmentForm.service,
      serviceIds: Array.isArray(appointmentForm.serviceIds)
        ? appointmentForm.serviceIds
        : [],
      date: appointmentForm.date,
      time: appointmentForm.time,
      status: appointmentForm.status,
      amount: parseFloat(appointmentForm.amount) || 0,
    };

    if (editingAppointment) {
      setAppointments((old) =>
        old.map((apt) =>
          apt.id === editingAppointment.id ? newAppointment : apt
        )
      );
    } else {
      setAppointments((old) => [...old, newAppointment]);
    }
    setAppointmentDialogOpen(false);
    setEditingAppointment(null);
  }

  function handleDeleteConfirm() {
    if (deleteItem && deleteItem.type === "appointment") {
      setAppointments((apps) => apps.filter((a) => a.id !== deleteItem.id));
    }
    // Add additional type checks here for other entity types as needed.
    setDeleteDialogOpen(false);
    setDeleteItem(null);
  }

  return (
    <div className="admin-bg">
      {/* Admin Navigation */}
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-navbar-content">
            <div className="admin-navbar-brand">
              <h1 className="admin-navbar-title">Welcome OK Clinic Admin</h1>
            </div>
            <button className="admin-logout-btn" onClick={onLogout}>
              <span className="admin-logout-icon" style={{ marginRight: 8 }}>
                ⏻
              </span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-main">
        <div className="admin-tabs-list">
          <button
            className={
              activeTab === "dashboard" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={
              activeTab === "appointments" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("appointments")}
          >
            Appointments
          </button>
          <button
            className={activeTab === "pets" ? "admin-tab active" : "admin-tab"}
            onClick={() => setActiveTab("pets")}
          >
            Pet Patients
          </button>
          <button
            className={
              activeTab === "clients" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("clients")}
          >
            Clients
          </button>
          <button
            className={
              activeTab === "invoices" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("invoices")}
          >
            Invoices
          </button>
          <button
            className={
              activeTab === "services" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("services")}
          >
            Services
          </button>
          <button
            className={
              activeTab === "feedback" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("feedback")}
          >
            Feedback
          </button>
        </div>
        {/* Add content below depending on activeTab */}

        {activeTab === "dashboard" && (
          <div className="dashboard-space">
            <div>
              <h2 className="dashboard-section-title">Dashboard Overview</h2>
              <p className="dashboard-muted">Quick stats and insights</p>
            </div>

            {/* Metrics cards */}
            <div className="dashboard-card-grid">
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <span className="dashboard-muted">Total Revenue</span>
                  <span className="dashboard-metric-icon" title="Total Revenue">
                    $
                  </span>
                </div>
                <div className="dashboard-card-content">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="dashboard-muted">+12.5% from last month</div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <span className="dashboard-muted">Pending Revenue</span>
                  <span
                    className="dashboard-metric-icon"
                    title="Pending Revenue"
                  >
                    🕒
                  </span>
                </div>
                <div className="dashboard-card-content">
                  ${pendingRevenue.toFixed(2)}
                </div>
                <div className="dashboard-muted">
                  {invoices.filter((i) => i.status !== "paid").length} unpaid
                  invoices
                </div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <span className="dashboard-muted">Today's Appointments</span>
                  <span
                    className="dashboard-metric-icon"
                    title="Today's Appointments"
                  >
                    📅
                  </span>
                </div>
                <div className="dashboard-card-content">
                  {todayAppointments}
                </div>
                <div className="dashboard-muted">
                  {appointments.filter((a) => a.status === "scheduled").length}{" "}
                  scheduled total
                </div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <span className="dashboard-muted">Active Clients</span>
                  <span
                    className="dashboard-metric-icon"
                    title="Active Clients"
                  >
                    👥
                  </span>
                </div>
                <div className="dashboard-card-content">{activeUsers}</div>
                <div className="dashboard-muted">
                  {users.length} total clients
                </div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <span className="dashboard-muted">Pet Patients</span>
                  <span className="dashboard-metric-icon" title="Pet Patients">
                    🐾
                  </span>
                </div>
                <div className="dashboard-card-content">{totalPets}</div>
                <div className="dashboard-muted">{pets.length} total pets</div>
              </div>
            </div>

            {/* Recent Appointments and Pet Visits */}
            <div className="dashboard-list-grid">
              <div className="dashboard-list-card">
                <div className="dashboard-card-header">
                  <div>
                    <div className="dashboard-section-title">
                      Recent Appointments
                    </div>
                    <div className="dashboard-muted">
                      Latest scheduled appointments
                    </div>
                  </div>
                </div>
                <div className="dashboard-list-content">
                  {appointments.length === 0 && (
                    <div className="dashboard-muted">
                      No recent appointments.
                    </div>
                  )}
                  <ul className="dashboard-list">
                    {appointments.slice(0, 5).map((apt) => (
                      <li key={apt.id} className="dashboard-list-item">
                        <div>
                          <div>
                            {apt.clientName} - {apt.petName}
                          </div>
                          <div className="dashboard-muted">{apt.service}</div>
                          <div className="dashboard-muted">
                            {apt.date} at {apt.time}
                          </div>
                        </div>
                        <span className={getStatusColor(apt.status)}>
                          {apt.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="dashboard-list-card">
                <div className="dashboard-card-header">
                  <div>
                    <div className="dashboard-section-title">
                      Recent Pet Visits
                    </div>
                    <div className="dashboard-muted">
                      Latest pet patient visits
                    </div>
                  </div>
                </div>
                <div className="dashboard-list-content">
                  {pets.length === 0 && (
                    <div className="dashboard-muted">No pet visits yet.</div>
                  )}
                  <ul className="dashboard-list">
                    {pets.slice(0, 5).map((pet) => (
                      <li key={pet.id} className="dashboard-list-item">
                        <div>
                          <div>
                            {pet.name} - {pet.species}
                          </div>
                          <div className="dashboard-muted">
                            Owner: {pet.ownerName}
                          </div>
                          <div className="dashboard-muted">
                            Last visit:{" "}
                            {pet.lastVisit
                              ? new Date(pet.lastVisit).toLocaleDateString()
                              : ""}
                          </div>
                        </div>
                        <span className={getStatusColor(pet.status)}>
                          {pet.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="appointments-space">
            <div className="appointments-header-row">
              <div>
                <h2 className="appointments-title">Appointments Management</h2>
                <p className="appointments-muted">
                  View and manage all appointments
                </p>
              </div>
              <button
                className="appointments-btn add"
                onClick={() => openAppointmentDialog()}
              >
                <span className="appointments-btn-icon">📅</span>
                New Appointment
              </button>
            </div>

            <div className="appointments-controls">
              <div className="appointments-search-wrap">
                <span className="appointments-search-icon">&#128269;</span>
                <input
                  className="appointments-search"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="appointments-filter"
                value={appointmentFilter}
                onChange={(e) => setAppointmentFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
              <button
                className="appointments-btn outline"
                onClick={() => {
                  // Export logic to CSV
                  window.alert("TODO: Implement export to CSV");
                }}
              >
                <span className="appointments-btn-icon">⬇️</span>
                Export
              </button>
            </div>

            <div className="appointments-table-wrapper">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Pet</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAppointments().map((apt) => (
                    <tr key={apt.id}>
                      <td>{apt.clientName}</td>
                      <td>{apt.petName}</td>
                      <td>{apt.service}</td>
                      <td>
                        {apt.date} {apt.time}
                      </td>
                      <td>${parseFloat(apt.amount).toFixed(2)}</td>
                      <td>
                        <select
                          className={`appointments-status-select ${getScheduleStatusColor(
                            apt.status
                          )}`}
                          value={apt.status}
                          onChange={(e) =>
                            updateAppointmentStatus(apt.id, e.target.value)
                          }
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No Show</option>
                        </select>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                          }}
                        >
                          <button
                            className="appointments-btn ghost"
                            onClick={() => openAppointmentDialog(apt)}
                            title="Edit"
                          >
                            🖉
                          </button>
                          <button
                            className="appointments-btn ghost"
                            onClick={() => {
                              setDeleteItem({
                                id: apt.id,
                                name: `${apt.clientName} - ${apt.petName}`,
                                type: "appointment",
                              });
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredAppointments().length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "1em 0",
                        }}
                      >
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointment Tab Dialog */}
        {appointmentDialogOpen && (
          <div className="dialog-backdrop">
            <div className="dialog-content">
              <form onSubmit={handleAppointmentSubmit}>
                <div className="dialog-header">
                  <h3>
                    {editingAppointment
                      ? "Edit Appointment"
                      : "New Appointment"}
                  </h3>
                  <p>
                    {editingAppointment
                      ? "Update appointment details below"
                      : "Create a new appointment for a client"}
                  </p>
                </div>
                <div className="dialog-body">
                  <div className="dialog-field">
                    <label>Select Client</label>
                    <select
                      value={appointmentForm.clientId}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          clientId: e.target.value,
                          petId: "",
                        })
                      }
                    >
                      <option value="">Choose a client</option>
                      {getActiveClients().map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {appointmentForm.clientId && (
                    <div className="dialog-field">
                      <label>Select Pet</label>
                      <select
                        value={appointmentForm.petId}
                        onChange={(e) =>
                          setAppointmentForm({
                            ...appointmentForm,
                            petId: e.target.value,
                          })
                        }
                      >
                        <option value="">Choose a pet</option>
                        {getClientPets(appointmentForm.clientId).map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name} - {pet.species} ({pet.breed})
                          </option>
                        ))}
                      </select>
                      {getClientPets(appointmentForm.clientId).length === 0 && (
                        <p className="appointments-muted">
                          No pets registered for this client
                        </p>
                      )}
                    </div>
                  )}

                  <div className="dialog-field">
                    <label>Services</label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {services.map((service) => (
                        <label
                          key={service.id}
                          style={{ fontWeight: "normal" }}
                        >
                          <input
                            type="checkbox"
                            checked={appointmentForm.selectedServiceIds?.includes(
                              service.id
                            )}
                            onChange={() => handleServiceToggle(service.id)}
                            style={{
                              marginRight: "6px",
                              verticalAlign: "middle",
                            }}
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="dialog-row">
                    <div className="dialog-field">
                      <label>Date</label>
                      <input
                        type="date"
                        value={appointmentForm.date}
                        onChange={(e) =>
                          setAppointmentForm({
                            ...appointmentForm,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Time</label>
                      <input
                        type="time"
                        value={appointmentForm.time}
                        onChange={(e) =>
                          setAppointmentForm({
                            ...appointmentForm,
                            time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Availability check */}
                  {appointmentForm.date &&
                    appointmentForm.time &&
                    (() => {
                      const isSlotTaken = appointments.some(
                        (apt) =>
                          apt.date === appointmentForm.date &&
                          apt.time === appointmentForm.time &&
                          apt.status !== "cancelled" &&
                          apt.status !== "no-show" &&
                          (!editingAppointment ||
                            apt.id !== editingAppointment.id)
                      );
                      const appointmentsOnDate = appointments.filter(
                        (apt) =>
                          apt.date === appointmentForm.date &&
                          apt.status !== "cancelled" &&
                          apt.status !== "no-show"
                      ).length;
                      return (
                        <div className="dialog-avail">
                          {isSlotTaken ? (
                            <div className="dialog-avail-blocked">
                              <span className="dialog-dot blocked"></span>
                              This time slot is already booked
                            </div>
                          ) : (
                            <div className="dialog-avail-open">
                              <span className="dialog-dot open"></span>
                              This time slot is available
                            </div>
                          )}
                          <div
                            className="appointments-muted"
                            style={{ fontSize: 13 }}
                          >
                            {appointmentsOnDate} appointment(s) scheduled for
                            this date
                          </div>
                        </div>
                      );
                    })()}

                  <div className="dialog-field">
                    <label>Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={appointmentForm.amount}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="dialog-field">
                    <label>Status</label>
                    <select
                      value={appointmentForm.status}
                      onChange={(e) =>
                        setAppointmentForm({
                          ...appointmentForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </div>
                </div>
                <div className="dialog-footer">
                  <button
                    type="button"
                    className="appointments-btn outline"
                    onClick={() => setAppointmentDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="appointments-btn add">
                    {editingAppointment ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteDialogOpen && (
          <div className="dialog-backdrop">
            <div className="dialog-content">
              <div className="dialog-header">
                <h3>Confirm Deletion</h3>
                <p>
                  Are you sure you want to delete
                  <span className="dialog-item-name">{deleteItem?.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="dialog-footer">
                <button
                  type="button"
                  className="appointments-btn outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="appointments-btn destructive"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
