import React, { useState, useEffect } from 'react';
import { 
  AuditLogEntry, 
  EnhancedGrievance, 
  ExecutiveStats, 
  NotificationItem, 
  SystemUser 
} from '../../types';
import { AdminService } from '../../services/adminService';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { EmployeeDashboardView } from './EmployeeDashboardView';
import { SupervisorDashboardView } from './SupervisorDashboardView';
import { SupervisorGrievancesView } from './SupervisorGrievancesView';
import { StaffManagementView } from './StaffManagementView';
import { ReportsView } from './ReportsView';
import { AuditLogView } from './AuditLogView';
import { SettingsView } from './SettingsView';
import { GrievanceDetailModal } from './GrievanceDetailModal';
import { 
  ApproveCloseModal, 
  AssignModal, 
  DraftResponseModal, 
  InternalNoteModal, 
  RequestInfoModal 
} from './ActionModals';
import { NotificationPanel } from './NotificationPanel';

interface DashboardLayoutProps {
  onExitDashboard: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onExitDashboard }) => {
  // State
  const [currentUser, setCurrentUser] = useState<SystemUser>(AdminService.getCurrentUser());
  const [users, setUsers] = useState<SystemUser[]>(AdminService.getUsers());
  const [grievances, setGrievances] = useState<EnhancedGrievance[]>(AdminService.getAllGrievances());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AdminService.getAuditLogs());
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    AdminService.getNotificationsForUser(AdminService.getCurrentUser())
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'employee' ? 'employee_home' : 'supervisor_home'
  );

  // UI state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Selected Grievance for Dossier Modal
  const [selectedGrievance, setSelectedGrievance] = useState<EnhancedGrievance | null>(null);

  // Action Modals State
  const [assignTarget, setAssignTarget] = useState<EnhancedGrievance | null>(null);
  const [draftTarget, setDraftTarget] = useState<EnhancedGrievance | null>(null);
  const [approveTarget, setApproveTarget] = useState<EnhancedGrievance | null>(null);
  const [requestInfoTarget, setRequestInfoTarget] = useState<EnhancedGrievance | null>(null);
  const [noteTarget, setNoteTarget] = useState<EnhancedGrievance | null>(null);

  // Refresh helper
  const refreshAll = () => {
    const updatedGrievances = AdminService.getAllGrievances();
    setGrievances(updatedGrievances);
    setUsers(AdminService.getUsers());
    setAuditLogs(AdminService.getAuditLogs());
    setNotifications(AdminService.getNotificationsForUser(currentUser));

    // If modal open, refresh it
    if (selectedGrievance) {
      const fresh = updatedGrievances.find(g => g.id === selectedGrievance.id);
      if (fresh) setSelectedGrievance(fresh);
    }
  };

  // Switch User handler
  const handleSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    AdminService.setCurrentUser(user);
    setCurrentUser(user);
    setNotifications(AdminService.getNotificationsForUser(user));

    // Reset default tab according to role
    if (user.role === 'employee') {
      setActiveTab('employee_home');
    } else {
      setActiveTab('supervisor_home');
    }
  };

  // Tab selection sync
  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Notification handlers
  const handleMarkAsRead = (notifId: string) => {
    AdminService.markNotificationAsRead(notifId);
    setNotifications(AdminService.getNotificationsForUser(currentUser));
  };

  const handleMarkAllAsRead = () => {
    AdminService.markAllNotificationsAsRead(currentUser);
    setNotifications(AdminService.getNotificationsForUser(currentUser));
  };

  const handleSelectGrievanceById = (id: string) => {
    const g = grievances.find(item => item.id === id);
    if (g) setSelectedGrievance(g);
  };

  // Workflow Action Handlers
  const handleStartProcessing = (id: string) => {
    AdminService.startProcessing(id, currentUser);
    refreshAll();
  };

  const handleAssignSubmit = (employeeId: string, instructions: string) => {
    if (!assignTarget) return;
    AdminService.assignGrievance(assignTarget.id, employeeId, instructions, currentUser);
    refreshAll();
  };

  const handleDraftResponseSubmit = (responseText: string) => {
    if (!draftTarget) return;
    AdminService.submitDraftResponse(draftTarget.id, responseText, currentUser);
    refreshAll();
  };

  const handleApproveCloseSubmit = (letterNumber: string, revisedText?: string) => {
    if (!approveTarget) return;
    AdminService.approveResponseAndClose(approveTarget.id, letterNumber, revisedText, currentUser);
    refreshAll();
  };

  const handleRequestInfoSubmit = (question: string) => {
    if (!requestInfoTarget) return;
    AdminService.requestAdditionalInfo(requestInfoTarget.id, question, currentUser);
    refreshAll();
  };

  const handleAddInternalNoteSubmit = (note: string) => {
    if (!noteTarget) return;
    AdminService.addInternalNote(noteTarget.id, note, currentUser);
    refreshAll();
  };

  const handleAddUser = (userData: Omit<SystemUser, 'id'>) => {
    AdminService.addUser(userData, currentUser);
    refreshAll();
  };

  const handleToggleUserStatus = (userId: string) => {
    AdminService.toggleUserStatus(userId, currentUser);
    refreshAll();
  };

  // Computed counters
  const executiveStats: ExecutiveStats = AdminService.getExecutiveStats();
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const myGrievances = grievances.filter(g => g.assignedToId === currentUser.id);
  const myNewAssigned = myGrievances.filter(g => g.status === 'تم الإسناد').length;
  const myInProgress = myGrievances.filter(g => g.status === 'قيد المعالجة').length;
  const myOverdue = myGrievances.filter(g => g.isOverdue).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row-reverse text-slate-800 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Sidebar Navigation */}
      <DashboardSidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        unassignedCount={executiveStats.newUnassigned}
        newAssignedCount={myNewAssigned}
        inProgressCount={myInProgress}
        overdueCount={currentUser.role === 'employee' ? myOverdue : executiveStats.overdue}
        onExitDashboard={onExitDashboard}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <DashboardHeader
          currentUser={currentUser}
          users={users}
          onSwitchUser={handleSwitchUser}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotifsCount={unreadNotifsCount}
          onExitDashboard={onExitDashboard}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Employee Home View */}
          {activeTab === 'employee_home' && (
            <EmployeeDashboardView
              currentUser={currentUser}
              grievances={grievances}
              onOpenGrievance={(g) => setSelectedGrievance(g)}
              onStartProcessing={handleStartProcessing}
              onOpenDraftResponse={(g) => setDraftTarget(g)}
            />
          )}

          {/* Employee Tabs */}
          {(activeTab === 'my_grievances' || activeTab === 'new_assigned' || activeTab === 'in_progress' || activeTab === 'pending_review' || activeTab === 'closed') && (
            <EmployeeDashboardView
              currentUser={currentUser}
              grievances={grievances}
              onOpenGrievance={(g) => setSelectedGrievance(g)}
              onStartProcessing={handleStartProcessing}
              onOpenDraftResponse={(g) => setDraftTarget(g)}
            />
          )}

          {/* Supervisor Executive Overview */}
          {activeTab === 'supervisor_home' && (
            <SupervisorDashboardView
              stats={executiveStats}
              grievances={grievances}
              employees={users}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenGrievance={(g) => setSelectedGrievance(g)}
              onOpenAssign={(g) => setAssignTarget(g)}
              onOpenApproveClose={(g) => setApproveTarget(g)}
            />
          )}

          {/* Supervisor Grievances (All / Unassigned / Overdue) */}
          {(activeTab === 'all_grievances' || activeTab === 'unassigned' || activeTab === 'overdue') && (
            <SupervisorGrievancesView
              grievances={grievances}
              employees={users}
              onOpenGrievance={(g) => setSelectedGrievance(g)}
              onOpenAssign={(g) => setAssignTarget(g)}
              onOpenApproveClose={(g) => setApproveTarget(g)}
              initialFilter={activeTab === 'unassigned' ? 'unassigned' : activeTab === 'overdue' ? 'overdue' : 'all'}
            />
          )}

          {/* Staff Management */}
          {activeTab === 'staff' && (
            <StaffManagementView
              currentUser={currentUser}
              employees={users}
              onAddUser={handleAddUser}
              onToggleStatus={handleToggleUserStatus}
            />
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <ReportsView
              stats={executiveStats}
              grievances={grievances}
              employees={users}
            />
          )}

          {/* Audit Log */}
          {activeTab === 'audit_log' && (
            <AuditLogView logs={auditLogs} />
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <SettingsView currentUser={currentUser} />
          )}

        </main>
      </div>

      {/* Slide-over Notifications Panel */}
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectGrievance={handleSelectGrievanceById}
      />

      {/* Dossier Detail Modal */}
      {selectedGrievance && (
        <GrievanceDetailModal
          grievance={selectedGrievance}
          currentUser={currentUser}
          onClose={() => setSelectedGrievance(null)}
          onStartProcessing={handleStartProcessing}
          onOpenAssign={(g) => setAssignTarget(g)}
          onOpenDraftResponse={(g) => setDraftTarget(g)}
          onOpenApproveClose={(g) => setApproveTarget(g)}
          onOpenRequestInfo={(g) => setRequestInfoTarget(g)}
          onOpenAddNote={(g) => setNoteTarget(g)}
        />
      )}

      {/* Workflow Action Modals */}
      {assignTarget && (
        <AssignModal
          grievance={assignTarget}
          employees={users.filter(u => u.role === 'employee' && u.status === 'نشط')}
          isOpen={true}
          onClose={() => setAssignTarget(null)}
          onConfirm={handleAssignSubmit}
        />
      )}

      {draftTarget && (
        <DraftResponseModal
          grievance={draftTarget}
          isOpen={true}
          onClose={() => setDraftTarget(null)}
          onConfirm={handleDraftResponseSubmit}
        />
      )}

      {approveTarget && (
        <ApproveCloseModal
          grievance={approveTarget}
          isOpen={true}
          onClose={() => setApproveTarget(null)}
          onConfirm={handleApproveCloseSubmit}
        />
      )}

      {requestInfoTarget && (
        <RequestInfoModal
          grievance={requestInfoTarget}
          isOpen={true}
          onClose={() => setRequestInfoTarget(null)}
          onConfirm={handleRequestInfoSubmit}
        />
      )}

      {noteTarget && (
        <InternalNoteModal
          grievance={noteTarget}
          isOpen={true}
          onClose={() => setNoteTarget(null)}
          onConfirm={handleAddInternalNoteSubmit}
        />
      )}

    </div>
  );
};
