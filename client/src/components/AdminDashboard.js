import React, { useState } from "react";

export function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- DUMMY DATA FOR VISUALIZATION ---
  const [users] = useState([
    { id: "1", name: "Alice Smith", email: "alice@example.com" },
    { id: "2", name: "Bob Johnson", email: "bob@example.com" },
  ]);
  const [pets, setPets] = useState([
    { id: "a", name: "Bella", species: "Dog", breed: "Labrador", ownerId: "1" },
    {
      name: "Charlie",
      species: "Cat",
      breed: "Siamese",
      ownerId: "1",
    },
    { id: "c", name: "Daisy", species: "Dog", breed: "Beagle", ownerId: "2" },
    { id: "d", name: "Max", species: "Bird", breed: "Parakeet", ownerId: "2" },
  ]);

  // --- /DUMMY DATA ---

  const [totalRevenue] = useState(0);
  const [pendingRevenue] = useState(0);
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
    } else if (deleteItem.type === "pet") {
      setPets((current) => current.filter((pet) => pet.id !== deleteItem.id));
    } else if (deleteItem.type === "client") {
      setClients((current) =>
        current.filter((user) => user.id !== deleteItem.id)
      );
    } else if (deleteItem.type === "invoice") {
      setInvoices((current) =>
        current.filter((inv) => inv.id !== deleteItem.id)
      );
    } else if (deleteItem.type === "service") {
      setServices((current) => current.filter((s) => s.id !== deleteItem.id));
    }
    // Add additional type checks here for other entity types as needed.
    setDeleteDialogOpen(false);
    setDeleteItem(null);
  }

  // Pet Patients
  // Search & filter state for Pets
  const [petSearchTerm, setPetSearchTerm] = useState("");
  const [petFilter, setPetFilter] = useState("all");

  // For add/edit dialog
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petForm, setPetForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    ownerId: "",
    medicalNotes: "",
    status: "active",
    lastVisit: new Date().toISOString().slice(0, 10), // today as default
  });

  // CRUD: Get matching user for owner lookup
  function getOwnerName(ownerId) {
    const owner = users.find((u) => u.id === ownerId);
    return owner ? owner.name : "";
  }

  // PET FILTERING
  function getFilteredPets() {
    return pets.filter((pet) => {
      const filterMatch =
        petFilter === "all" || pet.species.toLowerCase() === petFilter;
      const searchMatch =
        petSearchTerm === "" ||
        [pet.name, pet.breed, pet.species, getOwnerName(pet.ownerId)]
          .join(" ")
          .toLowerCase()
          .includes(petSearchTerm.toLowerCase());
      return filterMatch && searchMatch;
    });
  }

  // PET STATUS UPDATE
  function updatePetStatus(petId, status) {
    setPets((current) =>
      current.map((pet) => (pet.id === petId ? { ...pet, status } : pet))
    );
  }

  // PET EDIT
  function handleEditPet(pet) {
    setEditingPet(pet);
    setPetForm({ ...pet });
    setPetDialogOpen(true);
  }

  // PET ADD/UPDATE SUBMIT
  function handlePetFormSubmit(e) {
    e.preventDefault();
    if (!petForm.name || !petForm.species || !petForm.ownerId) {
      alert("Please fill out required fields.");
      return;
    }
    if (editingPet) {
      setPets((current) =>
        current.map((p) =>
          p.id === editingPet.id ? { ...petForm, id: editingPet.id } : p
        )
      );
    } else {
      setPets((current) => [
        ...current,
        {
          ...petForm,
          id: Date.now().toString(),
          lastVisit: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setEditingPet(null);
    setPetDialogOpen(false);
    setPetForm({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      ownerId: "",
      medicalNotes: "",
      status: "active",
      lastVisit: new Date().toISOString().slice(0, 10),
    });
  }

  // PET START ADD
  function openPetDialog() {
    setEditingPet(null);
    setPetForm({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      ownerId: "",
      medicalNotes: "",
      status: "active",
      lastVisit: new Date().toISOString().slice(0, 10),
    });
    setPetDialogOpen(true);
  }

  // PET DELETE (use existing deleteDialogOpen, deleteItem pattern)
  function requestDeletePet(pet) {
    setDeleteItem({
      id: pet.id,
      name: pet.name,
      type: "pet",
    });
    setDeleteDialogOpen(true);
  }

  // State for Clients Tab
  const [clients, setClients] = useState([
    {
      id: "1",
      name: "Alice Smith",
      email: "alice@example.com",
      phone: "555-1234",
      totalSpent: 230.5,
      joinDate: "2023-11-11",
      status: "active",
    },
    {
      id: "2",
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "555-5678",
      totalSpent: 120.0,
      joinDate: "2024-01-20",
      status: "inactive",
    },
  ]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
  });
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");

  // Filter and search
  function getFilteredClients() {
    return clients.filter((user) => {
      const statusMatch =
        clientFilter === "all" || user.status === clientFilter;
      const searchMatch =
        clientSearchTerm === "" ||
        [user.name, user.email, user.phone]
          .join(" ")
          .toLowerCase()
          .includes(clientSearchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }
  function updateClientStatus(userId, status) {
    setClients((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user))
    );
  }
  function handleEditClient(user) {
    setEditingClient(user);
    setClientForm({ ...user });
    setClientDialogOpen(true);
  }
  function handleClientFormSubmit(e) {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email || !clientForm.phone) {
      alert("Please fill out all fields.");
      return;
    }
    if (editingClient) {
      setClients((current) =>
        current.map((c) =>
          c.id === editingClient.id
            ? {
                ...clientForm,
                id: editingClient.id,
                totalSpent: c.totalSpent,
                joinDate: c.joinDate,
              }
            : c
        )
      );
    } else {
      setClients((current) => [
        ...current,
        {
          ...clientForm,
          id: Date.now().toString(),
          totalSpent: 0,
          joinDate: new Date().toISOString(),
        },
      ]);
    }
    setEditingClient(null);
    setClientDialogOpen(false);
    setClientForm({ name: "", email: "", phone: "", status: "active" });
  }
  // For delete, use your delete dialog pattern
  function requestDeleteClient(user) {
    setDeleteItem({ id: user.id, name: user.name, type: "client" });
    setDeleteDialogOpen(true);
  }

  // Invoice Tab

  const [invoices, setInvoices] = useState([
    {
      id: "i1",
      invoiceNumber: "INV-10001",
      clientId: "1",
      clientName: "Alice Smith",
      date: "2025-11-12",
      dueDate: "2025-12-12",
      amount: 150,
      status: "pending",
    },
    {
      id: "i2",
      invoiceNumber: "INV-10002",
      clientId: "2",
      clientName: "Bob Johnson",
      date: "2025-11-10",
      dueDate: "2025-11-20",
      amount: 200,
      status: "paid",
    },
  ]);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "",
    amount: "",
    status: "pending",
    date: "",
    dueDate: "",
  });
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("all");

  // Filter/search
  function getFilteredInvoices() {
    return invoices.filter((inv) => {
      const statusMatch =
        invoiceFilter === "all" || inv.status === invoiceFilter;
      const searchMatch =
        invoiceSearchTerm === "" ||
        [inv.invoiceNumber, inv.clientName]
          .join(" ")
          .toLowerCase()
          .includes(invoiceSearchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }
  function updateInvoiceStatus(invoiceId, status) {
    setInvoices((current) =>
      current.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv))
    );
  }
  function handleEditInvoice(inv) {
    setEditingInvoice(inv);
    setInvoiceForm({ ...inv, amount: inv.amount.toString() });
    setInvoiceDialogOpen(true);
  }
  function handleInvoiceFormSubmit(e) {
    e.preventDefault();
    if (
      !invoiceForm.clientId ||
      !invoiceForm.amount ||
      !invoiceForm.date ||
      !invoiceForm.dueDate
    ) {
      alert("Please fill out all fields.");
      return;
    }
    const client = users.find((u) => u.id === invoiceForm.clientId);
    if (editingInvoice) {
      setInvoices((current) =>
        current.map((inv) =>
          inv.id === editingInvoice.id
            ? {
                ...invoiceForm,
                id: editingInvoice.id,
                invoiceNumber: editingInvoice.invoiceNumber,
                clientName: client?.name || "",
                amount: parseFloat(invoiceForm.amount),
              }
            : inv
        )
      );
    } else {
      setInvoices((current) => [
        ...current,
        {
          ...invoiceForm,
          id: Date.now().toString(),
          invoiceNumber: "INV-" + Math.floor(Math.random() * 100000),
          clientName: client?.name || "",
          amount: parseFloat(invoiceForm.amount),
        },
      ]);
    }
    setEditingInvoice(null);
    setInvoiceDialogOpen(false);
    setInvoiceForm({
      clientId: "",
      amount: "",
      status: "pending",
      date: "",
      dueDate: "",
    });
  }
  function requestDeleteInvoice(inv) {
    setDeleteItem({ id: inv.id, name: inv.invoiceNumber, type: "invoice" });
    setDeleteDialogOpen(true);
  }

  // Services Tab
  const [services, setServices] = useState([
    {
      id: "s1",
      name: "General Checkup",
      category: "wellness",
      price: 50,
      duration: "30",
      status: "active",
    },
    {
      id: "s2",
      name: "Vaccination",
      category: "wellness",
      price: 100,
      duration: "20",
      status: "active",
    },
    {
      id: "s3",
      name: "Dental Cleaning",
      category: "dental",
      price: 220,
      duration: "60",
      status: "inactive",
    },
  ]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    price: "",
    duration: "",
    status: "active",
  });
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Filtering
  function getFilteredServices() {
    return services.filter((service) => {
      const filterMatch =
        serviceFilter === "all" || service.category === serviceFilter;
      const searchMatch =
        serviceSearchTerm === "" ||
        [service.name, service.category]
          .join(" ")
          .toLowerCase()
          .includes(serviceSearchTerm.toLowerCase());
      return filterMatch && searchMatch;
    });
  }
  function updateServiceStatus(serviceId, status) {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId ? { ...service, status } : service
      )
    );
  }
  function handleEditService(service) {
    setEditingService(service);
    setServiceForm({ ...service, price: service.price.toString() });
    setServiceDialogOpen(true);
  }
  function handleServiceFormSubmit(e) {
    e.preventDefault();
    if (
      !serviceForm.name ||
      !serviceForm.category ||
      !serviceForm.price ||
      !serviceForm.duration
    ) {
      alert("Please fill out all fields.");
      return;
    }
    if (editingService) {
      setServices((current) =>
        current.map((s) =>
          s.id === editingService.id
            ? {
                ...serviceForm,
                id: editingService.id,
                price: parseFloat(serviceForm.price),
              }
            : s
        )
      );
    } else {
      setServices((current) => [
        ...current,
        {
          ...serviceForm,
          id: Date.now().toString(),
          price: parseFloat(serviceForm.price),
        },
      ]);
    }
    setEditingService(null);
    setServiceDialogOpen(false);
    setServiceForm({
      name: "",
      category: "",
      price: "",
      duration: "",
      status: "active",
    });
  }
  function requestDeleteService(service) {
    setDeleteItem({ id: service.id, name: service.name, type: "service" });
    setDeleteDialogOpen(true);
  }

  // Feedback Tab
  const [feedbacks] = useState([
    {
      id: "f1",
      userName: "Alice Smith",
      userEmail: "alice@example.com",
      category: "wellness",
      subject: "Great service!",
      rating: 5,
      message: "The vet was fantastic and really cared for Bella.",
      status: "new",
      submittedAt: "2025-11-21",
    },
    {
      id: "f2",
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      category: "grooming",
      subject: "Friendly staff",
      rating: 4,
      message: "Booking was easy and Max looks great.",
      status: "reviewed",
      submittedAt: "2025-11-20",
    },
  ]);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("all");

  function getFilteredFeedbacks() {
    return feedbacks.filter((fb) => {
      const statusMatch =
        feedbackFilter === "all" || fb.status === feedbackFilter;
      const searchMatch =
        feedbackSearchTerm === "" ||
        [fb.userName, fb.userEmail, fb.subject, fb.category, fb.message]
          .join(" ")
          .toLowerCase()
          .includes(feedbackSearchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }

  function requestDeleteFeedback(feedback) {
    setDeleteItem({
      id: feedback.id,
      name: feedback.subject,
      type: "feedback",
    });
    setDeleteDialogOpen(true);
  }

  // MAIN FRONTEND CODE - HTML COMPONENTS
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
                            Owner: {getOwnerName(pet.ownerId)}
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
                          className={`appointments-status-select appointments-status-${apt.status}`}
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

        {activeTab === "pets" && (
          <div className="pets-space">
            <div className="pets-header-row">
              <div>
                <h2 className="pets-title">Pet Patients Management</h2>
                <p className="pets-muted">View and manage all pet patients</p>
              </div>
              <button className="pets-btn add" onClick={openPetDialog}>
                <span className="pets-btn-icon" role="img" aria-label="paw">
                  &#128062;
                </span>
                Add Pet
              </button>
            </div>
            <div className="pets-controls">
              <div className="pets-search-wrap">
                <span className="pets-search-icon">&#128269;</span>
                <input
                  className="pets-search"
                  placeholder="Search pets..."
                  value={petSearchTerm}
                  onChange={(e) => setPetSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="pets-filter"
                value={petFilter}
                onChange={(e) => setPetFilter(e.target.value)}
              >
                <option value="all">All Species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
              </select>
              <button
                className="pets-btn outline"
                onClick={() => window.alert("TODO: Export pets to CSV")}
              >
                <span className="pets-btn-icon">⬇️</span>
                Export
              </button>
            </div>
            <div className="pets-table-wrapper">
              <table className="pets-table">
                <thead>
                  <tr>
                    <th>Pet Name</th>
                    <th>Species</th>
                    <th>Breed</th>
                    <th>Age</th>
                    <th>Weight (lbs)</th>
                    <th>Owner</th>

                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPets().map((pet) => (
                    <tr key={pet.id}>
                      <td>{pet.name}</td>
                      <td>{pet.species}</td>
                      <td>{pet.breed}</td>
                      <td>{pet.age} yrs</td>
                      <td>{pet.weight}</td>
                      <td>{getOwnerName(pet.ownerId)}</td>
                      {/* <td>
                        {pet.lastVisit
                          ? new Date(pet.lastVisit).toLocaleDateString()
                          : ""}
                      </td> */}
                      <td>
                        <select
                          className={`pet-status-select pet-status-${pet.status}`}
                          value={pet.status}
                          onChange={(e) =>
                            updatePetStatus(pet.id, e.target.value)
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
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
                            className="pets-btn ghost"
                            onClick={() => handleEditPet(pet)}
                            title="Edit"
                          >
                            🖉
                          </button>
                          <button
                            className="pets-btn ghost"
                            onClick={() => requestDeletePet(pet)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredPets().length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "1em 0",
                        }}
                      >
                        No pets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pet Add/Edit Dialog */}
        {petDialogOpen && (
          <div className="dialog-backdrop">
            <div className="dialog-content">
              <form onSubmit={handlePetFormSubmit}>
                <div className="dialog-header">
                  <h3>{editingPet ? "Edit Pet" : "Add Pet"}</h3>
                  <p>
                    {editingPet
                      ? "Update pet details below"
                      : "Register a new pet patient"}
                  </p>
                </div>
                <div className="dialog-body">
                  <div className="dialog-field">
                    <label>Pet Name*</label>
                    <input
                      value={petForm.name}
                      onChange={(e) =>
                        setPetForm({ ...petForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="dialog-field">
                    <label>Species*</label>
                    <select
                      value={petForm.species}
                      onChange={(e) =>
                        setPetForm({ ...petForm, species: e.target.value })
                      }
                      required
                    >
                      <option value="">Select species</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                    </select>
                  </div>
                  <div className="dialog-field">
                    <label>Breed</label>
                    <input
                      value={petForm.breed}
                      onChange={(e) =>
                        setPetForm({ ...petForm, breed: e.target.value })
                      }
                    />
                  </div>
                  <div className="dialog-row">
                    <div className="dialog-field">
                      <label>Age</label>
                      <input
                        type="number"
                        min="0"
                        value={petForm.age}
                        onChange={(e) =>
                          setPetForm({ ...petForm, age: e.target.value })
                        }
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Weight (lbs)</label>
                      <input
                        type="number"
                        min="0"
                        value={petForm.weight}
                        onChange={(e) =>
                          setPetForm({ ...petForm, weight: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="dialog-field">
                    <label>Owner*</label>
                    <select
                      value={petForm.ownerId}
                      onChange={(e) =>
                        setPetForm({ ...petForm, ownerId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select owner</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} - {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dialog-field">
                    <label>Medical Notes</label>
                    <textarea
                      value={petForm.medicalNotes || ""}
                      onChange={(e) =>
                        setPetForm({ ...petForm, medicalNotes: e.target.value })
                      }
                    ></textarea>
                  </div>
                  <div className="dialog-field">
                    <label>Status</label>
                    <select
                      value={petForm.status}
                      onChange={(e) =>
                        setPetForm({ ...petForm, status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="dialog-footer">
                  <button
                    type="button"
                    className="pets-btn outline"
                    onClick={() => setPetDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="pets-btn add">
                    {editingPet ? "Update" : "Create"}
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

        {/* Client Management Tab */}
        {activeTab === "clients" && (
          <div className="clients-space">
            <div className="clients-header-row">
              <div>
                <h2 className="clients-title">Client Management</h2>
                <p className="clients-muted">View and manage all clients</p>
              </div>
              <button
                className="clients-btn add"
                onClick={() => {
                  setEditingClient(null);
                  setClientForm({
                    name: "",
                    email: "",
                    phone: "",
                    status: "active",
                  });
                  setClientDialogOpen(true);
                }}
              >
                <span
                  className="clients-btn-icon"
                  role="img"
                  aria-label="users"
                >
                  👥
                </span>
                Add Client
              </button>
            </div>
            <div className="clients-controls">
              <div className="clients-search-wrap">
                <span className="clients-search-icon">&#128269;</span>
                <input
                  className="clients-search"
                  placeholder="Search clients..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="clients-filter"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                className="clients-btn outline"
                onClick={() => window.alert("TODO: Export clients to CSV")}
              >
                <span className="clients-btn-icon">⬇️</span>
                Export
              </button>
            </div>
            <div className="clients-table-wrapper">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Total Spent</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredClients().map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>${user.totalSpent.toFixed(2)}</td>
                      <td>
                        {user.joinDate
                          ? new Date(user.joinDate).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        <select
                          className={`client-status-select client-status-${user.status}`}
                          value={user.status}
                          onChange={(e) =>
                            updateClientStatus(user.id, e.target.value)
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
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
                            className="clients-btn ghost"
                            onClick={() => handleEditClient(user)}
                            title="Edit"
                          >
                            🖉
                          </button>
                          <button
                            className="clients-btn ghost"
                            onClick={() => requestDeleteClient(user)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredClients().length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "1em 0",
                        }}
                      >
                        No clients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {clientDialogOpen && (
          <div className="dialog-backdrop">
            <div className="dialog-content">
              <form onSubmit={handleClientFormSubmit}>
                <div className="dialog-header">
                  <h3>{editingClient ? "Edit Client" : "Add Client"}</h3>
                  <p>
                    {editingClient
                      ? "Update client details below"
                      : "Register a new client"}
                  </p>
                </div>
                <div className="dialog-body">
                  <div className="dialog-field">
                    <label>Name*</label>
                    <input
                      value={clientForm.name}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="dialog-field">
                    <label>Email*</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="dialog-field">
                    <label>Phone*</label>
                    <input
                      value={clientForm.phone}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="dialog-field">
                    <label>Status</label>
                    <select
                      value={clientForm.status}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="dialog-footer">
                  <button
                    type="button"
                    className="clients-btn outline"
                    onClick={() => setClientDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="clients-btn add">
                    {editingClient ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="invoices-space">
            <div className="invoices-header-row">
              <div>
                <h2 className="invoices-title">Invoice Management</h2>
                <p className="invoices-muted">View and manage all invoices</p>
              </div>
              <button
                className="invoices-btn add"
                onClick={() => {
                  setEditingInvoice(null);
                  setInvoiceForm({
                    clientId: "",
                    amount: "",
                    status: "pending",
                    date: "",
                    dueDate: "",
                  });
                  setInvoiceDialogOpen(true);
                }}
              >
                <span
                  className="invoices-btn-icon"
                  role="img"
                  aria-label="file"
                >
                  📄
                </span>
                Create Invoice
              </button>
            </div>
            <div className="invoices-controls">
              <div className="invoices-search-wrap">
                <span className="invoices-search-icon">&#128269;</span>
                <input
                  className="invoices-search"
                  placeholder="Search invoices..."
                  value={invoiceSearchTerm}
                  onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="invoices-filter"
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <button
                className="invoices-btn outline"
                onClick={() => window.alert("TODO: Export invoices to CSV")}
              >
                <span className="invoices-btn-icon">⬇️</span>
                Export
              </button>
            </div>
            <div className="invoices-table-wrapper">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredInvoices().map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.clientName}</td>
                      <td>
                        {inv.date
                          ? new Date(inv.date).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString()
                          : ""}
                      </td>
                      <td>${inv.amount.toFixed(2)}</td>
                      <td>
                        <select
                          className={`invoice-status-select invoice-status-${inv.status}`}
                          value={inv.status}
                          onChange={(e) =>
                            updateInvoiceStatus(inv.id, e.target.value)
                          }
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="overdue">Overdue</option>
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
                            className="invoices-btn ghost"
                            onClick={() => handleEditInvoice(inv)}
                            title="Edit"
                          >
                            🖉
                          </button>
                          <button
                            className="invoices-btn ghost"
                            onClick={() => requestDeleteInvoice(inv)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredInvoices().length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "1em 0",
                        }}
                      >
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {invoiceDialogOpen && (
          <div className="dialog-backdrop">
            <div className="dialog-content">
              <form onSubmit={handleInvoiceFormSubmit}>
                <div className="dialog-header">
                  <h3>{editingInvoice ? "Edit Invoice" : "Create Invoice"}</h3>
                  <p>
                    {editingInvoice
                      ? "Update invoice details below"
                      : "Create a new client invoice"}
                  </p>
                </div>
                <div className="dialog-body">
                  <div className="dialog-field">
                    <label>Client*</label>
                    <select
                      value={invoiceForm.clientId}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          clientId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select client</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} - {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dialog-row">
                    <div className="dialog-field">
                      <label>Amount*</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoiceForm.amount}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            amount: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Date*</label>
                      <input
                        type="date"
                        value={invoiceForm.date}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Due Date*</label>
                      <input
                        type="date"
                        value={invoiceForm.dueDate}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            dueDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="dialog-field">
                    <label>Status</label>
                    <select
                      value={invoiceForm.status}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="dialog-footer">
                  <button
                    type="button"
                    className="invoices-btn outline"
                    onClick={() => setInvoiceDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="invoices-btn add">
                    {editingInvoice ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="services-space">
            <div className="services-header-row">
              <div>
                <h2 className="services-title">Services Management</h2>
                <p className="services-muted">
                  Manage available services and pricing
                </p>
              </div>
              <button
                className="services-btn add"
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({
                    name: "",
                    category: "",
                    price: "",
                    duration: "",
                    status: "active",
                  });
                  setServiceDialogOpen(true);
                }}
              >
                <span
                  className="services-btn-icon"
                  role="img"
                  aria-label="heart"
                >
                  💙
                </span>
                Add Service
              </button>
            </div>
            <div className="services-controls">
              <div className="services-search-wrap">
                <span className="services-search-icon">&#128269;</span>
                <input
                  className="services-search"
                  placeholder="Search services..."
                  value={serviceSearchTerm}
                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="services-filter"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="wellness">Wellness</option>
                <option value="dental">Dental</option>
                <option value="grooming">Grooming</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>
            <div className="services-table-wrapper">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Duration (min)</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredServices().map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>
                        {service.category.charAt(0).toUpperCase() +
                          service.category.slice(1)}
                      </td>
                      <td>${service.price.toFixed(2)}</td>
                      <td>{service.duration}</td>
                      <td>
                        <select
                          className={`service-status-select service-status-${service.status}`}
                          value={service.status}
                          onChange={(e) =>
                            updateServiceStatus(service.id, e.target.value)
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
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
                            className="services-btn ghost"
                            onClick={() => handleEditService(service)}
                            title="Edit"
                          >
                            🖉
                          </button>
                          <button
                            className="services-btn ghost"
                            onClick={() => requestDeleteService(service)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredServices().length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "1em 0",
                        }}
                      >
                        No services found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {serviceDialogOpen && (
          <div className="dialog-backdrop">
            <div className="dialog-content">
              <form onSubmit={handleServiceFormSubmit}>
                <div className="dialog-header">
                  <h3>{editingService ? "Edit Service" : "Add Service"}</h3>
                  <p>
                    {editingService
                      ? "Update service details below"
                      : "Register a new service"}
                  </p>
                </div>
                <div className="dialog-body">
                  <div className="dialog-field">
                    <label>Service Name*</label>
                    <input
                      value={serviceForm.name}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="dialog-field">
                    <label>Category*</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          category: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select category</option>
                      <option value="wellness">Wellness</option>
                      <option value="dental">Dental</option>
                      <option value="grooming">Grooming</option>
                      <option value="diagnostic">Diagnostic</option>
                      <option value="surgery">Surgery</option>
                    </select>
                  </div>
                  <div className="dialog-row">
                    <div className="dialog-field">
                      <label>Price*</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="dialog-field">
                      <label>Duration (min)*</label>
                      <input
                        type="number"
                        min="0"
                        value={serviceForm.duration}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            duration: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="dialog-field">
                    <label>Status</label>
                    <select
                      value={serviceForm.status}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="dialog-footer">
                  <button
                    type="button"
                    className="services-btn outline"
                    onClick={() => setServiceDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="services-btn add">
                    {editingService ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="feedback-space">
            <div className="feedback-header-row">
              <div>
                <h2 className="feedback-title">Customer Feedback</h2>
                <p className="feedback-muted">
                  View and manage customer feedback and reviews
                </p>
              </div>
            </div>
            <div className="feedback-controls">
              <div className="feedback-search-wrap">
                <span className="feedback-search-icon">&#128269;</span>
                <input
                  className="feedback-search"
                  placeholder="Search feedback..."
                  value={feedbackSearchTerm}
                  onChange={(e) => setFeedbackSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="feedback-filter"
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                className="feedback-btn outline"
                onClick={() => window.alert("TODO: Export feedback to CSV")}
              >
                <span className="feedback-btn-icon">⬇️</span>
                Export
              </button>
            </div>
            <div className="feedback-table-wrapper">
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Subject</th>
                    <th>Rating</th>
                    <th>Date</th>
                    {/* <th>Status</th> */}
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredFeedbacks().map((feedback) => (
                    <tr key={feedback.id}>
                      <td>
                        <div>
                          <p>{feedback.userName}</p>
                          <p className="feedback-muted">{feedback.userEmail}</p>
                        </div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>
                        {feedback.category.replace("-", " ")}
                      </td>
                      <td>{feedback.subject}</td>
                      <td>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({ length: feedback.rating }).map(
                            (_, i) => (
                              <span key={i} className="star">
                                &#9733;
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td>
                        {feedback.submittedAt
                          ? new Date(feedback.submittedAt).toLocaleDateString()
                          : ""}
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
                            className="feedback-btn ghost"
                            onClick={() =>
                              window.alert(`Message: ${feedback.message}`)
                            }
                            title="View"
                          >
                            View
                          </button>
                          <button
                            className="feedback-btn ghost"
                            onClick={() => requestDeleteFeedback(feedback)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredFeedbacks().length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "#aaa",
                          padding: "1em 0",
                        }}
                      >
                        No feedback found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
