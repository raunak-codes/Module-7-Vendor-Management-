import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/PageHeader";
import "./admin-tokens.css";
import "./AdminSettings.css";

/**
 * AdminSettings
 * Global platform configuration: user roles, permissions, vendor
 * categories, notification preferences, integrations.
 * Matches Stitch screen: system_settings
 */

const TABS = ["User Roles", "Permissions", "Vendor Categories", "Notification Preferences", "Integrations"];

const ROLES = [
  {
    id: "global-admin",
    icon: "shield_person",
    type: "system",
    title: "Global Admin",
    description: "Full access to all modules, system logs, and security protocols.",
    users: 4,
  },
  {
    id: "event-coordinator",
    icon: "event_available",
    type: "custom",
    title: "Event Coordinator",
    description: "Can create events, manage vendors, and view basic financial analytics.",
    users: 12,
  },
  {
    id: "finance-lead",
    icon: "request_quote",
    type: "custom",
    title: "Finance Lead",
    description: "Dedicated access to Invoices, Payments, and Allocation summaries.",
    users: 3,
  },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("User Roles");

  return (
    <AdminLayout searchPlaceholder="Search system parameters...">
      <div className="admin-page admin-settings-page">
        <PageHeader
          title="System Settings"
          subtitle="Manage global platform configurations, user hierarchies, and integration hooks."
        />

        <div className="admin-card admin-settings__panel">
          {/* Tabs */}
          <div className="admin-settings__tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`admin-settings__tab${activeTab === tab ? " admin-settings__tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "User Roles" ? (
            <div className="admin-settings__body">
              <div className="admin-settings__body-header">
                <h2 className="admin-section-title">Defined User Roles</h2>
                <button className="admin-btn admin-btn--primary">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Create New Role
                </button>
              </div>

              <div className="admin-settings__roles">
                {ROLES.map((role) => (
                  <div className="admin-card admin-settings__role-card" key={role.id}>
                    <div className="admin-settings__role-top">
                      <span className="material-symbols-outlined admin-settings__role-icon">
                        {role.icon}
                      </span>
                      <span
                        className={`admin-settings__role-tag${
                          role.type === "system" ? " admin-settings__role-tag--system" : ""
                        }`}
                      >
                        {role.type === "system" ? "System" : "Custom"}
                      </span>
                    </div>
                    <h3 className="font-headline-sm admin-settings__role-title">{role.title}</h3>
                    <p className="font-body-md admin-settings__role-desc">{role.description}</p>
                    <div className="admin-settings__role-meta font-body-md">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
                      {role.users} Users assigned
                    </div>
                    <div className="admin-settings__role-actions">
                      <button className="admin-btn admin-btn--ghost">Edit Privileges</button>
                      <button className="admin-btn admin-btn--ghost admin-settings__role-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-settings__body admin-settings__empty">
              <p className="font-body-md">No configuration available for "{activeTab}" yet.</p>
            </div>
          )}
        </div>

        <div className="admin-settings__footer">
          <button className="admin-btn admin-btn--outline">Cancel</button>
          <button className="admin-btn admin-btn--primary">Save Changes</button>
        </div>
      </div>
    </AdminLayout>
  );
}
